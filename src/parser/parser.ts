import { Lexer } from '../lexer/lexer';
import { Token, TokenItem, TokenType } from '../token/token';
import {
  ArrayLiteral,
  BlockStatement,
  BooleanLiteral,
  CallExpression,
  Expression,
  ExpressionStatement,
  FunctionLiteral,
  HashLiteral,
  Identifier,
  IfExpression,
  IndexExpression,
  InfixExpression,
  IntegerLiteral,
  LetStatement,
  MacroLiteral,
  PrefixExpression,
  Program,
  ReturnStatement,
  Statement,
  StringLiteral,
} from '../ast/ast';

type PrefixParseFn = () => Expression | null;
type InfixParseFn = (expr: Expression) => Expression | null;

enum Precedence {
  LOWEST = 1,
  EQUALS,
  LESSGREATER,
  SUM,
  PRODUCT,
  PREFIX,
  CALL,
  INDEX
}

const precedences = new Map<TokenItem, Precedence>();
precedences.set(TokenType.EQ, Precedence.EQUALS);
precedences.set(TokenType.NOT_EQ, Precedence.EQUALS);
precedences.set(TokenType.LT, Precedence.LESSGREATER);
precedences.set(TokenType.GT, Precedence.LESSGREATER);
precedences.set(TokenType.PLUS, Precedence.SUM);
precedences.set(TokenType.MINUS, Precedence.SUM);
precedences.set(TokenType.SLASH, Precedence.PRODUCT);
precedences.set(TokenType.ASTERISK, Precedence.PRODUCT);
precedences.set(TokenType.LPAREN, Precedence.CALL);
precedences.set(TokenType.LBRACKET, Precedence.INDEX);

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
    this.registerPrefix(TokenType.TRUE, this.parseBoolean.bind(this));
    this.registerPrefix(TokenType.FALSE, this.parseBoolean.bind(this));
    this.registerPrefix(
      TokenType.LPAREN,
      this.parseGroupedExpression.bind(this),
    );
    this.registerPrefix(TokenType.IF, this.parseIfExpression.bind(this));
    this.registerPrefix(
      TokenType.FUNCTION,
      this.parseFunctionLiteral.bind(this),
    );
    this.registerPrefix(
      TokenType.MACRO,
      this.parseMacroLiteral.bind(this),
    );
    this.registerPrefix(TokenType.STRING, this.parseStringLiteral.bind(this));
    this.registerPrefix(TokenType.LBRACKET, this.parseArrayLiteral.bind(this));
    this.registerPrefix(TokenType.LBRACE, this.parseHashLiteral.bind(this));

    this.infixParseFns = new Map<TokenItem, InfixParseFn>();
    this.registerInfix(TokenType.PLUS, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.MINUS, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.SLASH, this.parseInfixExpression.bind(this));
    this.registerInfix(
      TokenType.ASTERISK,
      this.parseInfixExpression.bind(this),
    );
    this.registerInfix(TokenType.EQ, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.NOT_EQ, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.LT, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.GT, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.LPAREN, this.parseCallExpression.bind(this));
    this.registerInfix(TokenType.LBRACKET, this.parseIndexExpression.bind(this));
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
    const msg = `expected next token to be "${t}", got "${this._peekToken.type}" instead`;
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
  }

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
    const prefixFn = this.prefixParseFns.get(this._curToken.type);
    if (prefixFn === undefined) {
      this.noPrefixParseFnError(this._curToken.type);
      return null;
    }

    let leftExp = prefixFn();

    while (
      !this.peekTokenIs(TokenType.SEMICOLON) &&
      precedence < this.peekPrecedence()
    ) {
      const infixFn = this.infixParseFns.get(this._peekToken.type);
      if (infixFn === undefined) {
        return leftExp;
      }

      this.nextToken();

      if (leftExp) {
        leftExp = infixFn(leftExp);
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

    this.nextToken();

    const value = this.parseExpression(Precedence.LOWEST);
    if (value) {
      stmt.value = value;
    }

    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken();
    }

    return stmt;
  }

  parseReturnStatement(): ReturnStatement | null {
    const stmt = new ReturnStatement(this._curToken);

    this.nextToken();

    const returnValue = this.parseExpression(Precedence.LOWEST);
    if (returnValue) {
      stmt.returnValue = returnValue;
    }

    while (this.peekTokenIs(TokenType.SEMICOLON)) {
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
    const literal = new IntegerLiteral(this._curToken);

    const value = parseInt(this._curToken.literal);

    if (isNaN(value)) {
      this._errors.push(
        `could not parse ${this._curToken.literal} as an integer`,
      );
      return null;
    }

    literal.value = value;

    return literal;
  }

  parseStringLiteral(): Expression | null {
    return new StringLiteral(this._curToken, this._curToken.literal);
  }

  parseFunctionLiteral(): Expression | null {
    const literal = new FunctionLiteral(this._curToken);

    if (!this.expectPeek(TokenType.LPAREN)) {
      return null;
    }

    literal.parameters = this.parseFunctionParameters();

    if (!this.expectPeek(TokenType.LBRACE)) {
      return null;
    }

    literal.body = this.parseBlockStatement();

    return literal;
  }

  parseMacroLiteral(): Expression | null {
    const literal = new MacroLiteral(this._curToken);

    if (!this.expectPeek(TokenType.LPAREN)) {
      return null;
    }

    literal.parameters = this.parseFunctionParameters();

    if (!this.expectPeek(TokenType.LBRACE)) {
      return null;
    }

    literal.body = this.parseBlockStatement();

    return literal;
  }

  parseArrayLiteral(): Expression {
    const array = new ArrayLiteral(this._curToken);
    const elements = this.parseExpressionList(TokenType.RBRACKET);
    if (elements) {
      array.elements = elements;
    }

    return array;
  }

  parseHashLiteral(): Expression | null {
    const hash = new HashLiteral(this._curToken);
    hash.pairs = new Map<Expression, Expression>();

    while (!this.peekTokenIs(TokenType.RBRACE)) {
      this.nextToken();
      const key = this.parseExpression(Precedence.LOWEST);

      if (!this.expectPeek(TokenType.COLON)) {
        return null;
      }

      this.nextToken();
      const value = this.parseExpression(Precedence.LOWEST);

      if (key && value) {
        hash.pairs.set(key, value);
      }

      if (!this.peekTokenIs(TokenType.RBRACE) && !this.expectPeek(TokenType.COMMA)) {
        return null;
      }
    }

    if (!this.expectPeek(TokenType.RBRACE)) {
      return null;
    }

    return hash;
  }

  parseExpressionList(end: TokenItem): Expression[] | null {
    const list: Expression[] = [];

    if (this.peekTokenIs(end)) {
      this.nextToken();
      return list;
    }

    this.nextToken();

    const exp = this.parseExpression(Precedence.LOWEST);
    if (exp) {
      list.push(exp);
    }

    while (this.peekTokenIs(TokenType.COMMA)) {
      this.nextToken();
      this.nextToken();

      const exp = this.parseExpression(Precedence.LOWEST);
      if (exp) {
        list.push(exp);
      }
    }

    if (!this.expectPeek(end)) {
      return null;
    }

    return list;
  }

  parseFunctionParameters(): Identifier[] | null {
    const identifiers: Identifier[] = [];

    if (this.peekTokenIs(TokenType.RPAREN)) {
      this.nextToken();
      return identifiers;
    }

    this.nextToken();

    const ident = new Identifier(this._curToken, this._curToken.literal);
    identifiers.push(ident);

    while (this.peekTokenIs(TokenType.COMMA)) {
      this.nextToken();
      this.nextToken();
      const ident = new Identifier(this._curToken, this._curToken.literal);
      identifiers.push(ident);
    }

    if (!this.expectPeek(TokenType.RPAREN)) {
      return null;
    }

    return identifiers;
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

  parseCallExpression(fn: Expression): Expression {
    const exp = new CallExpression(this._curToken, fn);
    const args = this.parseExpressionList(TokenType.RPAREN);
    if (args) {
      exp.arguments = args;
    }

    return exp;
  }

  parseIndexExpression(left: Expression): Expression | null {
    const exp = new IndexExpression(this._curToken, left);

    this.nextToken();
    const expression = this.parseExpression(Precedence.LOWEST);
    if (expression) {
      exp.index = expression;
    }

    if (!this.expectPeek(TokenType.RBRACKET)) {
      return null;
    }

    return exp;
  }

  parseCallArguments(): Expression[] | null {
    const args: Expression[] = [];

    if (this.peekTokenIs(TokenType.RPAREN)) {
      this.nextToken();
      return args;
    }

    this.nextToken();
    const arg = this.parseExpression(Precedence.LOWEST);
    if (arg) {
      args.push(arg);
    }

    while (this.peekTokenIs(TokenType.COMMA)) {
      this.nextToken();
      this.nextToken();
      const arg = this.parseExpression(Precedence.LOWEST);
      if (arg) {
        args.push(arg);
      }
    }

    if (!this.expectPeek(TokenType.RPAREN)) {
      return null;
    }

    return args;
  }

  parseBoolean(): Expression {
    return new BooleanLiteral(this._curToken, this.curTokenIs(TokenType.TRUE));
  }

  parseGroupedExpression(): Expression | null {
    this.nextToken();

    const exp = this.parseExpression(Precedence.LOWEST);

    if (!this.expectPeek(TokenType.RPAREN)) {
      return null;
    }

    return exp;
  }

  parseIfExpression(): Expression | null {
    const exp = new IfExpression(this._curToken);

    if (!this.expectPeek(TokenType.LPAREN)) {
      return null;
    }

    this.nextToken();
    exp.condition = this.parseExpression(Precedence.LOWEST);

    if (!this.expectPeek(TokenType.RPAREN)) {
      return null;
    }

    if (!this.expectPeek(TokenType.LBRACE)) {
      return null;
    }

    exp.consequence = this.parseBlockStatement();

    if (this.peekTokenIs(TokenType.ELSE)) {
      this.nextToken();

      if (!this.expectPeek(TokenType.LBRACE)) {
        return null;
      }

      exp.alternative = this.parseBlockStatement();
    }

    return exp;
  }

  parseBlockStatement(): BlockStatement {
    const block = new BlockStatement(this._curToken);
    block.statements = [];

    this.nextToken();

    while (
      !this.curTokenIs(TokenType.RBRACE) &&
      !this.curTokenIs(TokenType.EOF)
    ) {
      const stmt = this.parseStatement();

      if (stmt !== null) {
        block.statements.push(stmt);
      }

      this.nextToken();
    }

    return block;
  }

  noPrefixParseFnError(token: TokenItem) {
    const msg = `no prefix parse function for ${token} found`;
    this._errors.push(msg);
  }
}
