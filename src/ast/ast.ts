import { Token } from "../token/token";

export type Node = {
  tokenLiteral(): string;
}

export type Statement = {
  statementNode(): string
} & Node;


export type Expression = {
  expressionNode(): string
} & Node;


export class Program {
  statements: Statement[];

  constructor() {
    this.statements = [];
  }

  tokenLiteral(): string {
    if (this.statements.length > 0) {
      return this.statements[0].tokenLiteral()
    } else {
      return '';
    }
  }
}

export class LetStatement {
  token!: Token;
  name!: Identifier;
  value!: Expression;

  constructor() { }

  statementNode() { }

  tokenLiteral(): string {
    return this.token.literal;
  }
}

export class Identifier {
  token!: Token;
  value!: string;

  constructor() { }

  expressionNode() { };

  tokenLiteral(): string {
    return this.token.literal;
  }
}
