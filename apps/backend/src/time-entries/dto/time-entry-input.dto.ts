import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { IsAfter } from '../../common/is-after.validator.js';

export const COMMENT_MAX_LENGTH = 1000;

export const VALIDATION_MESSAGES = {
  taskRequired: 'Task selection is required.',
  commentRequired: 'Comment is required.',
  commentTooLong: `Comment must be ${COMMENT_MAX_LENGTH} characters or fewer.`,
  startInvalid: 'Start must be a valid date and time.',
  endInvalid: 'End must be a valid date and time.',
  endAfterStart: 'End must be after start.',
} as const;

export class TimeEntryInputDto {
  @ApiProperty({ example: 405 })
  @IsInt({ message: VALIDATION_MESSAGES.taskRequired })
  @Min(0, { message: VALIDATION_MESSAGES.taskRequired })
  taskId: number;

  @ApiProperty({
    example: 'Reviewed export edge cases',
    maxLength: COMMENT_MAX_LENGTH,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: VALIDATION_MESSAGES.commentRequired })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.commentRequired })
  @MaxLength(COMMENT_MAX_LENGTH, {
    message: VALIDATION_MESSAGES.commentTooLong,
  })
  comment: string;

  @ApiProperty({ example: '2026-10-30T09:00:00.000Z', description: 'ISO 8601' })
  @IsISO8601({ strict: true }, { message: VALIDATION_MESSAGES.startInvalid })
  start: string;

  @ApiProperty({
    example: '2026-10-30T10:30:00.000Z',
    description: 'ISO 8601, after start',
  })
  @IsISO8601({ strict: true }, { message: VALIDATION_MESSAGES.endInvalid })
  @IsAfter('start', VALIDATION_MESSAGES.endAfterStart)
  end: string;
}
