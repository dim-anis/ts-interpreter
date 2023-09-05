import { Parser } from './parser';
import { Lexer } from '../lexer/lexer';
import {
  BooleanLiteral,
  CallExpression,
  Expression,
  ExpressionStatement,
  FunctionLiteral,
  Identifier,
  IfExpression,
  InfixExpression,
  IntegerLiteral,
  LetStatement,
  PrefixExpression,
  ReturnStatement,
  Statement,
} from '../ast/ast';

test('test let statement', function () {
  const input = `
let x = 5;
let y = 10;
let foobar = 838383;
`;

  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);

  if (program === null) {
    console.log('parseProgram() returned null');
  }

  expect(program.statements.length).toBe(3);

  const expectedIds = ['x', 'y', 'foobar'];

  for (let i = 0; i < expectedIds.length; ++i) {
    const statement = program.statements[i];

    if (!(statement instanceof LetStatement)) {
      p._errors.push(
        `not LetStatement. expected LetStatement, got=${statement.token.type}`,
      );
      throw `not LetStatement. expected LetStatement, got=${statement.token.type}`;
    }

    expect(testLetStatement(statement, expectedIds[i])).toBe(true);
  }

  expect(checkParserErrors).toThrow();
});

test('test return statement', () => {
  const input = `
return 5;
return 10;
return 993322;
`;
  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program.statements.length).toBe(3);

  for (let i = 0; i < program.statements.length; ++i) {
    const returnStmt = program.statements[i];

    expect(returnStmt).toBeInstanceOf(ReturnStatement);
    expect(returnStmt.tokenLiteral()).toBe('return');
  }
});

test('test identifier expression', () => {
  const input = 'foobar;';

  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program.statements.length).toBe(1);

  const stmt = program.statements[0];

  expect(stmt).toBeInstanceOf(ExpressionStatement);

  const ident = (stmt as ExpressionStatement).expression;

  expect(ident).toBeInstanceOf(Identifier);

  if (ident instanceof Identifier) {
    expect(ident.value).toBe('foobar');
    expect(ident.tokenLiteral()).toBe('foobar');
  }
});

test('test integral literal expression', () => {
  const input = '5;';

  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program.statements.length).toBe(1);

  const stmt = program.statements[0];

  expect(stmt).toBeInstanceOf(ExpressionStatement);

  const literal = (stmt as ExpressionStatement).expression;

  expect(literal).toBeInstanceOf(IntegerLiteral);

  if (literal instanceof IntegerLiteral) {
    expect(literal.value).toBe(5);
    expect(literal.tokenLiteral()).toBe('5');
  }
});

test('test boolean expression', () => {
  const input = `
true;
`;

  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program.statements.length).toBe(1);

  const stmt = program.statements[0];

  expect(stmt).toBeInstanceOf(ExpressionStatement);

  const ident = (stmt as ExpressionStatement).expression;

  expect(ident).toBeInstanceOf(BooleanLiteral);

  if (ident instanceof BooleanLiteral) {
    expect(ident.value).toBe(true);
    expect(ident.tokenLiteral()).toBe('true');
  }
});

test('test parsing prefix expressions', () => {
  const prefixTests: {
    input: string;
    operator: string;
    value: any;
  }[] = [
    {
      input: '!5;',
      operator: '!',
      value: 5,
    },
    {
      input: '-15;',
      operator: '-',
      value: 15,
    },
    {
      input: '!true;',
      operator: '!',
      value: true,
    },
    {
      input: '!false',
      operator: '!',
      value: false,
    },
  ];

  for (const test of prefixTests) {
    const l = new Lexer(test.input);
    const p = new Parser(l);
    const program = p.parseProgram();
    checkParserErrors(p);

    expect(program.statements.length).toBe(1);

    const stmt = program.statements[0];

    expect(stmt).toBeInstanceOf(ExpressionStatement);

    const exp = (stmt as ExpressionStatement).expression;

    expect(exp).toBeInstanceOf(PrefixExpression);

    if (exp instanceof PrefixExpression) {
      const literal = exp;

      if (literal.right instanceof IntegerLiteral) {
        expect(literal.operator).toBe(test.operator);

        if (!testIntegerLiteral(literal.right, test.value)) {
          return;
        }
      }

      if (literal.right instanceof BooleanLiteral) {
        expect(literal.operator).toBe(test.operator);

        if (!testBooleanLiteral(literal.right, test.value)) {
          return;
        }
      }
    }
  }
});

