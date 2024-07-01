import { Opcode, make } from './code';

describe('test Make', function () {
  type Test = { op: Opcode; operands: number[]; expected: Uint16Array };
  const tests: Test[] = [
    {
      op: Opcode.OpConstant,
      operands: [65534],
      expected: new Uint16Array([Opcode.OpConstant, 255, 254]),
    },
  ];

  tests.forEach(({ op, operands, expected }) => {
    test('instructions should be of same length', () => {
      const instruction: Uint16Array = make(op, operands);
      expect(expected.length).toEqual(instruction.length);
    });

    expected.forEach((instruction, i) => {
      test('bytes should be same', () => {
        expect(instruction).toEqual(expected[i]);
      });
    });
  });
});
