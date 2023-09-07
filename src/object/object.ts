export interface MonkeyObject {
  type(): MonkeyObjectType;
  inspect(): string;
}

export const OBJECT_TYPE = {
  INTEGER_OBJ: "INTEGER",
  BOOLEAN_OBJ: "BOOLEAN",
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

export class Null implements MonkeyObject {
  type(): MonkeyObjectType {
    return OBJECT_TYPE.NULL_OBJ;
  }
  inspect(): string {
    return 'null';
  }
}
