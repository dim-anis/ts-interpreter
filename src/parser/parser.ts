import { Lexer } from "../lexer/lexer";
import { Token, TokenItem, TokenType } from "../token/token";
import { Expression, Identifier, LetStatement, Program, ReturnStatement, Statement } from "../ast/ast";

type PrefixParseFn = () => Expression;
type InfixParseFn = (expr: Expression) => Expression;

export class Parser {
  private curToken!: Token;
  private peekToken!: Token;
  errors: string[];

  prefixParseFns!: Record<TokenItem, PrefixParseFn>;
  infixParseFns!: Record<TokenItem, InfixParseFn>;

  constructor(private l: Lexer) {
    this.nextToken();
    this.nextToken();
    this.errors = [];
  }

  registerPrefix(tokenType: TokenItem, fn: PrefixParseFn) {
    this.prefixParseFns[tokenType] = fn;
  }

  registerInfix(tokenType: TokenItem, fn: InfixParseFn) {
    this.infixParseFns[tokenType] = fn;
  }

  Errors(): string[] {
    return this.errors;
  }

  peekError(t: TokenItem) {
    const msg = `expected next token to be "${t}", got "${this.peekToken.type}" instead`
    this.errors.push(msg);
  }

  curTokenIs(t: TokenItem): boolean {
    return this.curToken.type === t;
  }

  peekTokenIs(t: TokenItem): boolean {
    return this.peekToken.type === t;
  }

  expectPeek(t: TokenItem): boolean {
    if (this.peekTokenIs(t)) {
      this.nextToken();
      return true;
    }

    this.peekError(t);
    return false;
  }

  nextToken() {
    this.curToken = this.peekToken;
    this.peekToken = this.l.nextToken();
  };

  parseProgram(): Program {
    const program = new Program();
    program.statements = [];

    while (this.curToken.type !== TokenType.EOF) {
      const stmt = this.parseStatement();
      if (stmt !== null) {
        program.statements.push(stmt);
      }

      this.nextToken();
    }

    return program;
  }

  parseStatement(): Statement | null {
    switch (this.curToken.type) {
      case TokenType.LET:
        return this.parseLetStatement();
      case TokenType.RETURN:
        return this.parseReturnStatement();
      default:
        return null;
    }
  }

  parseLetStatement(): LetStatement | null {
    const stmt = new LetStatement(this.curToken);

    if (!this.expectPeek(TokenType.IDENT)) {
      return null;
    }

    stmt.name = new Identifier(this.curToken, this.curToken.literal);

    if (!this.expectPeek(TokenType.ASSIGN)) {
      return null;
    }

    while (!this.curTokenIs(TokenType.SEMICOLON) && !this.curTokenIs(TokenType.EOF)) {
      this.nextToken();
    }

    return stmt;
  }

  parseReturnStatement(): ReturnStatement | null {
    const stmt = new ReturnStatement(this.curToken);

    this.nextToken();

    while (!this.curTokenIs(TokenType.SEMICOLON)) {
      this.nextToken();
    }

    return stmt;
  }
}
