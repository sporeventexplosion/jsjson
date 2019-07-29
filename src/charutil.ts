import CharCode from './CharCode';

export const isWhitespace = (cc: number) => {
  // Matches '\t', '\n', '\r', ' '
  return (
    cc === CharCode.Tab ||
    cc === CharCode.LF ||
    cc === CharCode.CR ||
    cc === CharCode.Space
  );
};

export const isValidEscapedCharater = (cc: number) =>
  cc === CharCode.DoubleQuote ||
  cc === CharCode.Backslash ||
  cc === CharCode.Solidus ||
  cc === CharCode.LcaseB ||
  cc === CharCode.LcaseF ||
  cc === CharCode.LcaseN ||
  cc === CharCode.LcaseR ||
  cc === CharCode.LcaseT ||
  cc === CharCode.LcaseU;

export const isDigit = (cc: number) =>
  cc >= CharCode.Zero && cc <= CharCode.Nine;

export const isHexDigit = (cc: number) =>
  isDigit(cc) ||
  (cc >= CharCode.UcaseA && cc <= CharCode.UcaseF) ||
  (cc >= CharCode.LcaseA && cc <= CharCode.LcaseF);

export const hexDigitToNumber = (cc: number) => {
  if (isDigit(cc)) {
    return cc - CharCode.Zero;
  }
  if (cc >= CharCode.UcaseA && cc <= CharCode.UcaseF) {
    return 10 + cc - CharCode.UcaseA;
  }
  if (cc >= CharCode.LcaseA && cc <= CharCode.LcaseF) {
    return 10 + cc - CharCode.LcaseA;
  }
  throw new TypeError('Not a hexadecimal digit');
};

export const stringEscapeToChar = (cc: number) => {
  switch (cc) {
    case CharCode.DoubleQuote:
      return '"';
    case CharCode.Backslash:
      return '\\';
    case CharCode.Solidus:
      return '/';
    case CharCode.LcaseB:
      return '\b';
    case CharCode.LcaseF:
      return '\f';
    case CharCode.LcaseN:
      return '\n';
    case CharCode.LcaseR:
      return '\r';
    case CharCode.LcaseT:
      return '\t';
    default:
      // this should never occur
      throw new TypeError('Not a valid escape character');
  }
};

export const digitToNumber = (cc: number) => cc - CharCode.Zero;

export const isIntegerStart = (cc: number) => cc === CharCode.Minus || isDigit(cc);
