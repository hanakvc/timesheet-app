import { Injectable, PipeTransform } from '@nestjs/common';
import { ValidationFailedException } from './validation-failed.exception.js';

@Injectable()
export class ParseIdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const id = Number(value);
    if (!/^\d+$/.test(value) || !Number.isSafeInteger(id)) {
      throw new ValidationFailedException(
        { id: 'Must be a whole number of 0 or more.' },
        'The id in the URL is invalid.',
      );
    }
    return id;
  }
}
