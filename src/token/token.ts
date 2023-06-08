export const TokenType = {
  ILLEGAL: "ILLEGAL",
  EOF: "",

  IDENT: "IDENT",
  INT: "INT",

  ASSIGN: "=",
  PLUS: "+",
  MINUS: "-",
  BANG: "!",
  ASTERISK: "*",
  SLASH: "/",

  LT: "<",
  GT: ">",

  COMMA: ",",
  SEMICOLON: ";",

  LPAREN: "(",
  RPAREN: ")",
  LBRACE: "{",
  RBRACE: "}",

  FUNCTION: "FUNCTION",
  LET: "LET",
  TRUE: "TRUE",
  FALSE: "FALSE",
  IF: "IF",
  ELSE: "ELSE",
  RETURN: "RETURN",

  EQ: "==",
  NOT_EQ: "!=",
} as const;

type TokenItem = typeof TokenType[keyof typeof TokenType];

export const KEYWORDS = {
  'fn': createNewToken(TokenType.FUNCTION, 'fn'),
  'let': createNewToken(TokenType.LET, 'let'),
  'true': createNewToken(TokenType.TRUE, 'true'),
  'false': createNewToken(TokenType.FALSE, 'false'),
  'if': createNewToken(TokenType.IF, 'if'),
  'else': createNewToken(TokenType.ELSE, 'else'),
  'return': createNewToken(TokenType.RETURN, 'return'),
} as const;

export type Token = {
  type: TokenItem,
  literal: string;
}

export function createNewToken(tokenType: TokenItem, ch: string): Token {
  return { type: tokenType, literal: ch }
}
