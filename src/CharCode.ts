const enum CharCode {
  Backspace = 0x08,
  Tab = 0x09,
  LF = 0x0a,
  FF = 0x0c,
  CR = 0x0d,
  Space = 0x20,

  DoubleQuote = 0x22,
  Plus = 0x2b,
  Comma = 0x2c,
  Minus = 0x2d,
  FullStop = 0x2e,
  Solidus = 0x2f,

  Zero = 0x30,
  One = 0x31,
  Nine = 0x39,
  Colon = 0x3a,

  UcaseA = 0x41,
  UcaseE = 0x45,
  UcaseF = 0x46,

  LBracket = 0x5b,
  Backslash = 0x5c,
  RBracket = 0x5d,

  LcaseA = 0x61,
  LcaseB = 0x62,
  LcaseE = 0x65,
  LcaseF = 0x66,
  LcaseN = 0x6e,
  LcaseR = 0x72,
  LcaseT = 0x74,
  LcaseU = 0x75,

  LBrace = 0x7b,
  RBrace = 0x7d
}

export default CharCode;