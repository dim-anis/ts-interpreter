import { Lexer } from "../lexer/lexer";
import { Token, TokenItem, TokenType } from "../token/token";
import { Expression, ExpressionStatement, Identifier, IntegralLiteral, LetStatement, Program, ReturnStatement, Statement } from "../ast/ast";

enum Precedence {
  LOWEST = 1,
  EQUALS,
  LESSGREATER,
  SUM,
  PRODUCT,
  PREFIX,
  CALL
}

type PrefixParseFn = () => Expression | null;
type InfixParseFn = (expr: Expression) => Expression;

export class Parser {
  private _curToken!: Token;
  private _peekToken!: Token;
  _errors: string[] = [];

  prefixParseFns!: Map<TokenItem, PrefixParseFn>;
  infixParseFns!: Map<TokenItem, InfixParseFn>;

  constructor(private l: Lexer) {
    this.nextToken();
    this.nextToken();
    this.prefixParseFns = new Map<TokenItem, PrefixParseFn>();
    this.registerPrefix(TokenType.IDENT, this.parseIdentifier.bind(this));
    this.registerPrefix(TokenType.INT, this.parseIntegralLiteral.bind(this));
  }

  registerPrefix(tokenType: TokenItem, fn: PrefixParseFn) {
    this.prefixParseFns.set(tokenType, fn);
  }

  registerInfix(tokenType: TokenItem, fn: InfixParseFn) {
    this.infixParseFns.set(tokenType, fn);
  }

  errors(): string[] {
    return this._errors;
  }

  peekError(t: TokenItem) {
    const msg = `expected next token to be "${t}", got "${this._peekToken.type}" instead`
    this._errors.push(msg);
  }

  curTokenIs(t: TokenItem): boolean {
    return this._curToken.type === t;
  }

  peekTokenIs(t: TokenItem): boolean {
    return this._peekToken.type === t;
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
    this._curToken = this._peekToken;
    this._peekToken = this.l.nextToken();
  };

  parseProgram(): Program {
    const program = new Program();
    program.statements = [];

    while (this._curToken.type !== TokenType.EOF) {
      const stmt = this.parseStatement();
      if (stmt !== null) {
        program.statements.push(stmt);
      }

      this.nextToken();
    }

    return program;
  }

  parseExpression(precedence: number): Expression | null {
    const prefix = this.prefixParseFns.get(this._curToken.type);
    if (prefix === undefined) {
      return null;
    }

    const leftExp = prefix();

    return leftExp;
  }

  parseIdentifier(): Expression {
    return new Identifier(this._curToken, this._curToken.literal);
  }

  parseStatement(): Statement | null {
    switch (this._curToken.type) {
      case TokenType.LET:
        return this.parseLetStatement();
      case TokenType.RETURN:
        return this.parseReturnStatement();
      default:
        return this.parseExpressionStatement();
    }
  }

  parseLetStatement(): LetStatement | null {
    const stmt = new LetStatement(this._curToken);

    if (!this.expectPeek(TokenType.IDENT)) {
      return null;
    }

    stmt.name = new Identifier(this._curToken, this._curToken.literal);

    if (!this.expectPeek(TokenType.ASSIGN)) {
      return null;
    }

    while (!this.curTokenIs(TokenType.SEMICOLON) && !this.curTokenIs(TokenType.EOF)) {
      this.nextToken();
    }

    return stmt;
  }

  parseReturnStatement(): ReturnStatement | null {
    const stmt = new ReturnStatement(this._curToken);

    this.nextToken();

    while (!this.curTokenIs(TokenType.SEMICOLON)) {
      this.nextToken();
    }

    return stmt;
  }

  parseExpressionStatement(): ExpressionStatement {
    const stmt = new ExpressionStatement(this._curToken);

    stmt.expression = this.parseExpression(Precedence.LOWEST);

    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken();
    }

    return stmt;
  }

  parseIntegralLiteral(): Expression | null {
    const literal = new IntegralLiteral(this._curToken);

    const value = parseInt(this._curToken.literal);

    if (isNaN(value)) {
      this._errors.push(`could not parse ${this._curToken.literal} as an integer`);
      return null;
    }

    literal.value = value;

    return literal;
  }
}
