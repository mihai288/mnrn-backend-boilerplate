import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { UpdateTranscriptDto } from './dto/update-transcript.dto';
import { Meeting, MeetingDocument } from './schemas/meeting.schema';

@Injectable()
export class MeetingsService {
  constructor(@InjectModel(Meeting.name) private readonly meetingModel: Model<MeetingDocument>) {}

  async findAll(userId: string): Promise<MeetingDocument[]> {
    return this.meetingModel.find({ userId }).exec();
  }

  async create(userId: string, createMeetingDto: CreateMeetingDto): Promise<MeetingDocument> {
    const createdMeeting = new this.meetingModel({
      ...createMeetingDto,
      attendees: createMeetingDto.attendees ?? [],
      userId,
    });
    return createdMeeting.save();
  }

  async update(
    userId: string,
    id: string,
    updateMeetingDto: UpdateMeetingDto,
  ): Promise<MeetingDocument> {
    if (Object.keys(updateMeetingDto).length === 0) {
      throw new BadRequestException('At least one field is required for update');
    }

    const meeting = await this.meetingModel
      .findOneAndUpdate({ _id: id, userId }, updateMeetingDto, { new: true, runValidators: true })
      .exec();

    if (!meeting) {
      throw new NotFoundException(`Meeting #${id} not found`);
    }

    return meeting;
  }

  async updateTranscript(
    userId: string,
    id: string,
    updateTranscriptDto: UpdateTranscriptDto,
  ): Promise<MeetingDocument> {
    const meeting = await this.meetingModel
      .findOneAndUpdate(
        { _id: id, userId },
        { transcript: updateTranscriptDto.transcript },
        { new: true },
      )
      .exec();
    if (!meeting) {
      throw new NotFoundException(`Meeting #${id} not found`);
    }
    return meeting;
  }

  async process(userId: string, id: string): Promise<MeetingDocument> {
    const meeting = await this.meetingModel.findOne({ _id: id, userId }).exec();
    if (!meeting) {
      throw new NotFoundException(`Meeting #${id} not found`);
    }

    if (!meeting.transcript || !meeting.transcript.trim()) {
      throw new BadRequestException('Transcript is required before processing');
    }

    meeting.status = 'processing';
    return meeting.save();
  }
}
