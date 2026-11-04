import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  ContactShadows,
  Html,
  Instances,
  Instance,
  OrbitControls,
  RoundedBox,
  useCursor,
} from '@react-three/drei';
import { useReducedMotion } from 'motion/react';
import * as THREE from 'three';
import { formatPlate } from '../../lib/utils.ts';

type Vec3 = [number, number, number];

const CAR_PLATE = 'MH02AB4821';
const ROAD_Z = 0.7;
const GATE_Z = 1.55;

function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function WindowBank({
  width,
  depth,
  height,
  floors,
  columns,
  side,
  seed,
}: {
  width: number;
  depth: number;
  height: number;
  floors: number;
  columns: number;
  side?: boolean;
  seed: number;
}) {
  const windows = useMemo(() => {
    const items: Array<{ position: Vec3; lit: boolean }> = [];
    const spread = (side ? depth : width) - 0.42;
    const step = floors > 1 ? (height - 0.72) / (floors - 1) : 0;

    for (let row = 0; row < floors; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const across =
          columns > 1 ? -spread / 2 + (spread / (columns - 1)) * column : 0;
        const position: Vec3 = side
          ? [width / 2 + 0.012, 0.34 + row * step, across]
          : [across, 0.34 + row * step, depth / 2 + 0.012];

        items.push({
          position,
          lit: (row * 3 + column * 5 + seed) % 4 !== 0,
        });
      }
    }

    return items;
  }, [columns, depth, floors, height, seed, side, width]);

  return (
    <group>
      <Instances limit={windows.length} range={windows.length}>
        <boxGeometry args={[0.105, 0.12, 0.024]} />
        <meshStandardMaterial
          color="#F4C46F"
          emissive="#E9A64A"
          emissiveIntensity={0.75}
          roughness={0.55}
        />
        {windows.map((window, index) =>
          window.lit ? (
            <Instance key={`lit-${index}`} position={window.position} />
          ) : null
        )}
      </Instances>

      <Instances limit={windows.length} range={windows.length}>
        <boxGeometry args={[0.105, 0.12, 0.024]} />
        <meshStandardMaterial color="#314B3B" roughness={0.45} />
        {windows.map((window, index) =>
          window.lit ? null : (
            <Instance key={`dark-${index}`} position={window.position} />
          )
        )}
      </Instances>
    </group>
  );
}

function Tower({
  position,
  width,
  height,
  depth,
  floors,
  columns,
  sideColumns,
  seed,
}: {
  position: Vec3;
  width: number;
  height: number;
  depth: number;
  floors: number;
  columns: number;
  sideColumns: number;
  seed: number;
}) {
  return (
    <group position={position}>
      <RoundedBox
        args={[width, height, depth]}
        radius={0.075}
        smoothness={3}
        position={[0, height / 2, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#E7DDC8" roughness={0.72} />
      </RoundedBox>

      <RoundedBox
        args={[width * 0.9, 0.13, depth * 0.9]}
        radius={0.04}
        smoothness={2}
        position={[0, height + 0.055, 0]}
        castShadow
      >
        <meshStandardMaterial color="#294E38" roughness={0.62} />
      </RoundedBox>

      <WindowBank
        width={width}
        depth={depth}
        height={height}
        floors={floors}
        columns={columns}
        seed={seed}
      />
      <WindowBank
        width={width}
        depth={depth}
        height={height}
        floors={floors}
        columns={sideColumns}
        side
        seed={seed + 2}
      />

      <mesh
        position={[width * 0.22, height + 0.27, -depth * 0.18]}
        castShadow
      >
        <cylinderGeometry args={[0.14, 0.14, 0.3, 12]} />
        <meshStandardMaterial color="#41664A" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Tree({
  position,
  scale = 1,
}: {
  position: Vec3;
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.055, 0.56, 7]} />
        <meshStandardMaterial color="#765A3D" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.74, 0]} castShadow>
        <icosahedronGeometry args={[0.31, 0]} />
        <meshStandardMaterial color="#3E6643" roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0.16, 0.59, 0.04]} castShadow>
        <icosahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial color="#4C744D" roughness={0.85} flatShading />
      </mesh>
    </group>
  );
}

