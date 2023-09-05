import { Token } from '../token/token';

export class Node {
  token: Token;

  constructor(token: Token) {
    this.token = token;
  }
  tokenLiteral(): string {
    return this.token.literal;
  }
  string(): string {
    return 'Node string()';
  }
}

export class Statement extends Node {
  statementNode(): void {
    console.log('Statement statementNode()');
  }
}

export class Expression extends Node {
  expressionNode(): void {
    console.log('Expression expressionNode()');
  }
}

export class PrefixExpression {
  token: Token;
  operator: string;
  right!: Expression | null;

  constructor(token: Token) {
    this.token = token;
    this.operator = token.literal;
  }

  expressionNode(): void {
    console.log('PrefixExpression expressionNode()');
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  string(): string {
    return `(${this.operator}${this.right?.string()})`;
  }
}

export class InfixExpression {
  token: Token;
  left!: Expression | null;
  operator: string;
  right!: Expression | null;

  constructor(token: Token) {
    this.token = token;
    this.operator = token.literal;
  }

  expressionNode(): void {
    console.log('InfixExpression expressionNode()');
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  string(): string {
    return `(${this.left?.string()} ${this.operator} ${this.right?.string()})`;
  }
}

export class IfExpression {
  token: Token;
  condition!: Expression | null;
  consequence!: BlockStatement;
  alternative!: BlockStatement;

  constructor(token: Token) {
    this.token = token;
  }

  expressionNode(): void {
    console.log('IfExpression expressionNode()');
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  string(): string {
    return `if${this.condition?.string()} ${this.consequence.string()}${
      this.alternative ? `else ${this.alternative.string()}` : ''
    }`;
  }
}

export class CallExpression {
  token: Token;
  fn!: Expression;
  arguments!: Expression[];

  constructor(token: Token, fn: Expression) {
    this.token = token;
    this.fn = fn;
  }

  expressionNode(): void {
    console.log('CallExpression expressionNode()');
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

export class IntegerLiteral {
  token: Token;
  value!: number;

  constructor(token: Token) {
    this.token = token;
  }

  expressionNode(): void {
    console.log('IntegerLiteral expressionNode()');
  }
  tokenLiteral(): string {
    return this.token.literal;
  }
  string(): string {
    return this.token.literal;
  }
}

export class BooleanLiteral {
  token: Token;
  value: boolean;

  constructor(token: Token, value: boolean) {
    this.token = token;
    this.value = value;
  }

  expressionNode(): void {
    console.log('BooleanLiteral expressionNode()');
  }
  tokenLiteral(): string {
    return this.token.literal;
  }
  string(): string {
    return this.token.literal;
  }
}

export class FunctionLiteral {
  token: Token;
  parameters!: Identifier[] | null;
  body!: BlockStatement;

  constructor(token: Token) {
    this.token = token;
  }

  expressionNode(): void {
    console.log('FunctionLiteral expressionNode()');
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
export class Program {
  statements: (
    | Statement
    | LetStatement
    | ReturnStatement
    | ExpressionStatement
    | IntegerLiteral
    | PrefixExpression
  )[] = [];

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

export class LetStatement extends Statement {
  name!: Identifier;
  value!: Expression;

  string(): string {
    return `${this.tokenLiteral()} ${this.name.string()} = ${
      this.value.string() !== null ? this.value.string() : ''
    };`;
  }
}

export class ReturnStatement extends Statement {
  _returnValue!: Expression;

  constructor(token: Token) {
    super(token);
  }

  get returnValue(): Expression {
    return this._returnValue;
  }

  set returnValue(returnValue: Expression) {
    this._returnValue = returnValue;
  }

  string(): string {
    return `${this.tokenLiteral()} ${
      this.returnValue ? this.returnValue : ''
    };`;
  }
}

export class ExpressionStatement extends Statement {
  expression!: Expression | null;

  string(): string {
    if (this.expression !== null) {
      return this.expression.string();
    }

    return '';
  }
}

export class BlockStatement extends Statement {
  statements!: Statement[];

  statementNode(): void {
    console.log('BlockStatement statementNode()');
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

export class Identifier {
  token: Token;
  value: string;

  constructor(token: Token, value: string) {
    this.token = token;
    this.value = value;
  }

  expressionNode(): void {
    console.log('Am a dummy method');
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  string(): string {
    return this.value;
  }
}
