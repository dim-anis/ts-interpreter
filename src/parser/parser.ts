import { Lexer } from "../lexer/lexer";
import { Token, TokenType } from "../token/token";
import { Program, Statement } from "../ast/ast";

export class Parser {
  private curToken!: Token;
  private peekToken!: Token;

  constructor(private l: Lexer) {
    this.nextToken();
    this.nextToken();
  }

  nextToken() {
    this.curToken = this.peekToken;
    this.peekToken = this.l.nextToken();
  };

  parseProgram(): Program {
    const program = new Program();

    while (this.curToken.type !== TokenType.EOF) {
      const stmt = this.parseStatement();
      if (stmt !== null) {
        program.statements.push(stmt);
      }

      this.nextToken();
    }

    return program;
  }

  parseStatement(): Statement {
    switch (this.curToken.type) {
      case TokenType.LET:
        return this.parseLetStatement();
      default:
        return null;
    }
  }
}
