import { ParserState, ParseFn, SignedDigits } from './types';
import CharCode from './CharCode';
import {
  isWhitespace,
  isValidEscapedCharater,
  isHexDigit,
  hexDigitToNumber,
  stringEscapeToChar,
  isDigit,
  digitToNumber,
  isIntegerStart,
} from './charutil';
import { decimalToDouble } from './decimalToDouble';
import { Errors, throwParseError } from './errors';

export const isEof = ([input, pos]: ParserState) => pos >= input.length;

// get the charCode at the current position
export const getcc = ([input, pos]: ParserState) => input.charCodeAt(pos);

export const next = ([input, pos]: ParserState): ParserState => [
  input,
  pos + 1,
];

export const advanceBy = (
  [input, pos]: ParserState,
  n: number
): ParserState => [input, pos + n];

export const getRemainingChars = ([input, pos]: ParserState) =>
  input.length - pos;

export const skipWhitespace = ([input, beginPos]: ParserState): ParserState => {
  let pos = beginPos;

  while (pos < input.length && isWhitespace(input.charCodeAt(pos))) {
    pos++;
  }

  return [input, pos];
};

export const parse = (input: string): any => {
  const [result, state] = parseElement([input, 0]);
  if (!isEof(state)) {
    return throwParseError(state, Errors.UnexpectedCharacter);
  }

  return result;
};

export const parseString: ParseFn<string> = s0 => {
  let result = '';
  let state = next(s0);
  while (true) {
    if (isEof(state)) {
      return throwParseError(state, Errors.UnexpectedEof);
    }

    const init = getcc(state);
    state = next(state);
    if (init < CharCode.Space) {
      return throwParseError(state, Errors.UnexpectedCharacter);
    }
    if (init === CharCode.DoubleQuote) {
      return [result, state];
    }
    if (init === CharCode.Backslash) {
      if (isEof(state)) {
        return throwParseError(state, Errors.UnexpectedEof);
      }
      const escaped = getcc(state);
      state = next(state);
      if (!isValidEscapedCharater(escaped)) {
        return throwParseError(state, Errors.UnexpectedCharacter);
      }

      if (escaped === CharCode.LcaseU) {
        if (getRemainingChars(state) < 4) {
          return throwParseError(state, Errors.InvalidHexEscape);
        }
        let charCode = 0;
        for (let i = 0; i < 4; i++) {
          const digit = getcc(state);
          if (!isHexDigit(digit)) {
            return throwParseError(state, Errors.InvalidHexEscape);
          }
          charCode = (charCode << 4) + hexDigitToNumber(digit);
          state = next(state);
        }
        result += String.fromCharCode(charCode);
      } else {
        result += stringEscapeToChar(escaped);
      }
    } else {
      result += String.fromCharCode(init);
    }
  }
};

export const parseInteger: ParseFn<SignedDigits> = s0 => {
  let state = s0;
  let sign = false;
  const digits = [];

  let init = getcc(state);
  if (init === CharCode.Minus) {
    sign = true;
    state = next(state);

    if (isEof(state)) {
      return throwParseError(state, Errors.UnexpectedEof);
    }
    init = getcc(state);
  }

  if (!isDigit(init)) {
    return throwParseError(state, Errors.UnexpectedCharacter);
  }
  digits.push(digitToNumber(init));
  state = next(state);

  if (init === CharCode.Zero) {
    return [{ sign, digits }, state];
  }

  while (!isEof(state)) {
    const ch = getcc(state);
    if (!isDigit(ch)) {
      break;
    }
    digits.push(digitToNumber(ch));
    state = next(state);
  }

  return [{ sign, digits }, state];
};

export const parseDigits: ParseFn<number[]> = s0 => {
  let state = s0;
  const digits = [];

  while (!isEof(state)) {
    const ch = getcc(state);
    if (!isDigit(ch)) {
      break;
    }
    digits.push(digitToNumber(ch));
    state = next(state);
  }

  return [digits, state];
};

