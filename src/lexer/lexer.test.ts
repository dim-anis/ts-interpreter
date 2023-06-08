import { Lexer } from "./lexer";
import { TokenType } from "src/token/token";

test("test nextToken()", function() {
  const input = `=+(){},;`;

  const tokens = [
    TokenType.ASSIGN,
    TokenType.PLUS,
    TokenType.LPAREN,
    TokenType.RPAREN,
    TokenType.LBRACE,
    TokenType.RBRACE,
    TokenType.COMMA,
    TokenType.SEMICOLON,
  ];

  const lexer = new Lexer(input);

  for (const token of tokens) {
    expect(lexer.nextToken().type).toBe(token);
  }
});
