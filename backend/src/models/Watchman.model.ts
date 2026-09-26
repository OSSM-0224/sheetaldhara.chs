import { Schema, model } from 'mongoose';

export interface IWatchman {
  full_name: string;
  phone: string;
  password_hash: string;
  is_active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const watchmanSchema = new Schema<IWatchman>(
  {
    full_name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password_hash: { type: String, required: true },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.status = ret.is_active ? 'active' : 'inactive';
        ret.role = 'WATCHMAN';
        ret.created_at = ret.createdAt ? ret.createdAt.toISOString() : undefined;
        return ret;
      },
    },
  }
);

watchmanSchema.index({ phone: 1 });

export const Watchman = model<IWatchman>('Watchman', watchmanSchema);
