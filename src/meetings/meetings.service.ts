import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { UpdateTranscriptDto } from './dto/update-transcript.dto';
import { Meeting, MeetingDocument } from './schemas/meeting.schema';
import {
  extractMeetingInsightsFromTranscript,
  type MeetingAiResult,
} from './ai/meeting-ai.service';

@Injectable()
export class MeetingsService {
  private readonly logger = new Logger(MeetingsService.name);

  constructor(
    @InjectModel(Meeting.name) private readonly meetingModel: Model<MeetingDocument>,
    private readonly configService: ConfigService,
  ) {}

  async findAll(userId: string): Promise<MeetingDocument[]> {
    return this.meetingModel.find({ userId }).exec();
  }

  async findOne(userId: string, id: string): Promise<MeetingDocument> {
    const meeting = await this.meetingModel.findOne({ _id: id, userId }).exec();

    if (!meeting) {
      throw new NotFoundException(`Meeting #${id} not found`);
    }

    return meeting;
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
      .findOneAndUpdate({ _id: id, userId }, updateMeetingDto, {
        returnDocument: 'after',
        runValidators: true,
      })
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
        { returnDocument: 'after' },
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

    if (meeting.status === 'processing') {
      return meeting;
    }

    const processingMeeting = await this.meetingModel
      .findOneAndUpdate(
        { _id: id, userId },
        {
          status: 'processing',
          summary: undefined,
          keyPoints: [],
          actionItems: [],
        },
        { returnDocument: 'after' },
      )
      .exec();

    if (!processingMeeting) {
      throw new NotFoundException(`Meeting #${id} not found`);
    }

    void this.processTranscriptInBackground(userId, id, meeting.transcript);

    return processingMeeting;
  }

  private async processTranscriptInBackground(
    userId: string,
    meetingId: string,
    transcript: string,
  ): Promise<void> {
    try {
      const apiKey = this.configService.get<string>('OPENAI_API_KEY')?.trim();
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not configured');
      }

      const aiResult: MeetingAiResult = await extractMeetingInsightsFromTranscript(
        apiKey,
        transcript,
      );

      await this.meetingModel
        .findOneAndUpdate(
          { _id: meetingId, userId },
          {
            status: 'completed',
            summary: aiResult.summary,
            keyPoints: aiResult.keyPoints,
            actionItems: aiResult.actionItems.map((item) => ({
              task: item.task,
              assignee: item.assignee,
              checked: false,
            })),
          },
          { returnDocument: 'after' },
        )
        .exec();
    } catch (error) {
      this.logger.error(
        `Failed to process meeting ${meetingId}: ${error instanceof Error ? error.message : String(error)}`,
      );

      await this.meetingModel
        .findOneAndUpdate(
          { _id: meetingId, userId },
          { status: 'failed' },
          { returnDocument: 'after' },
        )
        .exec();
    }
  }
}