export const parseNumber: ParseFn<number> = s0 => {
  let integerPart, state;
  [integerPart, state] = parseInteger(s0);
  let fractionalPart: number[] | undefined;
  let exponent: SignedDigits | undefined;

  if (!isEof(state) && getcc(state) === CharCode.FullStop) {
    state = next(state);

    if (isEof(state)) {
      throwParseError(state, Errors.UnexpectedEof);
    }
    if (!isDigit(getcc(state))) {
      throwParseError(state, Errors.UnexpectedCharacter);
    }
    [fractionalPart, state] = parseDigits(state);
  }

  if (!isEof(state)) {
    const expCh = getcc(state);
    if (expCh === CharCode.UcaseE || expCh === CharCode.LcaseE) {
      state = next(state);
      if (isEof(state)) {
        throwParseError(state, Errors.UnexpectedEof);
      }
      let expInit = getcc(state);
      let expSign = false;
      if (expInit === CharCode.Minus || expInit === CharCode.Plus) {
        expSign = expInit === CharCode.Minus;
        state = next(state);
        if (isEof(state)) {
          throwParseError(state, Errors.UnexpectedEof);
        }
        expInit = getcc(state);
      }
      if (!isDigit(expInit)) {
        throwParseError(state, Errors.UnexpectedCharacter);
      }
      let expDigits;
      [expDigits, state] = parseDigits(state);
      exponent = {
        sign: expSign,
        digits: expDigits,
      };
    }
  }

  return [decimalToDouble(integerPart, fractionalPart, exponent), state];
};

export const parseKeyword: ParseFn<true | false | null> = state => {
  const [input, pos] = state;
  if (getRemainingChars(state) >= 4) {
    if (input.substr(pos, 4) === 'true') {
      return [true, advanceBy(state, 4)];
    }
    if (input.substr(pos, 4) === 'null') {
      return [null, advanceBy(state, 4)];
    }
  }
  if (getRemainingChars(state) >= 5 && input.substr(pos, 5) === 'false') {
    return [false, advanceBy(state, 5)];
  }

  return throwParseError(state, Errors.UnexpectedCharacter);
};

export const keyValuesToObject = (keyValues: Array<[string, any]>): object => {
  const ret: { [k: string]: any } = {};
  for (const [k, v] of keyValues) {
    ret[k] = v;
  }
  return ret;
};

export const parseObject: ParseFn<object> = s0 => {
  const keyValues: Array<[string, any]> = [];

  let state = next(s0);
  let first = true;

  while (true) {
    if (isEof(state)) {
      return throwParseError(state, Errors.UnexpectedEof);
    }

    if (first) {
      state = skipWhitespace(state);
      if (isEof(state)) {
        return throwParseError(state, Errors.UnexpectedEof);
      }
    }
    const init = getcc(state);
    if (init === CharCode.RBrace) {
      return [keyValuesToObject(keyValues), next(state)];
    }
    if (first) {
      first = false;
    } else if (init === CharCode.Comma) {
      state = next(state);
      state = skipWhitespace(state);
    } else {
      return throwParseError(state, Errors.UnexpectedCharacter);
    }

    if (isEof(state)) {
      return throwParseError(state, Errors.UnexpectedEof);
    }
    if (getcc(state) !== CharCode.DoubleQuote) {
      return throwParseError(state, Errors.UnexpectedCharacter);
    }

    let key;
    [key, state] = parseString(state);
    state = skipWhitespace(state);
    if (isEof(state)) {
      return throwParseError(state, Errors.UnexpectedEof);
    }
    if (getcc(state) !== CharCode.Colon) {
      return throwParseError(state, Errors.UnexpectedCharacter);
    }
    state = next(state);

    let value;
    [value, state] = parseElement(state);

    keyValues.push([key, value]);
  }
};

export const parseArray: ParseFn<any[]> = s0 => {
  const ret: any[] = [];
  let first = true;
  let state = next(s0);

  while (true) {
    if (first) {
      state = skipWhitespace(state);
    }
    if (isEof(state)) {
      return throwParseError(state, Errors.UnexpectedEof);
    }

    const init = getcc(state);
    if (init === CharCode.RBracket) {
      return [ret, next(state)];
    }
    if (first) {
      first = false;
    } else if (init === CharCode.Comma) {
      state = next(state);
    } else {
      return throwParseError(state, Errors.UnexpectedCharacter);
    }

    let element;
    [element, state] = parseElement(state);
    ret.push(element);
  }
};

export const parseElement: ParseFn<any> = s0 => {
  const s1 = skipWhitespace(s0);
  const [value, s2] = parseValue(s1);
  const s3 = skipWhitespace(s2);

  return [value, s3];
};

export const parseValue: ParseFn<any> = state => {
  if (isEof(state)) {
    throwParseError(state, Errors.UnexpectedEof);
  }

  const init = getcc(state);
  if (
    init === CharCode.LcaseF ||
    init === CharCode.LcaseN ||
    init === CharCode.LcaseT
  ) {
    return parseKeyword(state);
  }
  if (init === CharCode.LBrace) {
    return parseObject(state);
  }
  if (init === CharCode.LBracket) {
    return parseArray(state);
  }
  if (init === CharCode.DoubleQuote) {
    return parseString(state);
  }
  if (isIntegerStart(init)) {
    return parseNumber(state);
  }

  return throwParseError(state, Errors.UnexpectedCharacter);
};
