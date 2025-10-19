import { ObjectId } from 'mongodb';

export interface Paper {
  _id?: ObjectId;
  title: string;
  authors?: string;
  year?: string;
  link?: string;
  summary?: string;
  abstract?: string;
  doi?: string;
  status: 'not-reviewed' | 'in-progress' | 'reviewed';
  addedBy: string;
  addedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  notes?: string;
  tags?: string[];
}

export interface PaperInput {
  title: string;
  authors?: string;
  year?: string;
  link?: string;
  summary?: string;
  addedBy: string;
  notes?: string;
  tags?: string[];
}
