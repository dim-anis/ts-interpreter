import { Token } from "../token/token";

export class Node {
  token: Token;

  constructor(token: Token) {
    this.token = token;
  }
  tokenLiteral(): string {
    return this.token.literal;
  }
  string(): string {
    return 'Node\'s string()'
  }
}

export class Statement extends Node {
  statementNode(): void {
    console.log('Am empty method');
  }
}

export class Expression extends Node {
  expressionNode(): void {
    console.log('Am empty method');
  }
}

// AST root
export class Program {
  statements!: Statement[];

  tokenLiteral(): string {
    if (this.statements.length > 0) {
      return this.statements[0].tokenLiteral()
    } else {
      return '';
    }
  }

  string(): string {
    const out: string[] = [];
    this.statements.forEach((stmt) => out.push(stmt.string()));
    return out.join(',');
  }
}

export class LetStatement extends Statement {
  name!: Identifier;
  value!: Expression;

  string(): string {
    return `${this.tokenLiteral()} ${this.name.string()} = ${this.value.string() ? this.value.string() : ''};`;
  }
}

export class ReturnStatement extends Statement {
  string(): string {
    return `${this.tokenLiteral()} ${this.returnValue ? this.returnValue : ''};`;
  }
}

export class ExpressionStatement extends Statement {
  expression!: Expression;

  string(): string {
    if (this.expression !== null) {
      return this.expression.string();
    }

    return '';
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

  string(): string {
    return this.value;
  }
}
