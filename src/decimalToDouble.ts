import { SignedDigits } from './types';

// Leading zeros are ignored
export const parseInteger = (digits: number[], sign: boolean): number => {
  let ret = 0;
  for (const digit of digits) {
    ret = ret * 10 + digit;
  }

  return sign ? -ret : ret;
};

export const decimalToDouble = (
  integerPart: SignedDigits,
  fractionalPart: number[] | undefined,
  exponent: SignedDigits | undefined
): number => {
  // const exponentN =
  //   exponent === undefined ? 0 : parseInteger(exponent.digits, exponent.sign);
  // TODO: write a custom number parsing function (hard)
  // This temporary hack will be very slow
  return parseFloat(
    (integerPart.sign ? '-' : '') +
      integerPart.digits.join('') +
      (fractionalPart ? '.' + fractionalPart.join('') : '') +
      (exponent
        ? 'e' + (exponent.sign ? '-' : '+') + exponent.digits.join('')
        : '')
  );
};
