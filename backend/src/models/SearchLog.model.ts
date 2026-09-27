import { Schema, model, Types } from 'mongoose';

export interface ISearchLog {
  query_term: string;
  searched_by_type: 'resident' | 'admin' | 'watchman';
  searched_by_id: Types.ObjectId | string;
  matched_plate?: string;
  match_source?: 'registered' | 'outsider' | 'none';
  // A last-4 search can return many vehicles. Recording only the first match made
  // the audit trail understate what the searcher actually saw.
  match_count?: number;
  matched_plates?: string[];
  createdAt?: Date;
}

const searchLogSchema = new Schema<ISearchLog>(
  {
    query_term: { type: String, required: true },
    searched_by_type: { type: String, enum: ['resident', 'admin', 'watchman'], required: true },
    searched_by_id: { type: Schema.Types.Mixed, required: true },
    matched_plate: { type: String },
    match_source: { type: String, enum: ['registered', 'outsider', 'none'] },
    match_count: { type: Number, default: 0 },
    matched_plates: { type: [String], default: [] },
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
