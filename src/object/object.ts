import { BlockStatement, Identifier } from "../ast/ast";

export interface MonkeyObject {
  type(): MonkeyObjectType;
  inspect(): string;
}

export const OBJECT_TYPE = {
  INTEGER_OBJ: "INTEGER",
  STRING_OBJ: "STRING",
  BOOLEAN_OBJ: "BOOLEAN",
  RETURN_VALUE_OBJ: "RETURN_VALUE",
  FUNCTION_OBJ: "FUNCTION",
  ERROR_OBJ: "ERROR",
  NULL_OBJ: "NULL"
} as const;

export type MonkeyObjectType = typeof OBJECT_TYPE[keyof typeof OBJECT_TYPE];

export class Integer implements MonkeyObject {
  value: number;

  constructor(value: number) {
    this.value = value;
  }

  type(): MonkeyObjectType {
    return OBJECT_TYPE.INTEGER_OBJ;
  }
  inspect(): string {
    return `${this.value}`;
  }
}

export class Str implements MonkeyObject {
  value: string;

  constructor(value: string) {
    this.value = value;
  }

  type(): MonkeyObjectType {
    return OBJECT_TYPE.STRING_OBJ;
  }
  inspect(): string {
    return `${this.value}`;
  }
}

export class Boolean implements MonkeyObject {
  value!: boolean;

  constructor(value: boolean) {
    this.value = value;
  }

  type(): MonkeyObjectType {
    return OBJECT_TYPE.BOOLEAN_OBJ;
  }
  inspect(): string {
    return `${this.value}`;
  }
}

export class MonkeyFunction {
  parameters: Identifier[];
  body: BlockStatement;
  env: Environment;

  constructor(parameters: Identifier[], body: BlockStatement, env: Environment) {
    this.parameters = parameters;
    this.body = body;
    this.env = env;
  }

  type(): MonkeyObjectType {
    return OBJECT_TYPE.FUNCTION_OBJ;
  }

  inspect(): string {
    const params: string[] = [];
    for (const param of this.parameters) {
      params.push(param.string());
    }

    return `fn(${params.join(', ')})\n${this.body.string()}\n`;
  }
}

export class ReturnValue implements MonkeyObject {
  value!: MonkeyObject;

  constructor(value: MonkeyObject) {
    this.value = value;
  }

  type(): MonkeyObjectType {
    return OBJECT_TYPE.RETURN_VALUE_OBJ;
  }
  inspect(): string {
    return `${this.value.inspect()}`;
  }
}

export class Error implements MonkeyObject {
  message: string;

  constructor(message: string) {
    this.message = message;
  }

  type(): MonkeyObjectType {
    return OBJECT_TYPE.ERROR_OBJ;
  }

  inspect(): string {
    return `ERROR: ${this.message}`;
  }
}

export class Null implements MonkeyObject {
  type(): MonkeyObjectType {
    return OBJECT_TYPE.NULL_OBJ;
  }
  inspect(): string {
    return 'null';
  }
}

export class Environment {
  store: Map<string, MonkeyObject>;
  outer?: Environment;

  constructor(store: Map<string, MonkeyObject>) {
    this.store = store;
  }

  get(name: string): MonkeyObject | undefined {
    let obj = this.store.get(name);
    if (obj === undefined && this.outer !== undefined) {
      obj = this.outer?.get(name);
    }

    return obj;
  }

  set(name: string, val: MonkeyObject): MonkeyObject {
    this.store.set(name, val);
    return val;
  }
}

export function newEnvironment(): Environment {
  const s = new Map<string, MonkeyObject>();
  return new Environment(s);
}

export function newEnclosedEnvironment(outer: Environment): Environment {
  const env = newEnvironment();
  env.outer = outer;

  return env;
}
