import { Body, Controller, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateTranscriptDto } from './dto/update-transcript.dto';
import { MeetingsService } from './meetings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('meetings')
@UseGuards(JwtAuthGuard)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  create(@Body() createMeetingDto: CreateMeetingDto) {
    return this.meetingsService.create(createMeetingDto);
  }

  @Patch(':id/transcript')
  updateTranscript(@Param('id') id: string, @Body() updateTranscriptDto: UpdateTranscriptDto) {
    return this.meetingsService.updateTranscript(id, updateTranscriptDto);
  }

  @Post(':id/process')
  process(@Param('id') id: string) {
    return this.meetingsService.process(id);
  }
}
