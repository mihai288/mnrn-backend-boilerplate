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
}

export const MeetingSchema = SchemaFactory.createForClass(Meeting);