test('test parsing infix expressions', () => {
  const infixTests: {
    input: string;
    leftValue: any;
    operator: string;
    rightValue: any;
  }[] = [
    {
      input: '5 + 5;',
      leftValue: 5,
      operator: '+',
      rightValue: 5,
    },
    {
      input: '5 - 5;',
      leftValue: 5,
      operator: '-',
      rightValue: 5,
    },
    {
      input: '5 * 5;',
      leftValue: 5,
      operator: '*',
      rightValue: 5,
    },
    {
      input: '5 / 5;',
      leftValue: 5,
      operator: '/',
      rightValue: 5,
    },
    {
      input: '5 > 5;',
      leftValue: 5,
      operator: '>',
      rightValue: 5,
    },
    {
      input: '5 < 5;',
      leftValue: 5,
      operator: '<',
      rightValue: 5,
    },
    {
      input: '5 == 5;',
      leftValue: 5,
      operator: '==',
      rightValue: 5,
    },
    {
      input: '5 != 5;',
      leftValue: 5,
      operator: '!=',
      rightValue: 5,
    },
    {
      input: 'true == true',
      leftValue: true,
      operator: '==',
      rightValue: true,
    },
    {
      input: 'true != false',
      leftValue: true,
      operator: '!=',
      rightValue: false,
    },
    {
      input: 'false == false',
      leftValue: false,
      operator: '==',
      rightValue: false,
    },
  ];

  for (const test of infixTests) {
    const l = new Lexer(test.input);
    const p = new Parser(l);
    const program = p.parseProgram();
    checkParserErrors(p);

    expect(program.statements.length).toBe(1);

    const stmt = program.statements[0];

    expect(stmt).toBeInstanceOf(
      Statement ||
        LetStatement ||
        ReturnStatement ||
        ExpressionStatement ||
        IntegerLiteral ||
        PrefixExpression,
    );

    const exp = (stmt as ExpressionStatement).expression;

    expect(exp).toBeInstanceOf(InfixExpression);

    if (exp === null) return;

    if (
      !testInfixExpression(exp, test.leftValue, test.operator, test.rightValue)
    ) {
      return;
    }
  }
});

test('test operator precedence parsing', () => {
  const tests: {
    input: string;
    expected: string;
  }[] = [
    {
      input: '-a * b',
      expected: '((-a) * b)',
    },
    {
      input: '!-a',
      expected: '(!(-a))',
    },
    {
      input: '5 < 4 != 3 > 4',
      expected: '((5 < 4) != (3 > 4))',
    },
    {
      input: 'true',
      expected: 'true',
    },
    {
      input: 'false',
      expected: 'false',
    },
    {
      input: '3 > 5 == false',
      expected: '((3 > 5) == false)',
    },
    {
      input: '3 < 5 == true',
      expected: '((3 < 5) == true)',
    },
    {
      input: '1 + (2 + 3) + 4',
      expected: '((1 + (2 + 3)) + 4)',
    },
    {
      input: '(5 + 5) * 2',
      expected: '((5 + 5) * 2)',
    },
    {
      input: '2 / (5 + 5)',
      expected: '(2 / (5 + 5))',
    },
    {
      input: '-(5 + 5)',
      expected: '(-(5 + 5))',
    },
    {
      input: '!(true == true)',
      expected: '(!(true == true))',
    },
    {
      input: 'a + add(b * c) + d',
      expected: '((a + add((b * c))) + d)',
    },
    {
      input: 'add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))',
      expected: 'add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))',
    },
    {
      input: 'add(a + b + c * d / f + g)',
      expected: 'add((((a + b) + ((c * d) / f)) + g))',
    },
  ];

  for (const test of tests) {
    const l = new Lexer(test.input);
    const p = new Parser(l);
    const program = p.parseProgram();
    checkParserErrors(p);

    const actual = program.string();

    expect(actual).toBe(test.expected);
  }
});

