import { Schema, model } from 'mongoose';

export interface IAdmin {
  full_name: string;
  phone: string;
  password_hash: string;
  room_number?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const adminSchema = new Schema<IAdmin>(
  {
    full_name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password_hash: { type: String, required: true },
    room_number: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.role = 'ADMIN';
        ret.created_at = ret.createdAt ? ret.createdAt.toISOString() : undefined;
        return ret;
      },
    },
  }
);

adminSchema.index({ phone: 1 });

export const Admin = model<IAdmin>('Admin', adminSchema);
