import { BlockStatement, BooleanLiteral, ExpressionStatement, IfExpression, InfixExpression, IntegerLiteral, Node, PrefixExpression, Program, ReturnStatement, Statement } from "../ast/ast";
import { Boolean, Integer, MonkeyObject, Null, OBJECT_TYPE, ReturnValue } from "../object/object";

export const NATIVE_TO_OBJ = {
  TRUE: new Boolean(true),
  FALSE: new Boolean(false),
  NULL: new Null(),
}

export function monkeyEval(node: Node): MonkeyObject {
  switch (true) {
    case node instanceof Program:
      if (node instanceof Program) {
        return evalProgram(node as Program);
      }
      return NATIVE_TO_OBJ.NULL;
    case node instanceof ExpressionStatement:
      if (node instanceof ExpressionStatement && node.expression) {
        return monkeyEval(node.expression);
      }
      return NATIVE_TO_OBJ.NULL;
    case node instanceof PrefixExpression:
      if (node instanceof PrefixExpression && node.right) {
        const right = monkeyEval(node.right);
        return evalPrefixExpression(node.operator, right);
      }
      return NATIVE_TO_OBJ.NULL;
    case node instanceof InfixExpression:
      if (node instanceof InfixExpression && node.right && node.left) {
        const left = monkeyEval(node.left);
        const right = monkeyEval(node.right);
        return evalInfixExpression(node.operator, left, right);
      }
      return NATIVE_TO_OBJ.NULL;
    case node instanceof IntegerLiteral:
      return new Integer((node as IntegerLiteral).value);
    case node instanceof BooleanLiteral:
      return nativeBoolToBooleanObject((node as BooleanLiteral).value);
    case node instanceof BlockStatement:
      if (node instanceof BlockStatement) {
        return evalBlockStatement(node);
      }
      return NATIVE_TO_OBJ.NULL;
    case node instanceof IfExpression:
      return evalIfExpression((node as IfExpression));
    case node instanceof ReturnStatement:
      if (node instanceof ReturnStatement) {
        const val = monkeyEval(node.returnValue);
        return new ReturnValue(val);
      }
      return NATIVE_TO_OBJ.NULL;
    default:
      return NATIVE_TO_OBJ.NULL;
  }
}

function evalProgram(program: Program): MonkeyObject {
  let result = {};

  for (const stmt of program.statements) {
    const evaluated = monkeyEval(stmt);
    result = evaluated;

    if (evaluated instanceof ReturnValue) {
      return evaluated.value;
    }
  }

  return result as MonkeyObject;
}

function evalBlockStatement(block: BlockStatement): MonkeyObject {
  let result = {};

  for (const stmt of block.statements) {
    const evaluated = monkeyEval(stmt);
    result = evaluated;

    if (evaluated !== null && evaluated.type() === OBJECT_TYPE.RETURN_VALUE_OBJ) {
      return evaluated;
    }
  }

  return result as MonkeyObject;
}

function evalPrefixExpression(operator: string, right: MonkeyObject): MonkeyObject {
  switch (operator) {
    case '!':
      return evalBangOperatorExpression(right);
    case '-':
      return evalMinusPrefixOperatorExpression(right);
    default:
      return NATIVE_TO_OBJ.NULL;
  }
}

function evalInfixExpression(operator: string, left: MonkeyObject, right: MonkeyObject): MonkeyObject {
  switch (true) {
    case (left.type() === OBJECT_TYPE.INTEGER_OBJ) && (right.type() === OBJECT_TYPE.INTEGER_OBJ):
      return evalIntegerInfixExpression(operator, left, right);
    case operator === '==': {
      return nativeBoolToBooleanObject(left === right);
    }
    case operator === '!=': {
      return nativeBoolToBooleanObject(left !== right);
    }
    default:
      return NATIVE_TO_OBJ.NULL;
  }
}

function evalIfExpression(ie: IfExpression): MonkeyObject {
  const cond = ie.condition;
  if (!cond) {
    return NATIVE_TO_OBJ.NULL;
  }

  const condition = monkeyEval(cond);

  if (isTruthy(condition)) {
    return monkeyEval(ie.consequence);
  } else if (ie.alternative !== null) {
    return monkeyEval(ie.alternative);
  } else {
    return NATIVE_TO_OBJ.NULL;
  }
}

function isTruthy(obj: MonkeyObject): boolean {
  switch (obj) {
    case NATIVE_TO_OBJ.NULL:
      return false;
    case NATIVE_TO_OBJ.TRUE:
      return true;
    case NATIVE_TO_OBJ.FALSE:
      return false;
    default:
      return true;
  }
}

function evalBangOperatorExpression(right: MonkeyObject): MonkeyObject {
  switch (right) {
    case NATIVE_TO_OBJ.TRUE:
      return NATIVE_TO_OBJ.FALSE;
    case NATIVE_TO_OBJ.FALSE:
      return NATIVE_TO_OBJ.TRUE;
    case NATIVE_TO_OBJ.NULL:
      return NATIVE_TO_OBJ.TRUE;
    default:
      return NATIVE_TO_OBJ.FALSE;
  }
}

function evalMinusPrefixOperatorExpression(right: MonkeyObject): MonkeyObject {
  if (right.type() !== OBJECT_TYPE.INTEGER_OBJ) {
    return NATIVE_TO_OBJ.NULL;
  }

  const value = (right as Integer).value;
  return new Integer(-value);
}

function evalIntegerInfixExpression(operator: string, left: MonkeyObject, right: MonkeyObject): MonkeyObject {
  const leftVal = (left as Integer).value;
  const rightVal = (right as Integer).value;

  switch (operator) {
    case '+':
      return new Integer(leftVal + rightVal);
    case '-':
      return new Integer(leftVal - rightVal);
    case '*':
      return new Integer(leftVal * rightVal);
    case '/':
      return new Integer(leftVal / rightVal);
    case '<':
      return nativeBoolToBooleanObject(leftVal < rightVal);
    case '>':
      return nativeBoolToBooleanObject(leftVal > rightVal);
    case '==':
      return nativeBoolToBooleanObject(leftVal == rightVal);
    case '!=':
      return nativeBoolToBooleanObject(leftVal != rightVal);
    default:
      return NATIVE_TO_OBJ.NULL;
  }
}

function nativeBoolToBooleanObject(input: boolean): MonkeyObject {
  if (input) {
    return NATIVE_TO_OBJ.TRUE;
  }

  return NATIVE_TO_OBJ.FALSE;
}
