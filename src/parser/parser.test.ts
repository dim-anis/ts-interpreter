import { Parser } from "./parser";
import { Lexer } from "../lexer/lexer";
import { LetStatement, Statement } from "../ast/ast";

test('Test Let Statements', function() {
//   const input = `
// let x = 5;
// let y = 10;
// let = 838383;
// `
  const input = `
let x 5;
let = 10;
let 838383;
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

    expect(testLetStatement(statement, expectedIds[i])).toBe(true);
  }

  expect(checkParserErrors).toThrow();
});

function checkParserErrors(p: Parser) {
  const errors = p.errors;

  if (errors.length === 0) {
    return;
  }

  const errMsgs = [`parser has ${errors.length}`];
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
