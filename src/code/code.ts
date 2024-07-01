type Instructions = number[];

class Definition {
  constructor(public name: string, public operandWidths: number[]) {}
}

export enum Opcode {
  OpConstant = 0,
}

export const definitions: Map<Opcode, Definition> = new Map([
  [Opcode.OpConstant, new Definition('OpConstant', [2])],
]);

class OpcodeLookupError extends Error {
  constructor(opcode: number) {
    super(`opcode ${opcode} undefined`);
    this.name = 'OpcodeLookupError';
  }
}

export class OpcodeDefinitions {
  private definitions: Map<Opcode, Definition>;

  constructor(definitions: Map<Opcode, Definition>) {
    this.definitions = definitions;
  }

  lookup(op: number): Definition {
    const def = this.definitions.get(op as Opcode);
    if (!def) {
      throw new OpcodeLookupError(op);
    }
    return def;
  }
}

export function make(op: Opcode, operands: number[]) {
  const def = definitions.get(op);

  if (!def) {
    return new Uint16Array();
  }

  let instructionLen = 1;
  for (let i = 0; i <= def.operandWidths.length; i++) {
    instructionLen += 1;
  }

  const instruction = new Uint16Array(instructionLen);
  instruction[0] = op;

  let offset = 1;
  for (let i = 0; i < operands.length; i++) {
    const o = operands[i];
    const width = def.operandWidths[i];

    switch (width) {
      case 2:
        instruction[offset] = (o >> 8) & 0xff;
        instruction[offset + 1] = 0 & 0xff;
        break;
    }

    offset += width;
  }

  return instruction;
}
