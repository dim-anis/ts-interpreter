import { Lexer } from "./lexer";
import { TokenType } from "../token/token";

test("test nextToken()", function() {
  const input = `
let i = 0;
x == y;
x != y;
`;

  const tokens = [
    TokenType.LET,
    TokenType.IDENT,
    TokenType.ASSIGN,
    TokenType.INT,
    TokenType.SEMICOLON,
    TokenType.IDENT,
    TokenType.EQ,
    TokenType.IDENT,
    TokenType.SEMICOLON,
    TokenType.IDENT,
    TokenType.NOT_EQ,
    TokenType.IDENT,
    TokenType.SEMICOLON
    // TokenType.EOF
    // TokenType.ASSIGN,
    // TokenType.PLUS,
    // TokenType.LPAREN,
    // TokenType.RPAREN,
    // TokenType.LBRACE,
    // TokenType.RBRACE,
    // TokenType.COMMA,
    // TokenType.SEMICOLON,
    // TokenType.EQ
  ];

  const lexer = new Lexer(input);

  for (const token of tokens) {
    expect(lexer.nextToken().type).toBe(token);
  }
});