test('test if expression', () => {
  const input = `if (x < y) { x }`;

  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program.statements.length).toBe(1);

  const stmt = program.statements[0];

  expect(stmt).toBeInstanceOf(ExpressionStatement);

  if (stmt instanceof ExpressionStatement) {
    const exp = stmt.expression;

    expect(exp).toBeInstanceOf(IfExpression);

    if (exp instanceof IfExpression) {
      if (exp.condition) {
        if (!testInfixExpression(exp.condition, 'x', '<', 'y')) {
          return;
        }
      }

      expect(exp.consequence.statements.length).toBe(1);

      const consequence = exp.consequence.statements[0];

      expect(consequence).toBeInstanceOf(ExpressionStatement);

      if (consequence && consequence instanceof ExpressionStatement) {
        if (consequence.expression) {
          if (!testIdentifier(consequence.expression, 'x')) {
            return;
          }
        }
      }

      expect(exp.alternative).toBe(undefined);
    }
  }
});

test('test if else expression', () => {
  const input = `if (x < y) { x } else { y }`;

  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program.statements.length).toBe(1);

  const stmt = program.statements[0];

  expect(stmt).toBeInstanceOf(ExpressionStatement);

  if (stmt instanceof ExpressionStatement) {
    const exp = stmt.expression;

    expect(exp).toBeInstanceOf(IfExpression);

    if (exp instanceof IfExpression) {
      if (exp.condition) {
        if (!testInfixExpression(exp.condition, 'x', '<', 'y')) {
          return;
        }
      }

      expect(exp.consequence.statements.length).toBe(1);

      const consequence = exp.consequence.statements[0];

      if (consequence && consequence instanceof ExpressionStatement) {
        if (consequence.expression) {
          if (!testIdentifier(consequence.expression, 'x')) {
            return;
          }
        }
      }

      expect(exp.alternative.statements.length).toBe(1);

      const alternative = exp.alternative.statements[0];

      if (alternative && alternative instanceof ExpressionStatement) {
        if (alternative.expression) {
          if (!testIdentifier(alternative.expression, 'y')) {
            return;
          }
        }
      }
    }
  }
});

test('test function literal parsing', () => {
  const input = `fn(x, y) { x + y; }`;

  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program.statements.length).toBe(1);

  const stmt = program.statements[0];

  expect(stmt).toBeInstanceOf(ExpressionStatement);

  if (stmt instanceof ExpressionStatement) {
    const fn = stmt.expression;

    expect(fn).toBeInstanceOf(FunctionLiteral);

    if (fn instanceof FunctionLiteral) {
      expect(fn.parameters?.length).toBe(2);

      if (!fn.parameters) return;

      testLiteralExpression(fn.parameters[0], 'x');
      testLiteralExpression(fn.parameters[1], 'y');

      expect(fn.body.statements.length).toBe(1);

      const bodyStmt = fn.body.statements[0];

      expect(bodyStmt).toBeInstanceOf(ExpressionStatement);

      if (bodyStmt instanceof ExpressionStatement) {
        if (bodyStmt.expression) {
          testInfixExpression(bodyStmt.expression, 'x', '+', 'y');
        }
      }
    }
  }
});

