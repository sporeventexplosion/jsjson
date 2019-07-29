// in the order [input, pos]
export type ParserState = [string, number];

// parses a value
export type ParseFn<T> = (input: ParserState) => [T, ParserState];

export type SignedDigits = {
  sign: boolean;
  digits: number[];
};
