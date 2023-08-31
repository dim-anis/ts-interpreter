import { Parser } from "./parser";
import { Lexer } from "../lexer/lexer";
import { Expression, ExpressionStatement, Identifier, IntegralLiteral, LetStatement, PrefixExpression, ReturnStatement, Statement } from "../ast/ast";

test('test let statement', function() {
  const input = `
let x = 5;
let y = 10;
let foobar = 838383;
`

  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);

  if (program === null) {
    console.log('parseProgram() returned null');
  }
  if (program.statements.length !== 3) {
    console.log(`program.statements does not contain 3 statements, includes ${program.statements.length} statements`);
  }

  const expectedIds = ['x', 'y', 'foobar'];

  for (let i = 0; i < expectedIds.length; ++i) {
    const statement = program.statements[i];

    if (!(statement instanceof LetStatement)) {
      p._errors.push(`not LetStatement. expected LetStatement, got=${statement.token.type}`)
      throw (`not LetStatement. expected LetStatement, got=${statement.token.type}`);
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
`
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
})

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
})

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

  expect(literal).toBeInstanceOf(IntegralLiteral);

  if (literal instanceof IntegralLiteral) {
    expect(literal.value).toBe(5);
    expect(literal.tokenLiteral()).toBe('5');
  }
})

test('test parsing prefix expressions', () => {
  type Expression = {
    input: string,
    operator: string,
    integerValue: number
  };

  const prefixTests: Expression[] = [
    {
      input: '!5;',
      operator: '!',
      integerValue: 5
    },
    {
      input: '-15;',
      operator: '-',
      integerValue: 15
    }
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

    if (exp instanceof PrefixExpression) {
      expect(exp.operator).toBe(test.operator);

      if (!testIntegralLiteral(exp.right, test.integerValue)) {
        return;
      }
    }
  }
})

function checkParserErrors(p: Parser) {
  const errors = p._errors;

  if (errors.length === 0) {
    return;
  }

  const errMsgs = [`parser has ${errors.length} errors`];
  errors.forEach(err => errMsgs.push(err));

  throw new Error(errMsgs.join("\n"));
}

function testLetStatement(s: Statement, name: string) {
  expect(s.tokenLiteral()).toBe('let');

  const letStmt = s as LetStatement;
  expect(letStmt).toBeInstanceOf(LetStatement);

  expect(letStmt.name.value).toBe(name);

  return true;
}

function testIntegralLiteral(il: Expression | null, value: number): boolean {
  const int = il as IntegralLiteral;
  expect(il).toBeInstanceOf(IntegralLiteral);

  expect(int.value).toBe(value);

  expect(int.tokenLiteral()).toBe(value.toString());

  return true;
}
