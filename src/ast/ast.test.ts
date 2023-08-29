import { TokenType } from "../token/token";
import { Identifier, LetStatement, Program } from "./ast";

test('test string', () => {
  const myVar = new Identifier(
    { type: TokenType.IDENT, literal: 'myVar' },
    'myVar'
  );

  const anotherVar = new Identifier(
    { type: TokenType.IDENT, literal: 'anotherVar' },
    'anotherVar'
  );

  const statement = new LetStatement(
    { type: TokenType.LET, literal: 'let' },
  );

  statement.name = myVar;
  statement.value = anotherVar;

  const program = new Program();

  program.statements.push(statement);

  if (program.string() !== 'let myVar = anotherVar;') {
    console.log(`program.string() wrong. got=${program.string()}`);
  }
});
