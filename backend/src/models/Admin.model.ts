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
        // Never let the bcrypt hash leave the database layer. This transform also
        // feeds req.user in parseSession(), so anything left in `ret` is reachable
        // for the whole request lifecycle.
        delete ret.password_hash;
        ret.id = ret._id.toString();
        ret.role = 'ADMIN';
        ret.created_at = ret.createdAt ? ret.createdAt.toISOString() : undefined;
        return ret;
      },
    },
  }
);

// phone is already indexed by its `unique: true` above.
export const Admin = model<IAdmin>('Admin', adminSchema);
