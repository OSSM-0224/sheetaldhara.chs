import { Schema, model, Types } from 'mongoose';

export interface IOutsiderVehicle {
  plate: string;
  plate_raw: string;
  vehicle_type: 'car' | 'bike' | 'other';
  owner_phone: string;
  owner_name?: string;
  note?: string;
  added_by_watchman_id: Types.ObjectId;
  status: 'inside' | 'exited';
  exited_at?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const outsiderVehicleSchema = new Schema<IOutsiderVehicle>(
  {
    plate: { type: String, required: true, trim: true, uppercase: true },
    plate_raw: { type: String, required: true, trim: true },
    vehicle_type: {
      type: String,
      enum: ['car', 'bike', 'other', 'CAR', 'BIKE', 'OTHER'],
      required: true,
      set: (v: string) => (v ? v.toLowerCase() : v),
    },
    owner_phone: { type: String, required: true, trim: true },
    owner_name: { type: String, trim: true },
    note: { type: String, trim: true },
    added_by_watchman_id: { type: Schema.Types.ObjectId, ref: 'Watchman', required: true },
    status: { type: String, enum: ['inside', 'exited'], default: 'inside' },
    exited_at: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        // See Vehicle.model.ts: populated refs arrive here as document objects, so
        // toString() would produce "[object Object]". Read _id off the populated doc.
        ret.added_by_watchman_id = ret.added_by_watchman_id?._id
          ? ret.added_by_watchman_id._id.toString()
          : ret.added_by_watchman_id?.toString();
        ret.vehicle_type = ret.vehicle_type ? ret.vehicle_type.toUpperCase() : ret.vehicle_type;
        ret.last_four_digits = ret.plate ? ret.plate.slice(-4) : '';
        ret.added_at = ret.createdAt ? ret.createdAt.toISOString() : undefined;
        ret.exited_at = ret.exited_at ? ret.exited_at.toISOString() : null;
        return ret;
      },
    },
  }
);

outsiderVehicleSchema.index({ plate: 1 });
outsiderVehicleSchema.index({ added_by_watchman_id: 1, status: 1 });

export const OutsiderVehicle = model<IOutsiderVehicle>('OutsiderVehicle', outsiderVehicleSchema);
