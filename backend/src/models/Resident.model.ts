import { Schema, model } from 'mongoose';

export interface IResident {
  full_name: string;
  room_number: string;      // e.g. "B-304"
  phone: string;            // e.g. "9820022334"
  createdAt?: Date;
  updatedAt?: Date;
}

const residentSchema = new Schema<IResident>(
  {
    full_name: { type: String, required: true, trim: true },
    room_number: { type: String, required: true, unique: true, trim: true, uppercase: true },
    phone: { type: String, required: true, unique: true, trim: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.created_at = ret.createdAt ? ret.createdAt.toISOString() : undefined;
        return ret;
      },
    },
  }
);

// Compound index for passwordless resident login lookup (room_number + phone)
residentSchema.index({ room_number: 1, phone: 1 });

export const Resident = model<IResident>('Resident', residentSchema);
