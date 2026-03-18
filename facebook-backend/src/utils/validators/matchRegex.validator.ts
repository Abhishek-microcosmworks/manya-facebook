import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'MatchRegex' })
export class MatchRegexConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const strongRegex = new RegExp(args.constraints[0]);
    return typeof value === 'string' && strongRegex.test(value);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be at least 8 characters long, alphanumeric, and include 1 uppercase letter, 1 lowercase letter, and 1 special character (!@#$%^&*).`;
  }
}

export function MatchRegex(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'MatchRegex',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: MatchRegexConstraint,
    });
  };
}
