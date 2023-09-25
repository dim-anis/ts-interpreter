import { TokenType, createNewToken } from "../token/token";
import { BlockStatement, Expression, ExpressionStatement, Identifier, IfExpression, IndexExpression, InfixExpression, IntegerLiteral, LetStatement, Node, PrefixExpression, Program, modify } from "./ast";

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

  expect(program.string()).toEqual('let myVar = anotherVar;');
});

describe('test modify', () => {
  const token_1 = createNewToken(TokenType.INT, '1');
  const token_2 = createNewToken(TokenType.INT, '2');

  const one = (): Expression => {
    const intLiteral = new IntegerLiteral(token_1);
    intLiteral.value = 1;
    return intLiteral;
  }
  const two = (): Expression => {
    const intLiteral = new IntegerLiteral(token_2);
    intLiteral.value = 2;
    return intLiteral;
  }

  function turnOneIntoTwo(node: Node) {
    if (!(node instanceof IntegerLiteral)) {
      return node;
    }

    const integer = node;
    if (integer.value !== 1) {
      return node;
    }

    integer.value = 2;
    integer.token.literal = '2';
    return integer;
  }

  const p1 = new Program();
  const stmt_1 = new ExpressionStatement(token_1);
  stmt_1.expression = one();
  p1.statements = [stmt_1];

  const p2 = new Program();
  const stmt_2 = new ExpressionStatement(token_2);
  stmt_2.expression = two();
  p2.statements = [stmt_2];

  const infix1 = new InfixExpression({ type: TokenType.PLUS, literal: '+' });
  infix1.left = one();
  infix1.right = two();

  const infix2 = new InfixExpression({ type: TokenType.PLUS, literal: '+' });
  infix2.left = two();
  infix2.right = one();

  const infix3 = new InfixExpression({ type: TokenType.PLUS, literal: '+' });
  infix3.left = two();
  infix3.right = two();

  const prefix1 = new PrefixExpression({ type: TokenType.MINUS, literal: '-' });
  prefix1.right = one();
  const prefix2 = new PrefixExpression({ type: TokenType.MINUS, literal: '-' });
  prefix2.right = two();

  const idx1 = new IndexExpression({type: TokenType.LBRACKET, literal: '['}, one());
  idx1.index = one();
  const idx2 = new IndexExpression({type: TokenType.LBRACKET, literal: '['}, two());
  idx2.index = two();

  const ifExp1 = new IfExpression({type: TokenType.IF, literal: 'if'});
  ifExp1.condition = one();
  const blockStmt1 = new BlockStatement({type: TokenType.LBRACE, literal: '{'});
  blockStmt1.statements = [stmt_1];
  ifExp1.consequence = blockStmt1;
  ifExp1.alternative = blockStmt1;

  const ifExp2 = new IfExpression({type: TokenType.IF, literal: 'if'});
  ifExp2.condition = two();
  const blockStmt2 = new BlockStatement({type: TokenType.LBRACE, literal: '{'});
  blockStmt2.statements = [stmt_2];
  ifExp2.consequence = blockStmt2;
  ifExp2.alternative = blockStmt2;

  const tests: [Node, Node][] = [
    [one(), two()],
    [p1, p2],
    [infix1, infix3],
    [infix2, infix3],
    [prefix1, prefix2],
    [idx1, idx2],
    [ifExp1, ifExp2]
  ]

  test.each(tests)('modifying %p should result in %p', (input, expected) => {
    const modified = modify(input, turnOneIntoTwo);
    expect(modified).toEqual(expected);
  });
})
