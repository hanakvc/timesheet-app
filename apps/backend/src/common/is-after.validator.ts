import { registerDecorator, ValidationArguments } from 'class-validator';

export function IsAfter(otherProperty: string, message: string) {
  return (target: object, propertyName: string) => {
    registerDecorator({
      name: 'isAfter',
      target: target.constructor,
      propertyName,
      constraints: [otherProperty],
      options: { message },
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const other = (args.object as Record<string, unknown>)[otherProperty];
          if (typeof value !== 'string' || typeof other !== 'string') {
            return true;
          }
          return Date.parse(value) > Date.parse(other);
        },
      },
    });
  };
}
