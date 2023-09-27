import { Program } from "../ast/ast";
import { Lexer } from "../lexer/lexer";
import { MonkeyBoolean, Err, MonkeyFunction, Integer, MonkeyObject, MonkeyString, MonkeyArray, MonkeyHash, Quote,  Macro, newEnvironment } from "../object/object";
import { Parser } from "../parser/parser";
import { NATIVE_TO_OBJ, defineMacros, expandMacros, monkeyEval } from "./evaluator";

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

test('test error handling', () => {
  const tests: Test<string>[] = [
    {
      input: '5 + true;',
      expected: 'type mismatch: INTEGER + BOOLEAN',
    },
    {
      input: '5 + true; 5',
      expected: 'type mismatch: INTEGER + BOOLEAN',
    },
    {
      input: '-true',
      expected: 'unknown operator: -BOOLEAN',
    },
    {
      input: 'true + false;',
      expected: 'unknown operator: BOOLEAN + BOOLEAN',
    },
    {
      input: '5; true + false; 5',
      expected: 'unknown operator: BOOLEAN + BOOLEAN',
    },
    {
      input: 'if (10 > 1) { true + false; }',
      expected: 'unknown operator: BOOLEAN + BOOLEAN',
    },
    {
      input: `
if (10 > 1) {
  if (10 > 1) {
    return true + false;
  }

return 1;
}
`,
      expected: 'unknown operator: BOOLEAN + BOOLEAN',
    },
    {
      input: 'foobar',
      expected: 'identifier not found: foobar',
    },
    {
      input: '"Hello" - "World!"',
      expected: 'unknown operator: STRING - STRING'
    },
    {
      input: '{"name": "Monkey"}[fn(x) { x }];',
      expected: 'unusable as hash key: FUNCTION',
    }
  ];

  for (const test of tests) {
    const evaluated = testEval(test.input);

    expect(evaluated).toBeInstanceOf(Err);

    if (evaluated instanceof Err) {
      expect(evaluated.message).toBe(test.expected);
    }
  }
})

test('test let statements', () => {
  const tests: Test<number>[] = [
    {
      input: 'let a = 5; a;',
      expected: 5
    },
    {
      input: 'let a = 5 * 5; a;',
      expected: 25
    },
    {
      input: 'let a = 5 let b = a; b;',
      expected: 5
    },
    {
      input: 'let a = 5; let b = a; let c = a + b + 5; c;',
      expected: 15
    },
  ];

  for (const test of tests) {
    testIntegerObject(testEval(test.input), test.expected);
  }
})

test('test function object', () => {
  const input = 'fn(x) { x + 2};';

  const evaluated = testEval(input);

  expect(evaluated).toBeInstanceOf(MonkeyFunction);

  if (evaluated instanceof MonkeyFunction) {
    expect(evaluated.parameters.length).toBe(1);
    expect(evaluated.parameters[0].string()).toBe('x');
    expect(evaluated.body.string()).toBe('(x + 2)');
  }
})

test('test function application', () => {
  const tests: Test<number>[] = [
    {
      input: 'let identity = fn(x) { x; }; identity(5);',
      expected: 5
    },
    {
      input: 'let identity = fn(x) { return x; }; identity(5);',
      expected: 5
    },
    {
      input: 'let double = fn(x) { x * 2; }; double(5);',
      expected: 10
    },
    {
      input: 'let add = fn(x, y) { x + y; }; add(5, 5);',
      expected: 10
    },
    {
      input: 'let add = fn(x, y) { x + y; }; add(5 + 5, add(5, 5));',
      expected: 20
    },
    {
      input: 'fn(x) { x; }(5)',
      expected: 5
    },
  ];

  for (const test of tests) {
    testIntegerObject(testEval(test.input), test.expected);
  }
})

test('test string literal', () => {
  const input = '"Hello World!"';

  const evaluated = testEval(input);
  const str = evaluated;

  expect(str).toBeInstanceOf(MonkeyString);

  if (str instanceof MonkeyString) {
    expect(str.value).toBe("Hello World!");
  }
})

test('test string concatenation', () => {
  const input = '"Hello" + " " + "World!"';

  const evaluated = testEval(input);
  const str = evaluated;

  expect(str).toBeInstanceOf(MonkeyString);

  if (str instanceof MonkeyString) {
    expect(str.value).toBe("Hello World!");
  }
})

