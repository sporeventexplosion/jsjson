import { ParserState } from './types';

export const Errors = {
  UnexpectedEof: 'Unexpected end of input',
  UnexpectedCharacter: 'Unexpected character',
  InvalidHexEscape: 'Invalid hex escape'
};

// TODO: add error position info
export const throwParseError = (state: ParserState, error: string) => {
  const [, pos] = state;
  throw new TypeError(`${error} at position ${pos}`);
};