function StreetLamp({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.78, 0]} castShadow>
        <cylinderGeometry args={[0.022, 0.035, 1.56, 8]} />
        <meshStandardMaterial color="#203A2B" roughness={0.55} />
      </mesh>
      <mesh position={[0, 1.59, 0]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial
          color="#FFE4A6"
          emissive="#FFC971"
          emissiveIntensity={2.2}
        />
      </mesh>
    </group>
  );
}

function GateArm({ reduceMotion }: { reduceMotion: boolean }) {
  const arm = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!arm.current) return;

    if (reduceMotion) {
      arm.current.rotation.z = 0;
      return;
    }

    const time = state.clock.getElapsedTime();
    const opening = easeInOutCubic(clamp01((time - 0.55) / 0.9));
    const closing = easeInOutCubic(clamp01((time - 4.6) / 1.2));
    const lift = clamp01(opening - closing);

    arm.current.rotation.z = -lift * (Math.PI / 2);
  });

  return (
    <group
      ref={arm}
      position={[1.08, 1.03, GATE_Z - 0.06]}
      rotation={[0, 0, 0]}
    >
      <mesh position={[-0.9, 0, 0]} castShadow>
        <boxGeometry args={[1.8, 0.045, 0.055]} />
        <meshStandardMaterial color="#F0E5CF" roughness={0.55} />
      </mesh>
      <mesh position={[-1.56, 0, 0]} castShadow>
        <boxGeometry args={[0.38, 0.052, 0.06]} />
        <meshStandardMaterial color="#B54D37" roughness={0.5} />
      </mesh>
      <mesh position={[-0.12, 0, 0]}>
        <boxGeometry args={[0.09, 0.1, 0.08]} />
        <meshStandardMaterial color="#203A2B" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Car({ reduceMotion }: { reduceMotion: boolean }) {
  const car = useRef<THREE.Group>(null);
  const wheels = useRef<Array<THREE.Mesh | null>>([]);
  const lastZ = useRef(3.4);
  const [hovered, setHovered] = useState(false);
  const [open, setOpen] = useState(false);
  useCursor(hovered);

  useFrame((state, delta) => {
    if (!car.current) return;

    if (reduceMotion) {
      car.current.position.z = 0.35;
      lastZ.current = 0.35;
      return;
    }

    const time = state.clock.getElapsedTime();
    const progress = easeInOutCubic(clamp01((time - 1.35) / 3.1));
    const nextZ = 3.4 - 3.05 * progress;
    const travel = Math.abs(nextZ - lastZ.current);

    car.current.position.z = nextZ;
    lastZ.current = nextZ;

    if (travel > 0.0001) {
      wheels.current.forEach((wheel) => {
        if (wheel) wheel.rotation.y += delta * 9;
      });
    }
  });

  return (
    <group
      ref={car}
      position={[0, 0.1, 3.4]}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(event) => {
        event.stopPropagation();
        setOpen((current) => !current);
      }}
    >
      <RoundedBox
        args={[0.66, 0.22, 1.13]}
        radius={0.075}
        smoothness={3}
        position={[0, 0.31, 0]}
        castShadow
      >
        <meshStandardMaterial color="#F1E8D4" roughness={0.48} />
      </RoundedBox>

      <RoundedBox
        args={[0.54, 0.22, 0.54]}
        radius={0.06}
        smoothness={3}
        position={[0, 0.5, -0.06]}
        castShadow
      >
        <meshStandardMaterial
          color="#20382A"
          roughness={0.35}
          metalness={0.18}
        />
      </RoundedBox>

      <mesh position={[0, 0.44, -0.33]}>
        <boxGeometry args={[0.5, 0.025, 0.01]} />
        <meshStandardMaterial
          color="#D8F0E2"
          emissive="#C8EAD5"
          emissiveIntensity={1.8}
        />
      </mesh>

      {[-0.32, 0.32].map((x) =>
        [-0.35, 0.36].map((z) => (
          <group
            key={`${x}-${z}`}
            position={[x, 0.17, z]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <mesh
              ref={(node) => {
                const index = (x < 0 ? 0 : 2) + (z < 0 ? 0 : 1);
                wheels.current[index] = node;
              }}
              castShadow
            >
              <cylinderGeometry args={[0.135, 0.135, 0.085, 18]} />
              <meshStandardMaterial color="#1D211D" roughness={0.9} />
            </mesh>
          </group>
        ))
      )}

      {[-0.2, 0.2].map((x) => (
        <mesh key={`head-${x}`} position={[x, 0.34, -0.575]}>
          <boxGeometry args={[0.09, 0.05, 0.012]} />
          <meshStandardMaterial
            color="#FFF2CA"
            emissive="#FFD98A"
            emissiveIntensity={2.4}
          />
        </mesh>
      ))}

      {[-0.22, 0.22].map((x) => (
        <mesh key={`tail-${x}`} position={[x, 0.35, 0.57]}>
          <boxGeometry args={[0.07, 0.035, 0.01]} />
          <meshStandardMaterial
            color="#D15E44"
            emissive="#8D2F21"
            emissiveIntensity={1.1}
          />
        </mesh>
      ))}

      <pointLight
        position={[0, 0.4, -0.72]}
        intensity={1.4}
        distance={2.1}
        color="#FFE0A0"
      />

      {open ? (
        <Html
          position={[0, 0.98, -0.08]}
          center
          zIndexRange={[40, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="w-[238px] rounded-xl border border-white/25 bg-[#F7F2E7] p-3 text-[#111111] shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#2C5E3B]">
                  Sample match
                </p>
                <p className="mt-1 font-mono text-sm font-bold tracking-wide">
                  {formatPlate(CAR_PLATE)}
                </p>
              </div>
              <span className="rounded-md bg-[#E6EFE3] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#2C5E3B]">
                Resident
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#DDD5C5] pt-2.5 text-[11px]">
              <div>
                <p className="text-[9px] uppercase tracking-wider text-[#77756D]">
                  Owner
                </p>
                <p className="mt-0.5 font-semibold">Priya Nair</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-[#77756D]">
                  Flat
                </p>
                <p className="mt-0.5 font-mono font-semibold">B-304</p>
              </div>
            </div>
            <p className="mt-2.5 flex items-center justify-between border-t border-[#DDD5C5] pt-2 text-[10px] text-[#66635B]">
              <span>Honda City</span>
              <span className="font-mono font-bold text-[#2C5E3B]">P-24</span>
            </p>
          </div>
        </Html>
      ) : null}
    </group>
  );
}

function CameraFraming() {
  const { camera, size } = useThree();

  useEffect(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const fit = aspect < 0.82 ? 1.16 : aspect < 1.02 ? 1.07 : 1;

    camera.position.set(6.8 * fit, 5.15 * fit, 9.15 * fit);
    camera.lookAt(0, 0.72, 0);
    camera.updateProjectionMatrix();
  }, [camera, size.height, size.width]);

  return null;
}

function SceneControls() {
  const { size } = useThree();

  if (size.width < 720) return null;

  return (
    <OrbitControls
      makeDefault
      target={[0, 0.75, 0]}
      enablePan={false}
      enableZoom={false}
      minPolarAngle={0.92}
      maxPolarAngle={1.26}
      minAzimuthAngle={-0.42}
      maxAzimuthAngle={0.42}
      enableDamping
      dampingFactor={0.055}
      rotateSpeed={0.42}
    />
  );
}

function SceneContent({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <>
      <CameraFraming />
      <color attach="background" args={['#163525']} />
      <fog attach="fog" args={['#163525', 15, 28]} />

      <ambientLight intensity={0.82} color="#E8F0DF" />
      <hemisphereLight
        args={['#DDEBD1', '#193324', 0.85]}
        position={[0, 8, 0]}
      />
      <directionalLight
        position={[5.2, 9.5, 6.8]}
        intensity={2.25}
        color="#FFF1D2"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={24}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={7}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <spotLight
        position={[-4.8, 7.2, 4.8]}
        angle={0.55}
        penumbra={1}
        intensity={26}
        color="#CFE7BF"
        distance={24}
      />
      <pointLight
        position={[0, 1.65, GATE_Z + 0.1]}
        intensity={7}
        distance={5.5}
        color="#FFD18A"
      />

      <group>
        <RoundedBox
          args={[6.6, 0.36, 6.6]}
          radius={0.11}
          smoothness={4}
          position={[0, -0.18, 0]}
          receiveShadow
          castShadow
        >
          <meshStandardMaterial color="#D9D0BC" roughness={0.82} />
        </RoundedBox>
        <RoundedBox
          args={[6.2, 0.09, 6.2]}
          radius={0.085}
          smoothness={3}
          position={[0, 0.015, 0]}
          receiveShadow
        >
          <meshStandardMaterial color="#2A4A35" roughness={0.76} />
        </RoundedBox>

        <mesh
          position={[0, 0.068, ROAD_Z]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[1.35, 4.25]} />
          <meshStandardMaterial color="#C9C0AB" roughness={0.88} />
        </mesh>

        {[2.65, 1.99, 0.86, 0.2, -0.56, -1.12].map((z) => (
          <mesh key={z} position={[0, 0.077, z]}>
            <boxGeometry args={[0.035, 0.006, 0.23]} />
            <meshStandardMaterial color="#F4ECD9" roughness={0.75} />
          </mesh>
        ))}

        <mesh position={[2.2, 0.07, 1.35]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.9, 0.84]} />
          <meshStandardMaterial color="#34523E" roughness={0.9} />
        </mesh>

        <mesh position={[-2.72, 0.07, 1.3]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.4, 1.6]} />
          <meshStandardMaterial color="#34523E" roughness={0.9} />
        </mesh>

        <mesh position={[0, 0.19, -3.12]} castShadow receiveShadow>
          <boxGeometry args={[6.1, 0.32, 0.12]} />
          <meshStandardMaterial color="#E3D9C5" roughness={0.8} />
        </mesh>
        <mesh position={[-3.12, 0.19, 0.65]} castShadow receiveShadow>
          <boxGeometry args={[0.12, 0.32, 4.4]} />
          <meshStandardMaterial color="#E3D9C5" roughness={0.8} />
        </mesh>

        <Tower
          position={[-1.95, 0.055, -1.95]}
          width={1.8}
          height={2.45}
          depth={1.34}
          floors={6}
          columns={4}
          sideColumns={3}
          seed={1}
        />
        <Tower
          position={[1.83, 0.055, -2.05]}
          width={1.55}
          height={2.0}
          depth={1.28}
          floors={5}
          columns={3}
          sideColumns={3}
          seed={4}
        />
        <Tower
          position={[-2.38, 0.055, 0.45]}
          width={1.07}
          height={1.56}
          depth={1.56}
          floors={4}
          columns={3}
          sideColumns={3}
          seed={7}
        />

        <group position={[2.23, 0.055, 0.67]}>
          <RoundedBox
            args={[1.15, 0.82, 1.55]}
            radius={0.06}
            smoothness={3}
            position={[0, 0.41, 0]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color="#E6DCC7" roughness={0.74} />
          </RoundedBox>
          <RoundedBox
            args={[1.04, 0.08, 1.44]}
            radius={0.03}
            smoothness={2}
            position={[0, 0.86, 0]}
            castShadow
          >
            <meshStandardMaterial color="#2B4D38" roughness={0.6} />
          </RoundedBox>
          <mesh position={[0, 0.46, 0.781]}>
            <planeGeometry args={[0.62, 0.22]} />
            <meshStandardMaterial
              color="#FFD895"
              emissive="#EAA352"
              emissiveIntensity={0.9}
            />
          </mesh>
        </group>

        <group position={[-1.15, 0, GATE_Z]}>
          <mesh position={[0, 0.68, 0]} castShadow>
            <boxGeometry args={[0.17, 1.36, 0.17]} />
            <meshStandardMaterial color="#E9DFCA" roughness={0.65} />
          </mesh>
        </group>
        <group position={[1.15, 0, GATE_Z]}>
          <mesh position={[0, 0.68, 0]} castShadow>
            <boxGeometry args={[0.17, 1.36, 0.17]} />
            <meshStandardMaterial color="#E9DFCA" roughness={0.65} />
          </mesh>
        </group>
        <mesh position={[0, 1.37, GATE_Z]} castShadow>
          <boxGeometry args={[2.47, 0.16, 0.2]} />
          <meshStandardMaterial color="#294E38" roughness={0.62} />
        </mesh>
        <mesh position={[0, 1.22, GATE_Z + 0.16]}>
          <boxGeometry args={[0.74, 0.22, 0.035]} />
          <meshStandardMaterial color="#F2E7D2" roughness={0.64} />
        </mesh>
        {[-0.42, 0.42].map((x) => (
          <mesh key={`gate-light-${x}`} position={[x, 1.24, GATE_Z + 0.18]}>
            <sphereGeometry args={[0.052, 10, 10]} />
            <meshStandardMaterial
              color="#FFE6AF"
              emissive="#FFC66E"
              emissiveIntensity={2.4}
            />
          </mesh>
        ))}

        <group position={[1.88, 0.055, 2.05]}>
          <RoundedBox
            args={[0.84, 0.9, 0.76]}
            radius={0.055}
            smoothness={3}
            position={[0, 0.45, 0]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color="#E7DDC8" roughness={0.7} />
          </RoundedBox>
          <RoundedBox
            args={[0.92, 0.08, 0.84]}
            radius={0.03}
            smoothness={2}
            position={[0, 0.92, 0]}
            castShadow
          >
            <meshStandardMaterial color="#2B4D38" roughness={0.6} />
          </RoundedBox>
          <mesh position={[-0.421, 0.52, 0]}>
            <planeGeometry args={[0.32, 0.24]} />
            <meshStandardMaterial
              color="#FFD895"
              emissive="#EAA352"
              emissiveIntensity={0.85}
            />
          </mesh>
        </group>

        <GateArm reduceMotion={reduceMotion} />
        <Car reduceMotion={reduceMotion} />

        <Tree position={[-2.82, 0.055, 2.24]} scale={1.08} />
        <Tree position={[2.7, 0.055, -1.1]} scale={0.88} />
        <Tree position={[-2.1, 0.055, 2.6]} scale={0.78} />
        <Tree position={[2.72, 0.055, 2.5]} scale={0.72} />

        <StreetLamp position={[-0.84, 0.055, 2.86]} />
        <StreetLamp position={[0.84, 0.055, -0.92]} />

        <ContactShadows
          position={[0, -0.36, 0]}
          scale={12}
          opacity={0.32}
          blur={2.8}
          far={4.5}
          frames={1}
          color="#08160D"
        />
      </group>
    </>
  );
}

export default function SocietyScene() {
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <Canvas
      shadows
      dpr={[1, 1.7]}
      camera={{ position: [6.8, 5.15, 9.15], fov: 36, near: 0.1, far: 42 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
      style={{
        background: '#163525',
        touchAction: 'pan-y',
        cursor: 'grab',
      }}
      role="img"
      aria-label="Interactive 3D model of the SHEETALDHARA society gate at dusk"
    >
      <SceneContent reduceMotion={reduceMotion} />
      <SceneControls />
    </Canvas>
  );
}
