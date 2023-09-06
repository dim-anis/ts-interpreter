import { ExpressionStatement, IntegerLiteral, Node, Program, Statement } from "../ast/ast";
import { Integer, MonkeyObject } from "../object/object";

export function monkeyEval(node: Node): MonkeyObject | null {
  switch (true) {
    case node instanceof Program:
      return evalStatements((node as Program).statements);
    case node instanceof ExpressionStatement:
      if (node instanceof ExpressionStatement && node.expression) {
        return monkeyEval(node.expression);
      }
      return null;
    case node instanceof IntegerLiteral:
      return new Integer((node as IntegerLiteral).value);
    default:
      return null;
  }
}

function evalStatements(stmts: Statement[]): MonkeyObject {
  let result = {};

  for (const stmt of stmts) {
    const evaluated = monkeyEval(stmt);
    if (evaluated) {
      result = evaluated;
    }
  }

  return result as MonkeyObject;
}
