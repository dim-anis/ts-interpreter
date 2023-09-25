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

export class PrefixExpression implements Expression {
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

export class InfixExpression implements Expression {
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

export class IfExpression implements Expression {
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

export class CallExpression implements Expression {
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

export class IndexExpression implements Expression {
  token: Token;
  left: Expression;
  index!: Expression;

  constructor(token: Token, left: Expression) {
    this.token = token;
    this.left = left;
  }

  expressionNode(): string {
    return 'expressionNode';
  }
  tokenLiteral(): string {
    return this.token.literal;
  }
  string(): string {
    return `(${this.left.string()}[${this.index.string()}])`;
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

export class StringLiteral implements Expression {
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
    return this.token.literal;
  }
}

export class BooleanLiteral implements Expression {
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

export class FunctionLiteral implements Expression {
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

export class ArrayLiteral {
  token: Token;
  elements!: Expression[];

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
    const elements: string[] = [];
    this.elements.forEach(el => elements.push(el.string()));

    return `[${elements.join(', ')}]`;
  }
}

export class HashLiteral {
  token: Token;
  pairs!: Map<Expression, Expression>;

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
    const pairs: string[] = [];

    this.pairs.forEach(pair => pairs.push(pair.string()));

    return `{${pairs.join(', ')}}`;
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

type ModifierFunc = (node: Node) => Node;

export function modify(node: Node, modifier: ModifierFunc): Node {
  switch (true) {
    case (node instanceof Program): {
      const p = node as Program;
      p.statements.forEach(stmt => modify(stmt, modifier));
      break;
    }
    case (node instanceof ExpressionStatement): {
      const expressionStmt = node as ExpressionStatement;
      const expression = (expressionStmt).expression;
      if (expression) {
        expressionStmt.expression = modify(expression, modifier) as Expression;
      }
      break;
    }
    case (node instanceof InfixExpression): {
      const exp = node as InfixExpression;
      const { left, right } = exp;

      if (left) {
        exp.left = modify(left, modifier) as Expression;
      }
      if (right) {
        exp.right = modify(right, modifier) as Expression;
      }
      break;
    }
    case (node instanceof PrefixExpression): {
      const exp = node as PrefixExpression;
      const right = exp.right;
      if (right) {
        exp.right = modify(right, modifier) as Expression;
      }
      break;
    }
    case (node instanceof IndexExpression): {
      const exp = node as IndexExpression;
      exp.left = modify(exp.left, modifier) as Expression;
      exp.index = modify(exp.left, modifier) as Expression;
      break;
    }
    case (node instanceof IfExpression): {
      const ifExp = node as IfExpression;
      const condition = ifExp.condition;
      if (condition) {
        ifExp.condition = modify(condition, modifier) as Expression;
      }
      ifExp.consequence = modify(ifExp.consequence, modifier) as BlockStatement;

      if (ifExp.alternative) {
        ifExp.alternative = modify(ifExp.alternative, modifier) as BlockStatement;
      }
      break;
    }
    case (node instanceof BlockStatement): {
      const blockStmt = node as BlockStatement;
      blockStmt.statements.forEach(stmt => modify(stmt, modifier));
    }
  }

  return modifier(node);
}
