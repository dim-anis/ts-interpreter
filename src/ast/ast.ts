import { Token } from "../token/token";

export class Node {
  token: Token;

  constructor(token: Token) {
    this.token = token;
  }
  tokenLiteral(): string {
    return this.token.literal;
  };
}

export class Statement extends Node {
  statementNode(): void {
    console.log('Am empty method')
  };
};

export class Expression extends Node {
  expressionNode(): void {
    console.log('Am empty method');
  }
};

// AST root
export class Program {
  statements!: (Statement | LetStatement)[];

  tokenLiteral(): string {
    if (this.statements.length > 0) {
      return this.statements[0].tokenLiteral()
    } else {
      return "";
    }
  }
}

export class LetStatement extends Statement {
  token: Token;
  name!: Identifier;
  value!: Expression;

  constructor(token: Token) {
    super(token);
    this.token = token;
  }

  statementNode(): void {
    console.log('Am a dummy method')
  };

  tokenLiteral(): string {
    return this.token.literal;
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
    console.log('Am a dummy method')
  };

  tokenLiteral(): string {
    return this.token.literal;
  }
}
