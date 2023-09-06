import { Lexer } from "../lexer/lexer";
import { Integer, MonkeyObject } from "../object/object";
import { Parser } from "../parser/parser";
import { monkeyEval } from "./evaluator";

test('test eval integer expression', () => {
  const tests: {
    input: string,
    expected: number
  }[] = [
      {
        input: '5',
        expected: 5
      },
      {
        input: '10',
        expected: 10
      },
    ];

  for (const test of tests) {
    const evaluated = testEval(test.input);
    expect(evaluated).not.toBe(null);

    if (evaluated === null) return;

    expect(testIntegerObject(evaluated, test.expected)).toBe(true);
  }
})

function testEval(input: string): MonkeyObject | null {
  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();

  return monkeyEval(program);
}

function testIntegerObject(obj: MonkeyObject, expected: number) {
  expect(obj).toBeInstanceOf(Integer);

  if (obj instanceof Integer) {
    expect(obj.value).toBe(expected);
    return true;
  }

  return false;
}
