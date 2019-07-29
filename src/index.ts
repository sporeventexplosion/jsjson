/* type Value = object | any[] | string | number | boolean | null;

const ErrorMessages = {
  UnexpectedEof: 'Unexpected end of input',
  UnexpectedCharacter: 'Unexpected character',
  InvalidHexEscape: 'Invalid hex escape',
};

const enum CharCode {
  Backspace = 0x08,
  Tab = 0x09,
  LF = 0x0a,
  FF = 0x0c,
  CR = 0x0d,
  Space = 0x20,

  DoubleQuote = 0x22,
  Minus = 0x2d,
  FullStop = 0x2e,
  Solidus = 0x2f,

  Zero = 0x30,
  One = 0x31,
  Nine = 0x39,

  UcaseA = 0x41,
  UcaseF = 0x46,

  LBracket = 0x5b,
  Backslash = 0x5c,
  RBracket = 0x5d,

  LcaseA = 0x61,
  LcaseB = 0x62,
  LcaseF = 0x66,
  LcaseN = 0x6e,
  LcaseR = 0x72,
  LcaseT = 0x74,
  LcaseU = 0x75,

  LBrace = 0x7b,
  RBrace = 0x7d,
}

type Integer = {
  // true is negative
  sign: boolean;
  digits: number[];
};

function isWhitespace(cc: number) {
  // Matches '\t', '\n', '\r', ' '
  return (
    cc === CharCode.Tab ||
    cc === CharCode.LF ||
    cc === CharCode.CR ||
    cc === CharCode.Space
  );
}

function isNonzeroDigit(cc: number) {
  return cc >= CharCode.One && cc <= CharCode.Nine;
}

function isDigit(cc: number) {
  return cc >= CharCode.Zero && cc <= CharCode.Nine;
}

function isHexDigit(cc: number) {
  return (
    isDigit(cc) ||
    (cc >= CharCode.UcaseA && cc <= CharCode.UcaseF) ||
    (cc >= CharCode.LcaseA && cc <= CharCode.LcaseF)
  );
}

function keyValuesToObject(kv: Array<[string, object]>): object {
  const ret: { [key: string]: any } = {};
  for (const [key, value] of kv) {
    ret[key] = value;
  }

  return ret;
}

function isValidEscapedCharater(cc: number) {
  return (
    cc === CharCode.DoubleQuote ||
    cc === CharCode.Backslash ||
    cc === CharCode.Solidus ||
    cc === CharCode.LcaseB ||
    cc === CharCode.LcaseF ||
    cc === CharCode.LcaseN ||
    cc === CharCode.LcaseR ||
    cc === CharCode.LcaseT
  );
}

function stringEscapeToChar(cc: number) {
  switch (cc) {
    case CharCode.DoubleQuote:
      return '"';
    case CharCode.Backslash:
      return '\\';
    case CharCode.Solidus:
      return '/';
    case CharCode.Backspace:
      return '\b';
    case CharCode.FF:
      return '\f';
    case CharCode.LF:
      return '\n';
    case CharCode.CR:
      return '\r';
    case CharCode.Tab:
      return '\t';
    default:
      // this should never occur
      throw new TypeError('Not a valid escape character');
  }
}

function digitToNumber(cc: number) {
  return cc - CharCode.Zero;
}

function hexDigitToNumber(cc: number) {
  if (isDigit(cc)) {
    return cc - CharCode.Zero;
  }
  if (cc >= CharCode.UcaseA && cc <= CharCode.UcaseF) {
    return 10 + CharCode.UcaseA - cc;
  }
  if (cc >= CharCode.LcaseA && cc <= CharCode.LcaseF) {
    return 10 + CharCode.LcaseA - cc;
  }
  throw new TypeError('Not a hexadecimal digit');
}

function isIntegerStart(cc: number) {
  return cc === CharCode.Minus || isDigit(cc);
}

export class Parser {
  private readonly input: string;
  private pos: number;
  constructor(input: string) {
    this.input = input;
    this.pos = 0;
  }
  public parse(): Value {
    return parseElement();
  }
  private throwParseError(msg: string): never {
    throw new TypeError(msg);
  }
  private isEof(): boolean {
    return this.pos >= this.input.length;
  }
  private skipWhitespace() {
    const { input } = this;
    let { pos } = this;

    while (pos < input.length && isWhitespace(input.charCodeAt(pos))) {
      pos++;
    }

    this.pos = pos;
  }
  private parseElement(): Value {
    this.skipWhitespace();
    const ret = this.parseValue();
    this.skipWhitespace();

    return ret;
  }
  private parseValue(): Value {
    const { input } = this;
    let { pos } = this;

    if (this.isEof()) {
      this.throwParseError(ErrorMessages.UnexpectedEof);
    }

    const init = input.charCodeAt(pos);

    // 'f', 'n', 't' (for "false", "null", and "true")
    if (
      init === CharCode.LcaseF ||
      init === CharCode.LcaseN ||
      init === CharCode.LcaseT
    ) {
      return this.parseKeyword();
    }
    // '{' (for objects)
    if (init === CharCode.LBrace) {
      return this.parseObject();
    }
    // '[' (for arrays)
    if (init === CharCode.LBracket) {
      return this.parseArray();
    }
    // '"' (for strings)
    if (init === CharCode.DoubleQuote) {
      return this.parseString();
    }
    if (isIntegerStart(init)) {
      return this.parseNumber();
    }
    return this.throwParseError(ErrorMessages.UnexpectedCharacter);
  }
  private parseKeyword(): boolean | null {
    const { input } = this;
    let { pos } = this;

    if (input.length - pos >= 5 && input.substr(pos, 5) === 'false') {
      this.pos += 5;
      return false;
    }

    if (input.length - pos >= 4) {
      if (input.substr(pos, 4) === 'true') {
        this.pos += 4;
        return true;
      }
      if (input.substr(pos, 4) === 'null') {
        this.pos += 4;
        return null;
      }
    }
    return this.throwParseError(ErrorMessages.UnexpectedCharacter);
  }
  private parseObject(): object {
    const { input } = this;
    this.pos++;

    let first = true;

    // the JSON standard doesn't require unique values and keys
    // We first produce an array of [key, value] pairs, and then convert the
    // array to an object
    const keyValues: Array<[string, any]> = [];
  }
  private parseString(): string {
    // We assume that the input is valid UTF-16 and as such do not check
    // surrogate pairs
    let { pos } = this;
    const { input } = this;

    pos++;
    let result = '';

    while (true) {
      if (input.length - pos < 1) {
        return this.throwParseError(ErrorMessages.UnexpectedEof);
      }

      const init = input.charCodeAt(pos);
      pos++;
      if (init === CharCode.DoubleQuote) {
        this.pos = pos;

        return result;
      }
      if (init === CharCode.Backslash) {
        if (input.length - pos < 1) {
          return this.throwParseError(ErrorMessages.UnexpectedEof);
        }

        const escaped = input.charCodeAt(pos);
        if (!isValidEscapedCharater(escaped)) {
          return this.throwParseError(ErrorMessages.UnexpectedCharacter);
        }
        if (escaped === CharCode.LcaseU) {
          // hex unicode escape
          pos++;
          if (input.length - pos < 4) {
            return this.throwParseError(ErrorMessages.InvalidHexEscape);
          }
          let charCode = 0;
          for (let i = 0; i < 4; i++, pos++) {
            const digit = input.charCodeAt(pos);
            if (!isHexDigit(digit)) {
              return this.throwParseError(ErrorMessages.InvalidHexEscape);
            }
            charCode = (charCode << 4) + hexDigitToNumber(digit);
          }
          result += String.fromCharCode(charCode);
        } else {
          result += stringEscapeToChar(escaped);
        }
      } else {
        result += String.fromCharCode(init);
      }
    }
  }
  private parseInteger(): Integer {
    const { input } = this;
    let { pos } = this;

    let sign = false;
    const digits = [];

    let init = input.charCodeAt(pos);
    if (init === CharCode.Minus) {
      sign = true;
      pos++;

      if (input.length - pos < 1) {
        return this.throwParseError(ErrorMessages.UnexpectedEof);
      }
      init = input.charCodeAt(pos);
    }

    if (!isDigit(init)) {
      return this.throwParseError(ErrorMessages.UnexpectedCharacter);
    }

    if (init === CharCode.Zero) {
      digits.push(0);

      this.pos = pos;
      return { sign, digits };
    }

    while (input.length - pos > 0) {
      const ch = input.charCodeAt(pos);
      if (!isDigit(ch)) {
        break;
      }
      digits.push(digitToNumber(ch));
    }

    this.pos = pos;
    return { sign, digits };
  }
  private parseNumber(): number {
    const intPart = this.parseInteger();
    let fracPart: Integer | null = null;
    if (
      !this.isEof() &&
      this.input.charCodeAt(this.pos) === CharCode.FullStop
    ) {
      this.pos++;
      if (this.isEof() || !isIntegerStart(this.input.charCodeAt(this.pos))) {
        return this.throwParseError(ErrorMessages.UnexpectedCharacter);
      }

      fracPart = 3;
    }
  }
}
 */
