import { Lexer } from "../lexer/lexer";
import { Boolean, Integer, MonkeyObject } from "../object/object";
import { Parser } from "../parser/parser";
import { NATIVE_TO_OBJ, monkeyEval } from "./evaluator";

type Test<T> = {
  input: string;
  expected: T
}

test('test eval integer expression', () => {
  const tests: Test<number>[] = [
    {
      input: '5',
      expected: 5
    },
    {
      input: '10',
      expected: 10
    },
    {
      input: '-5',
      expected: -5
    },
    {
      input: '-10',
      expected: -10
    },
    {
      input: '5 + 5 + 5 + 5 -10',
      expected: 10
    },
    {
      input: '2 * 2 * 2 * 2 * 2',
      expected: 32
    },
    {
      input: '-50 + 100 + -50',
      expected: 0
    },
    {
      input: '5 * 2 + 10',
      expected: 20
    },
    {
      input: '5 + 2 * 10',
      expected: 25
    },
    {
      input: '20 + 2 * -10',
      expected: 0
    },
    {
      input: '50 / 2 * 2 + 10',
      expected: 60
    },
    {
      input: '2 * (5 + 10)',
      expected: 30
    },
    {
      input: '3 * 3 * 3 + 10',
      expected: 37
    },
    {
      input: '3 * (3 * 3) + 10',
      expected: 37
    },
    {
      input: '(5 + 10 * 2 + 15 / 3) * 2 + -10',
      expected: 50
    },
  ];

  for (const test of tests) {
    const evaluated = testEval(test.input);
    expect(evaluated).not.toBe(null);

    if (evaluated === null) return;

    expect(testIntegerObject(evaluated, test.expected)).toBe(true);
  }
})

test('test eval boolean expression', () => {
  const tests: Test<boolean>[] = [
    {
      input: 'true',
      expected: true
    },
    {
      input: 'false',
      expected: false
    },
    {
      input: '1 < 2',
      expected: true
    },
    {
      input: '1 > 2',
      expected: false
    },
    {
      input: '1 < 1',
      expected: false
    },
    {
      input: '1 > 1',
      expected: false
    },
    {
      input: '1 == 1',
      expected: true
    },
    {
      input: '1 != 1',
      expected: false
    },
    {
      input: 'true == true',
      expected: true
    },
    {
      input: 'false == false',
      expected: true
    },
    {
      input: 'true == false',
      expected: false
    },
    {
      input: 'true != false',
      expected: true
    },
    {
      input: 'false != true',
      expected: true
    },
    {
      input: '(1 < 2) == true',
      expected: true
    },
    {
      input: '(1 < 2) == false',
      expected: false
    },
    {
      input: '(1 > 2) == true',
      expected: false
    },
    {
      input: '(1 > 2) == false',
      expected: true
    },
  ];

  for (const test of tests) {
    const evaluated = testEval(test.input);
    expect(evaluated).not.toBe(null);

    if (evaluated === null) return;

    expect(testBooleanObject(evaluated, test.expected)).toBe(true);
  }
})

test('test bang operator', () => {
  const tests: Test<boolean>[] = [
    {
      input: '!true',
      expected: false
    },
    {
      input: '!false',
      expected: true
    },
    {
      input: '!5',
      expected: false
    },
    {
      input: '!!true',
      expected: true
    },
    {
      input: '!!false',
      expected: false
    },
    {
      input: '!!5',
      expected: true
    },
  ];

  for (const test of tests) {
    const evaluated = testEval(test.input);
    expect(evaluated).not.toBe(null);

    if (evaluated === null) return;

    expect(testBooleanObject(evaluated, test.expected)).toBe(true);
  }
})

test('test if/else expressions', () => {
  const tests: Test<any>[] = [
    {
      input: 'if (true) { 10 }',
      expected: 10
    },
    {
      input: 'if (false) { 10 }',
      expected: null
    },
    {
      input: 'if (1) { 10 }',
      expected: 10
    },
    {
      input: 'if (1 < 2) { 10 }',
      expected: 10
    },
    {
      input: 'if (1 > 2) { 10 }',
      expected: null
    },
    {
      input: 'if (1 > 2) { 10 } else { 20 }',
      expected: 20
    },
    {
      input: 'if (1 < 2) { 10 } else { 20 }',
      expected: 10
    },
  ];

  for (const test of tests) {
    const evaluated = testEval(test.input);
    const integer = test.expected;

    if (typeof integer === 'number') {
      testIntegerObject(evaluated, integer);
    } else {
      testNullObject(evaluated);
    }
  }
})

test('test return statements', () => {
  const tests: Test<number>[] = [
    {
      input: 'return 10;',
      expected: 10
    },
    {
      input: 'return 10; 9;',
      expected: 10
    },
    {
      input: 'return 2 * 5; 9;',
      expected: 10
    },
    {
      input: '9; return 2 * 5; 9;',
      expected: 10
    },
  ];

  for (const test of tests) {
    const evaluated = testEval(test.input);
    testIntegerObject(evaluated, test.expected);
  }
})

function testNullObject(obj: MonkeyObject): boolean {
  expect(obj).toBe(NATIVE_TO_OBJ.NULL);

  return true;
}

function testEval(input: string): MonkeyObject {
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

function testBooleanObject(obj: MonkeyObject, expected: boolean) {
  expect(obj).toBeInstanceOf(Boolean);

  if (obj instanceof Boolean) {
    expect(obj.value).toBe(expected);
    return true;
  }

  return false;
}