test('test builtin functions', () => {
  const tests: Test<any>[] = [
    {
      input: 'len("")',
      expected: 0
    },
    {
      input: 'len("four")',
      expected: 4
    },
    {
      input: 'len("hello world")',
      expected: 11
    },
    {
      input: 'len(1)',
      expected: 'argument to "len" not supported, got INTEGER'
    },
    {
      input: 'len("one", "two")',
      expected: 'wrong number of arguments. got=2, want=1'
    },
  ]

  for (const test of tests) {
    const evaluated = testEval(test.input);

    switch (true) {
      case (typeof test.expected === 'number'): {
        expect(testIntegerObject(evaluated, Number(test.expected))).toBe(true);
        break;
      }
      case (typeof test.expected === 'string'): {
        const errOjb = evaluated;
        expect(errOjb).toBeInstanceOf(Err);

        if (errOjb instanceof Err) {
          expect(errOjb.message).toBe(test.expected);
        }
      }
    }
  }
});

test('test array literals', () => {
  const input = '[1, 2 * 2, 3 + 3]';

  const evaluated = testEval(input);
  expect(evaluated).toBeInstanceOf(MonkeyArray);

  if (evaluated instanceof MonkeyArray) {
    const result = evaluated;

    expect(result.elements.length).toBe(3);

    testIntegerObject(result.elements[0], 1);
    testIntegerObject(result.elements[1], 4);
    testIntegerObject(result.elements[2], 6);
  }
})

test('test array index expressions', () => {
  const tests: Test<any>[] = [
    {
      input: '[1, 2 ,3][0]',
      expected: 1,
    },
    {
      input: '[1, 2 ,3][1]',
      expected: 2,
    },
    {
      input: '[1, 2 ,3][2]',
      expected: 3,
    },
    {
      input: 'let i = 0; [1][i];',
      expected: 1,
    },
    {
      input: '[1, 2, 3][1 + 1];',
      expected: 3,
    },
    {
      input: 'let myArray = [1, 2, 3]; myArray[2];',
      expected: 3,
    },
    {
      input: 'let myArray = [1, 2, 3]; myArray[0] + myArray[1] + myArray[2];',
      expected: 6,
    },
    {
      input: 'let myArray = [1, 2, 3]; let i = myArray[0]; myArray[i];',
      expected: 2,
    },
    {
      input: '[1, 2, 3][3]',
      expected: null,
    },
    {
      input: '[1, 2, 3][-1]',
      expected: null,
    },
  ];

  for (const test of tests) {
    const evaluated = testEval(test.input);

    if (evaluated instanceof Integer) {
      testIntegerObject(evaluated, test.expected);
    } else {
      testNullObject(evaluated);
    }
  }
})

test('test hash literals', () => {
  const input = `
let two = "two";
{
  "one": 10 - 9,
  two: 1 + 1,
  "thr" + "ee": 6 /2,
  4: 4,
  true: 5,
  false: 6
}`
  const evaluated = testEval(input);
  expect(evaluated).toBeInstanceOf(MonkeyHash);

  const result = evaluated;
  if (result instanceof MonkeyHash) {
    const expected = new Map([
      [(new MonkeyString('one')).hashKey(), 1],
      [(new MonkeyString('two')).hashKey(), 2],
      [(new MonkeyString('three')).hashKey(), 3],
      [(new Integer(4)).hashKey(), 4],
      [NATIVE_TO_OBJ.TRUE.hashKey(), 5],
      [NATIVE_TO_OBJ.FALSE.hashKey(), 6],
    ]);

    expect(result.pairs.size).toBe(expected.size);

    expected.forEach((expVal, expKey) => {
      const pair = result.pairs.get(JSON.stringify(expKey));
      if (pair) {
        testIntegerObject(pair?.value, expVal);
      }
    });
  }
});

