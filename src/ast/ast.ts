import { Token } from '../token/token';

export interface Node {
  tokenLiteral(): string;
  string(): string;
}

export interface Statement extends Node {
  statementNode(): string;
}

export interface Expression extends Node {
  expressionNode(): string
}

export class PrefixExpression implements Expression{
  token: Token;
  operator: string;
  right!: Expression | null;

  constructor(token: Token) {
    this.token = token;
    this.operator = token.literal;
  }

  expressionNode(): string {
    return 'expressionNode';
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  string(): string {
    return `(${this.operator}${this.right?.string()})`;
  }
}

export class InfixExpression implements Expression{
  token: Token;
  left!: Expression | null;
  operator: string;
  right!: Expression | null;

  constructor(token: Token) {
    this.token = token;
    this.operator = token.literal;
  }

  expressionNode(): string {
    return 'expressionNode';
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  string(): string {
    return `(${this.left?.string()} ${this.operator} ${this.right?.string()})`;
  }
}

export class IfExpression implements Expression{
  token: Token;
  condition!: Expression | null;
  consequence!: BlockStatement;
  alternative!: BlockStatement;

  constructor(token: Token) {
    this.token = token;
  }

  expressionNode(): string {
    return 'expressionNode';
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  string(): string {
    return `if${this.condition?.string()} ${this.consequence.string()}${this.alternative ? `else ${this.alternative.string()}` : ''
      }`;
  }
}

export class CallExpression implements Expression{
  token: Token;
  fn!: Expression;
  arguments!: Expression[];

  constructor(token: Token, fn: Expression) {
    this.token = token;
    this.fn = fn;
  }

  expressionNode(): string {
    return 'expressionNode';
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  string(): string {
    const out: string[] = [];

    for (const arg of this.arguments) {
      out.push(arg.string());
    }

    return `${this.fn.string()}(${out.join(', ')})`;
  }
}

export class IntegerLiteral implements Expression {
  token: Token;
  value!: number;

  constructor(token: Token) {
    this.token = token;
  }

  expressionNode(): string {
    return 'expressionNode';
  }
  tokenLiteral(): string {
    return this.token.literal;
  }
  string(): string {
    return this.token.literal;
  }
}

export class BooleanLiteral implements Expression{
  token: Token;
  value: boolean;

  constructor(token: Token, value: boolean) {
    this.token = token;
    this.value = value;
  }

  expressionNode(): string {
    return 'expressionNode';
  }
  tokenLiteral(): string {
    return this.token.literal;
  }
  string(): string {
    return this.token.literal;
  }
}

export class FunctionLiteral implements Expression{
  token: Token;
  parameters!: Identifier[] | null;
  body!: BlockStatement;

  constructor(token: Token) {
    this.token = token;
  }

  expressionNode(): string {
    return 'expressionNode';
  }
  tokenLiteral(): string {
    return this.token.literal;
  }
  string(): string {
    const params: string[] = [];
    if (this.parameters) {
      for (const param of this.parameters) {
        params.push(param.string());
      }
    }

    return `${this.tokenLiteral()}(${params.join(', ')})${this.body.string()}`;
  }
}

// AST root
export class Program implements Node {
  statements: Statement[] = [];

  tokenLiteral(): string {
    if (this.statements.length > 0) {
      return this.statements[0].tokenLiteral();
    } else {
      return '';
    }
  }

  string(): string {
    const out: string[] = [];
    this.statements.forEach((stmt) => out.push(stmt.string()));
    return out.join('');
  }
}

export class LetStatement implements Statement {
  token: Token;
  name!: Identifier;
  value!: Expression;

  constructor(token: Token) {
    this.token = token;
  }
  statementNode(): string {
    return 'statementNode';
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  string(): string {
    return `${this.tokenLiteral()} ${this.name.string()} = ${this.value.string() !== null ? this.value.string() : ''
      };`;
  }
}

export class ReturnStatement implements Statement {
  token: Token;
  _returnValue!: Expression;

  constructor(token: Token) {
    this.token = token;
  }

  statementNode(): string {
    return 'statementNode';;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  get returnValue(): Expression {
    return this._returnValue;
  }

  set returnValue(returnValue: Expression) {
    this._returnValue = returnValue;
  }

  string(): string {
    return `${this.tokenLiteral()} ${this.returnValue ? this.returnValue : ''
      };`;
  }
}

export class ExpressionStatement implements Statement {
  token: Token;
  expression!: Expression | null;

  constructor(token: Token) {
    this.token = token;
  }

  statementNode(): string {
    return 'statementNode';
  }

  tokenLiteral(): string {
    return this.token.literal;
  }
  string(): string {
    if (this.expression !== null) {
      return this.expression.string();
    }

    return '';
  }
}

export class BlockStatement implements Statement {
  token: Token;
  statements!: Statement[];

  constructor(token: Token) {
    this.token = token;
  }

  statementNode(): string {
    return 'statementNode'; 
  }

  tokenLiteral(): string {
    return this.tokenLiteral();
  }

  string(): string {
    const out: string[] = [];

    for (const stmt of this.statements) {
      out.push(stmt.string());
    }

    return out.join('');
  }
}

export class Identifier implements Expression {
  token: Token;
  value: string;

  constructor(token: Token, value: string) {
    this.token = token;
    this.value = value;
  }

  expressionNode(): string {
    return 'expressionNode';
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  string(): string {
    return this.value;
  }
}
