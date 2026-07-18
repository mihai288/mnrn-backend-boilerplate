import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Meeting } from '../../meetings/schemas/meeting.schema';

export type AttendeeDocument = HydratedDocument<Attendee>;

@Schema({ timestamps: true })
export class Attendee {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true })
  email?: string;

  @Prop({ trim: true })
  role?: string;

  @Prop({ type: Types.ObjectId, ref: Meeting.name, required: true })
  meetingId!: Types.ObjectId;
}

export const AttendeeSchema = SchemaFactory.createForClass(Attendee);
