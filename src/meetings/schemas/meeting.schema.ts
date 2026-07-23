import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MeetingDocument = HydratedDocument<Meeting>;

@Schema({ timestamps: true })
export class Meeting {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true })
  date!: Date;

  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true })
  transcript?: string;

  @Prop({
    type: [
      {
        name: { type: String, trim: true, required: true },
        email: { type: String, trim: true },
        role: { type: String, trim: true },
      },
    ],
    default: [],
  })
  attendees!: Array<{ name: string; email?: string; role?: string }>;

  @Prop({ enum: ['idle', 'processing', 'completed', 'failed'], default: 'idle' })
  status!: string;

  @Prop({ trim: true })
  summary?: string;

  @Prop({ type: [String], default: [] })
  keyPoints!: string[];

  @Prop({
    type: [
      {
        task: { type: String, trim: true, required: true },
        assignee: { type: String, trim: true, required: true },
        checked: { type: Boolean, default: false, required: true },
      },
    ],
    default: [],
  })
  actionItems!: Array<{ task: string; assignee: string; checked: boolean }>;
}

export const MeetingSchema = SchemaFactory.createForClass(Meeting);
