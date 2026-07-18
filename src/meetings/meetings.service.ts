import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateTranscriptDto } from './dto/update-transcript.dto';
import { Meeting, MeetingDocument } from './schemas/meeting.schema';

@Injectable()
export class MeetingsService {
  constructor(@InjectModel(Meeting.name) private readonly meetingModel: Model<MeetingDocument>) {}

  async create(createMeetingDto: CreateMeetingDto): Promise<MeetingDocument> {
    const createdMeeting = new this.meetingModel(createMeetingDto);
    return createdMeeting.save();
  }

  async updateTranscript(
    id: string,
    updateTranscriptDto: UpdateTranscriptDto,
  ): Promise<MeetingDocument> {
    const meeting = await this.meetingModel
      .findByIdAndUpdate(id, { transcript: updateTranscriptDto.transcript }, { new: true })
      .exec();
    if (!meeting) {
      throw new NotFoundException(`Meeting #${id} not found`);
    }
    return meeting;
  }

  async process(id: string): Promise<MeetingDocument> {
    const meeting = await this.meetingModel.findById(id).exec();
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