test('test function parameter parsing', () => {
  const tests: {
    input: string;
    expectedParams: string[];
  }[] = [
    { input: 'fn() {};', expectedParams: [] },
    { input: 'fn(x) {};', expectedParams: ['x'] },
    { input: 'fn(x, y, z) {};', expectedParams: ['x', 'y', 'z'] },
  ];

  for (const test of tests) {
    const l = new Lexer(test.input);
    const p = new Parser(l);
    const program = p.parseProgram();
    checkParserErrors(p);

    const stmt = program.statements[0];
    expect(stmt).toBeInstanceOf(ExpressionStatement);

    if (stmt instanceof ExpressionStatement) {
      const fn = stmt.expression;
      expect(fn).toBeInstanceOf(FunctionLiteral);

      if (fn instanceof FunctionLiteral) {
        expect(fn.parameters?.length).toBe(test.expectedParams.length);

        for (let i = 0; i < test.expectedParams.length; i++) {
          if (fn.parameters) {
            testLiteralExpression(fn.parameters[i], test.expectedParams[i]);
          }
        }
      }
    }
  }
});

test('test call expression parsing', () => {
  const input = 'add(1, 2 * 3, 4 +5);';

  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program.statements.length).toBe(1);

  const stmt = program.statements[0];
  expect(stmt).toBeInstanceOf(ExpressionStatement);

  if (stmt instanceof ExpressionStatement) {
    const expression = stmt.expression;

    if (expression instanceof CallExpression) {
      if (!testIdentifier(expression.fn, 'add')) {
        return;
      }

      expect(expression.arguments.length).toBe(3);

      testLiteralExpression(expression.arguments[0], 1);
      testInfixExpression(expression.arguments[1], 2, '*', 3);
      testInfixExpression(expression.arguments[2], 4, '+', 5);
    }
  }
});

// test('test call expression parameter parsing', () => {
//
// });

function checkParserErrors(p: Parser) {
  const errors = p._errors;

  if (errors.length === 0) {
    return;
  }

  const errMsgs = [`parser has ${errors.length} errors`];
  errors.forEach((err) => errMsgs.push(err));

  throw new Error(errMsgs.join('\n'));
}

function testLetStatement(s: Statement, name: string) {
  expect(s.tokenLiteral()).toBe('let');

  const letStmt = s;

  expect(letStmt).toBeInstanceOf(LetStatement);
  if (letStmt instanceof LetStatement) {
    expect(letStmt.name.value).toBe(name);
  }

  return true;
}

function testIntegerLiteral(il: Expression | null, value: number): boolean {
  const int = il;

  expect(il).toBeInstanceOf(IntegerLiteral);

  if (int instanceof IntegerLiteral) {
    expect(int.value).toBe(value);
    expect(int.tokenLiteral()).toBe(value.toString());
  }
  return true;
}

function testBooleanLiteral(exp: Expression, value: boolean): boolean {
  const bl = exp;

  expect(bl).toBeInstanceOf(BooleanLiteral);

  if (bl instanceof BooleanLiteral) {
    expect(bl.value).toBe(value);
    expect(bl.tokenLiteral()).toBe(value.toString());
  }

  return true;
}

function testIdentifier(exp: Expression, value: string): boolean {
  const ident = exp;

  expect(ident).toBeInstanceOf(Identifier);

  if (ident instanceof Identifier) {
    expect(ident.value).toBe(value);
    expect(ident.tokenLiteral()).toBe(value);
  }

  return true;
}

function testLiteralExpression(exp: Expression, expected: any): boolean {
  switch (typeof expected) {
    case 'number':
      return testIntegerLiteral(exp, expected);
    case 'string':
      return testIdentifier(exp, expected);
    case 'boolean':
      return testBooleanLiteral(exp, expected);
    default:
      console.error(`type of exp not handled. got ${typeof exp}`);
      return false;
  }
}

function testInfixExpression(
  exp: Expression,
  left: any,
  operator: string,
  right: any,
): boolean {
  const opExp = exp;

  expect(opExp).toBeInstanceOf(InfixExpression);

  if (opExp instanceof InfixExpression) {
    if (opExp.left) {
      expect(testLiteralExpression(opExp.left, left)).toBe(true);
    }

    expect(opExp.operator).toBe(operator);

    if (opExp.right) {
      expect(testLiteralExpression(opExp.right, right)).toBe(true);
    }
  }

  return true;
}
