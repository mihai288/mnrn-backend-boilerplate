import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { Attendee, AttendeeDocument } from './schemas/attendee.schema';

@Injectable()
export class AttendeesService {
  constructor(
    @InjectModel(Attendee.name) private readonly attendeeModel: Model<AttendeeDocument>,
  ) {}

  async create(createAttendeeDto: CreateAttendeeDto): Promise<AttendeeDocument> {
    const createdAttendee = new this.attendeeModel({
      ...createAttendeeDto,
      meetingId: new Types.ObjectId(createAttendeeDto.meetingId),
    });
    return createdAttendee.save();
  }
}
