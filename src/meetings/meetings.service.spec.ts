import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MeetingsService } from './meetings.service';
import { Meeting } from './schemas/meeting.schema';

describe('MeetingsService', () => {
  let service: MeetingsService;
  let meetingModel: any;

  beforeEach(async () => {
    meetingModel = Object.assign(
      jest.fn().mockImplementation((data: unknown) => ({
        ...data,
        save: jest.fn().mockResolvedValue(data),
      })),
      {
        find: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findById: jest.fn(),
      },
    );

    const moduleRef = await Test.createTestingModule({
      providers: [
        MeetingsService,
        {
          provide: getModelToken(Meeting.name),
          useValue: meetingModel,
        },
      ],
    }).compile();

    service = moduleRef.get(MeetingsService);
  });

  it('filters meetings by owner id when loading the list', async () => {
    const exec = jest.fn().mockResolvedValue([{ title: 'Owned meeting' }]);
    meetingModel.find.mockReturnValue({ exec });

    await service.findAll('user-123');

    expect(meetingModel.find).toHaveBeenCalledWith({ userId: 'user-123' });
    expect(exec).toHaveBeenCalled();
  });

  it('stores the owner id when creating a meeting', async () => {
    const payload = {
      title: 'Team sync',
      date: '2026-01-01T10:00:00.000Z',
      description: 'Planning',
    };

    const createdMeeting = await service.create('user-123', payload as any);

    expect(createdMeeting).toEqual(
      expect.objectContaining({
        title: 'Team sync',
        userId: 'user-123',
      }),
    );
  });
});
