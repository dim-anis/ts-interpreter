import { Parser } from "./parser";
import { Lexer } from "../lexer/lexer";
import { ExpressionStatement, Identifier, IntegralLiteral, LetStatement, ReturnStatement, Statement } from "../ast/ast";

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
  if (s.tokenLiteral() !== 'let') {
    console.log(`s.tokenLiteral not "let", got ${s.tokenLiteral()}`)
    return false;
  }

  const letStmt = s;
  if (!(letStmt instanceof LetStatement)) {
    console.log(`s is not of type LetStatement, got ${s.tokenLiteral()}`);
    return false;
  }

  if (letStmt.name.value !== name) {
    console.log(`letStmt.name.value not ${name}, got ${letStmt.name.value}`);
    return false;
  }

  if (letStmt.name.tokenLiteral() !== name) {
    console.log(`letStmt.name.tokenLiteral() is not ${name}, got ${letStmt.name.tokenLiteral()}`)
    return false;
  }

  return true;
}

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
