export interface MonkeyObject {
  type(): MonkeyObjectType;
  inspect(): string;
}

export const OBJECT_TYPE = {
  INTEGER_OBJ: "INTEGER",
  BOOLEAN_OBJ: "BOOLEAN",
  RETURN_VALUE_OBJ: "RETURN_VALUE",
  ERROR_OBJ: "ERROR",
  NULL_OBJ: "NULL"
} as const;

export type MonkeyObjectType = typeof OBJECT_TYPE[keyof typeof OBJECT_TYPE];

export class Integer implements MonkeyObject {
  value!: number;

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
