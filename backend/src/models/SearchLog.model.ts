import { Schema, model, Types } from 'mongoose';

export interface ISearchLog {
  query_term: string;
  searched_by_type: 'resident' | 'admin' | 'watchman';
  searched_by_id: Types.ObjectId | string;
  matched_plate?: string;
  match_source?: 'registered' | 'outsider' | 'none';
  createdAt?: Date;
}

const searchLogSchema = new Schema<ISearchLog>(
  {
    query_term: { type: String, required: true },
    searched_by_type: { type: String, enum: ['resident', 'admin', 'watchman'], required: true },
    searched_by_id: { type: Schema.Types.Mixed, required: true },
    matched_plate: { type: String },
    match_source: { type: String, enum: ['registered', 'outsider', 'none'] },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
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

export const SearchLog = model<ISearchLog>('SearchLog', searchLogSchema);
