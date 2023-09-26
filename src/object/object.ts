import { BlockStatement, Identifier, Node } from "../ast/ast";

function djb2Hash(str: string) {
  let hash = 5381; // Initial hash value

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) + hash) + char; // hash * 33 + char
  }

  return hash;
}

export interface MonkeyObject {
  type(): MonkeyObjectType;
  inspect(): string;
}

export const OBJECT_TYPE = {
  INTEGER_OBJ: "INTEGER",
  STRING_OBJ: "STRING",
  BOOLEAN_OBJ: "BOOLEAN",
  ARRAY_OBJ: "ARRAY",
  RETURN_VALUE_OBJ: "RETURN_VALUE",
  FUNCTION_OBJ: "FUNCTION",
  HASH_OBJ: "HASH",
  BUILTIN_OBJ: "BUILTIN",
  ERROR_OBJ: "ERROR",
  NULL_OBJ: "NULL",
  QUOTE_OBJ: "QUOTE"
} as const;

export type MonkeyObjectType = typeof OBJECT_TYPE[keyof typeof OBJECT_TYPE];

export class HashKey {
  type: MonkeyObjectType;
  value: number;

  constructor(type: MonkeyObjectType, value: number) {
    this.type = type;
    this.value = value;
  }
}

export class HashPair {
  key: MonkeyObject;
  value: MonkeyObject;

  constructor(key: MonkeyObject, value: MonkeyObject) {
    this.key = key;
    this.value = value;
  }
}

export interface Hashable {
  hashKey(): HashKey;
}

export class MonkeyHash {
  pairs: Map<string, HashPair>;

  constructor(pairs: Map<string, HashPair>) {
    this.pairs = pairs;
  }

  type(): MonkeyObjectType {
    return OBJECT_TYPE.HASH_OBJ;
  }
  inspect(): string {
    const pairs: string[] = [];

    this.pairs.forEach(pair =>
      pairs.push(`${pair.key.inspect()}: ${pair.value.inspect()}`)
    );

    return `{${pairs.join(', ')}}`;
  }
}

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
  hashKey(): HashKey {
    return new HashKey(this.type(), this.value);
  }
}

export class MonkeyString implements MonkeyObject {
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
  hashKey(): HashKey {
    const hashValue = djb2Hash(this.value);
    return new HashKey(this.type(), hashValue);
  }
}

export class MonkeyBoolean implements MonkeyObject {
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
  hashKey(): HashKey {
    let value: number;

    if (this.value) {
      value = 1;
    } else {
      value = 0;
    }

    return new HashKey(this.type(), value);
  }
}

export class MonkeyArray {
  elements: MonkeyObject[];

  constructor(elements: MonkeyObject[]) {
    this.elements = elements;
  }

  type(): MonkeyObjectType {
    return OBJECT_TYPE.ARRAY_OBJ;
  }
  inspect(): string {
    const elements: string[] = [];
    this.elements.forEach(el => elements.push(el.inspect()));

    return `[${elements.join(', ')}]`;
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

export interface BuiltinFunction {
  (args: MonkeyObject[]): MonkeyObject;
}

export class Builtin {
  fn: BuiltinFunction;

  constructor(fn: BuiltinFunction) {
    this.fn = fn;
  }

  type(): MonkeyObjectType {
    return OBJECT_TYPE.BUILTIN_OBJ;
  }
  inspect(): string {
    return 'builtin function';
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

export class Err implements MonkeyObject {
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

export class MonkeyNull implements MonkeyObject {
  type(): MonkeyObjectType {
    return OBJECT_TYPE.NULL_OBJ;
  }
  inspect(): string {
    return 'null';
  }
}

export class Quote implements MonkeyObject {
  node: Node;

  constructor(node: Node) {
    this.node = node;
  }

  type(): MonkeyObjectType {
    return OBJECT_TYPE.QUOTE_OBJ;
  }

  inspect(): string {
    return `QUOTE(${this.node.string()})`;
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
