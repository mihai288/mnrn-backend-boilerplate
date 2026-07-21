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

  @Prop({ enum: ['idle', 'processing', 'completed', 'failed'], default: 'idle' })
  status!: string;
}

export const MeetingSchema = SchemaFactory.createForClass(Meeting);
