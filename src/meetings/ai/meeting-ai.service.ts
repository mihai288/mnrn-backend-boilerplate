import { InternalServerErrorException } from '@nestjs/common';

export interface MeetingActionItem {
  task: string;
  assignee: string;
}

export interface MeetingAiResult {
  summary: string;
  keyPoints: string[];
  actionItems: MeetingActionItem[];
}

const SYSTEM_PROMPT = `You are an expert executive assistant and meeting analyst. Your task is to analyze meeting transcripts and extract structured, highly accurate insights.
Return strictly valid JSON without markdown. The top-level object must contain exactly three properties: summary (string), keyPoints (string array), actionItems (array of objects with task and assignee strings).

CRITICAL RULES FOR EXTRACTION:
1. SUMMARY: Write a concise, professional paragraph summarizing the overall context, the main topics discussed, and the final outcome of the meeting.
2. KEY POINTS: Extract the most important decisions, conclusions, or blockers. Focus on business value and final agreements. Do not list every minor conversational detail.
3. ACTION ITEMS & ASSIGNEES:
   - Only create an action item if a specific task, deliverable, or next step is clearly established.
   - Combine multi-step processes related to the same goal into a single task.
   - ONLY assign a task to a specific person if they are explicitly named as the owner or clearly volunteer to do it (e.g., "I will draft the email", "John, please send the report").
   - If a task is discussed as a general team effort (e.g., "we should update the website", "let's run a webinar") without a specific individual taking ownership, set the assignee STRICTLY to "Unassigned".
   - NEVER assume the person suggesting the task is the one executing it unless explicitly stated.
4. LANGUAGE: The output language must match the primary language spoken in the transcript.`;

const USER_PROMPT_PREFIX =
  'Process this meeting transcript and extract structured insights;The output language must match the primary language spoken in the transcript:';
export async function extractMeetingInsightsFromTranscript(
  apiKey: string,
  transcript: string,
): Promise<MeetingAiResult> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'meeting_insights',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              summary: { type: 'string' },
              keyPoints: {
                type: 'array',
                items: { type: 'string' },
              },
              actionItems: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    task: { type: 'string' },
                    assignee: { type: 'string' },
                  },
                  required: ['task', 'assignee'],
                },
              },
            },
            required: ['summary', 'keyPoints', 'actionItems'],
          },
        },
      },
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `${USER_PROMPT_PREFIX}\n\n${transcript}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new InternalServerErrorException(
      `OpenAI request failed with status ${response.status}: ${errorBody}`,
    );
  }

  const completion = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = completion.choices?.[0]?.message?.content;

  if (!content) {
    throw new InternalServerErrorException('OpenAI response did not include JSON content');
  }

  let parsedResult: unknown;
  try {
    parsedResult = JSON.parse(content);
  } catch {
    throw new InternalServerErrorException('OpenAI response was not valid JSON');
  }

  if (!isValidMeetingAiResult(parsedResult)) {
    throw new InternalServerErrorException('OpenAI response JSON does not match required shape');
  }

  return parsedResult;
}

function isValidMeetingAiResult(value: unknown): value is MeetingAiResult {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  const requiredKeys = ['actionItems', 'keyPoints', 'summary'];

  if (keys.length !== requiredKeys.length || !requiredKeys.every((key) => keys.includes(key))) {
    return false;
  }

  if (typeof record.summary !== 'string') {
    return false;
  }

  if (
    !Array.isArray(record.keyPoints) ||
    !record.keyPoints.every((item) => typeof item === 'string')
  ) {
    return false;
  }

  if (
    !Array.isArray(record.actionItems) ||
    !record.actionItems.every((item) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return false;
      }

      const itemRecord = item as Record<string, unknown>;
      const itemKeys = Object.keys(itemRecord).sort();

      return (
        itemKeys.length === 2 &&
        itemKeys[0] === 'assignee' &&
        itemKeys[1] === 'task' &&
        typeof itemRecord.task === 'string' &&
        typeof itemRecord.assignee === 'string'
      );
    })
  ) {
    return false;
  }

  return true;
}
