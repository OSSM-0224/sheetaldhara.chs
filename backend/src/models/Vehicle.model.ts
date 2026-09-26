import { Schema, model, Types } from 'mongoose';

export interface IVehicle {
  resident_id: Types.ObjectId;
  vehicle_type: 'car' | 'bike' | 'other';
  brand: string;
  model: string;
  color?: string;
  plate: string;             // normalized, e.g. "MH02AB4821"
  plate_raw: string;         // as originally entered
  parking_number?: string;   // e.g. "P-24", only for cars typically
  createdAt?: Date;
  updatedAt?: Date;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    resident_id: { type: Schema.Types.ObjectId, ref: 'Resident', required: true },
    vehicle_type: {
      type: String,
      enum: ['car', 'bike', 'other', 'CAR', 'BIKE', 'OTHER'],
      required: true,
      set: (v: string) => (v ? v.toLowerCase() : v),
    },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    color: { type: String, trim: true },
    plate: { type: String, required: true, unique: true, trim: true, uppercase: true },
    plate_raw: { type: String, required: true, trim: true },
    parking_number: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.resident_id = ret.resident_id ? ret.resident_id.toString() : ret.resident_id;
        ret.vehicle_type = ret.vehicle_type ? ret.vehicle_type.toUpperCase() : ret.vehicle_type;
        ret.normalized_plate = ret.plate;
        ret.last_four_digits = ret.plate ? ret.plate.slice(-4) : '';
        ret.created_at = ret.createdAt ? ret.createdAt.toISOString() : undefined;
        return ret;
      },
    },
  }
);

// CRITICAL: index on plate — this is the single most important index in the whole app,
// since every search hits this field.
vehicleSchema.index({ plate: 1 });
vehicleSchema.index({ resident_id: 1 });

export const Vehicle = model<IVehicle>('Vehicle', vehicleSchema);
