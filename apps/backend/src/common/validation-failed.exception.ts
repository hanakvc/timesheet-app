import { BadRequestException, ValidationError } from '@nestjs/common';

export class ValidationFailedException extends BadRequestException {
  constructor(
    readonly fields: Record<string, string>,
    message = 'Some fields need attention',
  ) {
    super(message);
  }

  static fromValidationErrors(
    errors: ValidationError[],
  ): ValidationFailedException {
    const fields: Record<string, string> = {};
    for (const error of errors) {
      const messages = Object.values(error.constraints ?? {});
      fields[error.property] = messages[0] ?? 'Invalid value';
    }
    return new ValidationFailedException(fields);
  }
}
