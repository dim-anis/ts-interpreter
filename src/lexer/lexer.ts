import { Token, TokenType, KEYWORDS, createNewToken } from "../token/token";

const _0 = "0".charCodeAt(0);
const _9 = "9".charCodeAt(0);

const a = "a".charCodeAt(0);
const z = "z".charCodeAt(0);

const A = "A".charCodeAt(0);
const Z = "Z".charCodeAt(0);

const _ = "_".charCodeAt(0);

function isLetter(character: string): boolean {
  const char = character.charCodeAt(0);
  return a <= char && z >= char || A <= char && Z >= char || char === _;
}

function isNumber(character: string): boolean {
  const char = character.charCodeAt(0);
  return _0 <= char && _9 >= char;
}

export class Lexer {
  private position = 0;
  private readPosition = 0;
  private ch!: string;

  constructor(private input: string) {
    this.readChar();
  }

  private skipWhiteSpace(): void {
    while (this.ch === ' ' || this.ch === '\t' || this.ch === '\r' || this.ch === '\n') {
      this.readChar();
    }
  }

  private readChar(): void {
    if (this.readPosition >= this.input.length) {
      this.ch = '\0';
    } else {
      this.ch = this.input[this.readPosition];
    }
    this.position = this.readPosition;
    this.readPosition += 1;
  }

  private peekChar(): string {
    if (this.readPosition >= this.input.length) {
      return '\0';
    } else {
      return this.input[this.readPosition];
    }
  }

  private readNumber(): string {
    const startPosition = this.position;
    while (isNumber(this.ch)) {
      this.readChar();
    }
    // return the chunk
    return this.input.slice(startPosition, this.position);
  }

  private readIdent(): string {
    const startPosition = this.position;
    while (isLetter(this.ch)) {
      this.readChar();
    }

    return this.input.slice(startPosition, this.position);
  }

  private readString(): string {
    const position = this.position + 1;
    while (true) {
      this.readChar();
      if (this.ch === '"' || this.ch === '\0') {
        break;
      }
    }

    return this.input.slice(position, this.position);
  }

  nextToken(): Token {
    let tok: Token;

    this.skipWhiteSpace();

    switch (this.ch) {
      case '=':
        if (this.peekChar() === '=') {
          const ch = this.ch;
          this.readChar();
          const literal = ch + this.ch;
          tok = createNewToken(TokenType.EQ, literal)
        } else {
          tok = createNewToken(TokenType.ASSIGN, this.ch);
        }
        break;
      case ';':
        tok = createNewToken(TokenType.SEMICOLON, this.ch);
        break;
      case '(':
        tok = createNewToken(TokenType.LPAREN, this.ch);
        break;
      case ')':
        tok = createNewToken(TokenType.RPAREN, this.ch);
        break;
      case '[':
        tok = createNewToken(TokenType.LBRACKET, this.ch);
        break;
      case ']':
        tok = createNewToken(TokenType.RBRACKET, this.ch);
        break;
      case ',':
        tok = createNewToken(TokenType.COMMA, this.ch);
        break;
      case '+':
        tok = createNewToken(TokenType.PLUS, this.ch);
        break;
      case '{':
        tok = createNewToken(TokenType.LBRACE, this.ch);
        break;
      case '}':
        tok = createNewToken(TokenType.RBRACE, this.ch);
        break;
      case '-':
        tok = createNewToken(TokenType.MINUS, this.ch);
        break;
      case '!':
        if (this.peekChar() === '=') {
          const ch = this.ch;
          this.readChar();
          const literal = ch + this.ch;
          tok = createNewToken(TokenType.NOT_EQ, literal);
        } else {
          tok = createNewToken(TokenType.BANG, this.ch);
        }
        break;
      case '/':
        tok = createNewToken(TokenType.SLASH, this.ch);
        break;
      case '*':
        tok = createNewToken(TokenType.ASTERISK, this.ch);
        break;
      case '<':
        tok = createNewToken(TokenType.LT, this.ch);
        break;
      case '>':
        tok = createNewToken(TokenType.GT, this.ch);
        break;
      case '\0':
        tok = createNewToken(TokenType.EOF, '');
        break;
      case '"':
        tok = createNewToken(TokenType.STRING, this.readString());
        break;
      default:
        if (isLetter(this.ch)) {
          const literal = this.readIdent();
          const keyword = KEYWORDS[literal as keyof typeof KEYWORDS];
          if (keyword) {
            return keyword;
          } else {
            tok = createNewToken(TokenType.IDENT, literal);
            return tok;
          }
        } else if (isNumber(this.ch)) {
          tok = createNewToken(TokenType.INT, this.readNumber());
          return tok;
        } else {
          tok = createNewToken(TokenType.ILLEGAL, this.ch);
          return tok;
        }
    }

    this.readChar();
    return tok;
  }
}
