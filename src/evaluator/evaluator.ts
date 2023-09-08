import { BlockStatement, BooleanLiteral, ExpressionStatement, Identifier, IfExpression, InfixExpression, IntegerLiteral, LetStatement, Node, PrefixExpression, Program, ReturnStatement } from "../ast/ast";
import { Boolean, Environment, Error, Integer, MonkeyObject, Null, OBJECT_TYPE, ReturnValue } from "../object/object";

export const NATIVE_TO_OBJ = {
  TRUE: new Boolean(true),
  FALSE: new Boolean(false),
  NULL: new Null(),
}

export function monkeyEval(node: Node, env: Environment): MonkeyObject {
  switch (true) {
    case node instanceof Program:
      return evalProgram(node as Program, env);
    case node instanceof ExpressionStatement:
      if (node instanceof ExpressionStatement && node.expression) {
        return monkeyEval(node.expression, env);
      }
      return NATIVE_TO_OBJ.NULL;
    case node instanceof PrefixExpression:
      if (node instanceof PrefixExpression && node.right) {
        const right = monkeyEval(node.right, env);
        if (isError(right)) {
          return right;
        }
        return evalPrefixExpression(node.operator, right);
      }
      return NATIVE_TO_OBJ.NULL;
    case node instanceof InfixExpression:
      if (node instanceof InfixExpression && node.right && node.left) {
        const left = monkeyEval(node.left, env);
        const right = monkeyEval(node.right, env);
        if (isError(left)) {
          return left;
        }
        if (isError(right)) {
          return right;
        }
        return evalInfixExpression(node.operator, left, right);
      }
      return NATIVE_TO_OBJ.NULL;
    case node instanceof IntegerLiteral:
      return new Integer((node as IntegerLiteral).value);
    case node instanceof BooleanLiteral:
      return nativeBoolToBooleanObject((node as BooleanLiteral).value);
    case node instanceof BlockStatement:
      return evalBlockStatement(node as BlockStatement, env);
    case node instanceof LetStatement: {
      const val = monkeyEval((node as LetStatement).value, env);
      if (isError(val)) {
        return val;
      }

      env.set((node as LetStatement).name.value, val);
      return val;
    }
    case node instanceof IfExpression:
      return evalIfExpression((node as IfExpression), env);
    case node instanceof ReturnStatement: {
      const val = monkeyEval((node as ReturnStatement).returnValue, env);
      if (isError(val)) {
        return val;
      }
      return new ReturnValue(val);
    }
    case node instanceof Identifier:
      return evalIdentifier(node as Identifier, env);
    default:
      return NATIVE_TO_OBJ.NULL;
  }
}

function evalProgram(program: Program, env: Environment): MonkeyObject {
  let result = {};

  for (const stmt of program.statements) {
    const evaluated = monkeyEval(stmt, env);
    result = evaluated;

    switch (true) {
      case evaluated instanceof ReturnValue:
        if (evaluated instanceof ReturnValue) {
          return evaluated.value;
        }
        break;
      case evaluated instanceof Error:
        if (evaluated instanceof Error) {
          return evaluated;
        }
    }
  }

  return result as MonkeyObject;
}

function evalBlockStatement(block: BlockStatement, env: Environment): MonkeyObject {
  let result = {};

  for (const stmt of block.statements) {
    const evaluated = monkeyEval(stmt, env);
    result = evaluated;

    if (evaluated !== null) {
      const resultType = evaluated.type();
      if (resultType === OBJECT_TYPE.RETURN_VALUE_OBJ || resultType === OBJECT_TYPE.ERROR_OBJ) {
        return evaluated;
      }
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
      return new Error(`unknown operator: ${operator}${right.type()}`);
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
    case left.type() !== right.type():
      return new Error(`type mismatch: ${left.type()} ${operator} ${right.type()}`);
    default:
      return new Error(`unknown operator: ${left.type()} ${operator} ${right.type()}`);
  }
}

function evalIdentifier(node: Identifier, env: Environment): MonkeyObject {
  const val = env.get(node.value);

  if (!val) {
    return new Error(`identifier not found: ${node.value}`)
  }

  return val;
}

function evalIfExpression(ie: IfExpression, env: Environment): MonkeyObject {
  const cond = ie.condition;
  if (!cond) {
    return NATIVE_TO_OBJ.NULL;
  }

  const condition = monkeyEval(cond, env);

  if (isError(condition)) {
    return condition;
  }

  if (isTruthy(condition)) {
    return monkeyEval(ie.consequence, env);
  } else if (ie.alternative !== null) {
    return monkeyEval(ie.alternative, env);
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

function isError(obj: MonkeyObject): boolean {
  if (obj !== null) {
    return obj.type() === OBJECT_TYPE.ERROR_OBJ;
  }

  return false;
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
    return new Error(`unknown operator: -${right.type()}`);
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
      return new Error(`unknown operator: ${right.type()} ${operator} ${right.type()}`);
  }
}

function nativeBoolToBooleanObject(input: boolean): MonkeyObject {
  if (input) {
    return NATIVE_TO_OBJ.TRUE;
  }

  return NATIVE_TO_OBJ.FALSE;
}