test('test hash index expressions', () => {
  const tests: Test<any>[] = [
    {
      input: '{"foo": 5}["foo"]',
      expected: 5
    },
    {
      input: '{"foo": 5}["bar"]',
      expected: null
    },
    {
      input: 'let key = "foo"; {"foo": 5}[key]',
      expected: 5
    },
    {
      input: '{}["foo"]',
      expected: null
    },
    {
      input: '{5: 5}[5]',
      expected: 5
    },
    {
      input: '{true: 5}[true]',
      expected: 5
    },
    {
      input: '{false: 5}[false]',
      expected: 5
    },
  ]

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

test('test quote unquote', () => {
  const tests: Test<string>[] = [
    {
      input: 'quote(5)',
      expected: '5'
    },
    {
      input: 'quote(5 + 8)',
      expected: '(5 + 8)'
    },
    {
      input: 'quote(foobar)',
      expected: 'foobar'
    },
    {
      input: 'quote(foobar + barfoo)',
      expected: '(foobar + barfoo)'
    },
    {
      input: 'quote(unquote(4))',
      expected: '4'
    },
    {
      input: 'quote(unquote(4 + 4))',
      expected: '8'
    },
    {
      input: 'quote(8 + unquote(4 + 4))',
      expected: '(8 + 8)'
    },
    {
      input: 'quote(unquote(4 + 4) + 8)',
      expected: '(8 + 8)'
    },
    {
      input: 'quote(unquote(true))',
      expected: 'true'
    },
    {
      input: 'quote(unquote(true == false))',
      expected: 'false'
    },
    {
      input: 'quote(unquote(quote(4 + 4)))',
      expected: '(4 + 4)'
    },
    {
      input: `let quotedInfixExpression = quote(4 + 4);
quote(unquote(4 + 4) + unquote(quotedInfixExpression))
`,
      expected: '(8 + (4 + 4))'
    },
  ];

  for (const test of tests) {
    const evaluated = testEval(test.input);

    expect(evaluated).toBeInstanceOf(Quote);

    if (evaluated instanceof Quote) {
      const quote = evaluated;

      expect(quote.node).not.toBe(null);
      expect(quote.node.string()).toBe(test.expected);
    }
  }
})

test('test define macros', () => {
  const input = `
let number = 1;
let function = fn(x, y) { x + y};
let mymacro = macro(x, y) { x + y};
`

  const env = newEnvironment();
  const program = testParseProgram(input);

  defineMacros(program, env);

  expect(program.statements.length).toBe(2);

  expect(env.get('number')).toBe(undefined);
  expect(env.get('function')).toBe(undefined);
  const obj = env.get('mymacro');
  expect(obj).not.toBe(undefined);

  expect(obj).toBeInstanceOf(Macro);
  const macro = obj as Macro;

  expect(macro.parameters.length).toBe(2);
  expect(macro.parameters[0].string()).toBe('x');
  expect(macro.parameters[1].string()).toBe('y');

  const expectedBody = '(x + y)'

  expect(macro.body.string()).toBe(expectedBody);
})

describe('test expand macros', () => {
  const tests: [string, string][] = [
    [
      `
let infixExpression = macro() { quote(1 + 2); }

infixExpression();
`,
      '(1 + 2)'
    ],
    [
      `
let reverse = macro(a, b) { quote(unquote(b) - unquote(a)); }

reverse(2 + 2, 10 - 5);
`,
      '(10 - 5) - (2 + 2)'
    ],
    [
      `
let unless = macro(condition, consequence, alternative) {
  quote(if (!(unquote(condition))) {
    unquote(consequence);
  } else {
    unquote(alternative);
  });
};

unless(10 > 5, puts("not greater"), puts("greater"));
`,
      'if (!(10 > 5)) { puts("not greater") } else { puts("greater") }'
    ]
  ]

  test.each(tests)('modifying %p should result in %p', (input, exp) => {
    const expected = testParseProgram(exp);
    const program = testParseProgram(input);

    const env = newEnvironment();
    defineMacros(program, env);
    const expanded = expandMacros(program, env);

    expect(expanded.string()).toBe(expected.string());
  })
})

function testParseProgram(input: string): Program {
  const l = new Lexer(input);
  const p = new Parser(l);

  return p.parseProgram();
}

function testNullObject(obj: MonkeyObject): boolean {
  expect(obj).toBe(NATIVE_TO_OBJ.NULL);

  return true;
}


function testEval(input: string): MonkeyObject {
  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  const env = newEnvironment();

  return monkeyEval(program, env);
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
  expect(obj).toBeInstanceOf(MonkeyBoolean);

  if (obj instanceof MonkeyBoolean) {
    expect(obj.value).toBe(expected);
    return true;
  }

  return false;
}
