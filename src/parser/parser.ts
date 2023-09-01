import { Lexer } from "../lexer/lexer";
import { Token, TokenItem, TokenType } from "../token/token";
import { Expression, ExpressionStatement, Identifier, InfixExpression, IntegralLiteral, LetStatement, PrefixExpression, Program, ReturnStatement, Statement } from "../ast/ast";

type PrefixParseFn = () => Expression | null;
type InfixParseFn = (expr: Expression) => Expression | null;

enum Precedence {
  LOWEST = 1,
  EQUALS,
  LESSGREATER,
  SUM,
  PRODUCT,
  PREFIX,
  CALL
}

const precedences = new Map<TokenItem, Precedence>();
precedences.set(TokenType.EQ, Precedence.EQUALS)
precedences.set(TokenType.NOT_EQ, Precedence.EQUALS)
precedences.set(TokenType.LT, Precedence.LESSGREATER)
precedences.set(TokenType.GT, Precedence.LESSGREATER)
precedences.set(TokenType.PLUS, Precedence.SUM)
precedences.set(TokenType.MINUS, Precedence.SUM)
precedences.set(TokenType.SLASH, Precedence.PRODUCT)
precedences.set(TokenType.ASTERISK, Precedence.PRODUCT)

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
    this.registerPrefix(TokenType.BANG, this.parsePrefixExpression.bind(this));
    this.registerPrefix(TokenType.MINUS, this.parsePrefixExpression.bind(this));

    this.infixParseFns = new Map<TokenItem, InfixParseFn>();
    this.registerInfix(TokenType.PLUS, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.MINUS, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.SLASH, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.ASTERISK, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.EQ, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.NOT_EQ, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.LT, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.GT, this.parseInfixExpression.bind(this));
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

  peekPrecedence(): number {
    return precedences.get(this._peekToken.type) || Precedence.LOWEST;
  }

  curPrecedence(): number {
    return precedences.get(this._curToken.type) || Precedence.LOWEST;
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
      this.noPrefixParseFnError(this._curToken.type);
      return null;
    }

    let leftExp = prefix();

    while ((!this.peekTokenIs(TokenType.SEMICOLON)) && (precedence < this.peekPrecedence())) {
      const infix = this.infixParseFns.get(this._peekToken.type);
      if (infix === undefined) {
        return leftExp;
      }

      this.nextToken();

      if (leftExp) {
        leftExp = infix(leftExp);
      }
    }

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

  parsePrefixExpression(): Expression | null {
    const expression = new PrefixExpression(this._curToken);

    this.nextToken();

    expression.right = this.parseExpression(Precedence.PREFIX);

    return expression;
  }

  parseInfixExpression(left: Expression): Expression | null {
    const expression = new InfixExpression(this._curToken);
    expression.left = left;

    const precedence = this.curPrecedence();
    this.nextToken();
    expression.right = this.parseExpression(precedence);

    return expression;
  }

  noPrefixParseFnError(token: TokenItem) {
    const msg = `no prefix parse function for ${token} found`;
    this._errors.push(msg);
  }
}
