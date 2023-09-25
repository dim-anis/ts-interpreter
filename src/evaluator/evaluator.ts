import { ArrayLiteral, BlockStatement, BooleanLiteral, CallExpression, Expression, ExpressionStatement, FunctionLiteral, HashLiteral, Identifier, IfExpression, IndexExpression, InfixExpression, IntegerLiteral, LetStatement, Node, PrefixExpression, Program, ReturnStatement, StringLiteral, modify } from "../ast/ast";
import { Boolean, Environment, Err, MonkeyFunction, Integer, MonkeyObject, MonkeyNull, OBJECT_TYPE, ReturnValue, newEnclosedEnvironment, MonkeyString, Builtin, MonkeyArray, HashKey, HashPair, MonkeyHash, Hashable, Quote } from "../object/object";
import { TokenType, createNewToken } from "../token/token";
import builtins from "./builtins";

export const NATIVE_TO_OBJ = {
  TRUE: new Boolean(true),
  FALSE: new Boolean(false),
  NULL: new MonkeyNull(),
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
    case node instanceof CallExpression: {
      if ((node as CallExpression).fn.tokenLiteral() === 'quote') {
        return quote((node as CallExpression).arguments[0], env);
      }
      const fn = monkeyEval((node as CallExpression).fn, env);
      if (isError(fn)) {
        return fn;
      }

      const args = evalExpressions((node as CallExpression).arguments, env);

      if (args.length === 1 && isError(args[0])) {
        return args[0];
      }

      return applyFunction(fn, args);
    }
    case node instanceof IndexExpression: {
      const left = monkeyEval((node as IndexExpression).left, env);
      if (isError(left)) {
        return left;
      }

      const index = monkeyEval((node as IndexExpression).index, env);
      if (isError(index)) {
        return index;
      }
      return evalIndexExpression(left, index);
    }
    case node instanceof FunctionLiteral: {
      const { parameters, body } = node as FunctionLiteral;
      return new MonkeyFunction(parameters || [], body, env);
    }
    case node instanceof IntegerLiteral:
      return new Integer((node as IntegerLiteral).value);
    case node instanceof StringLiteral:
      return new MonkeyString((node as StringLiteral).value);
    case node instanceof BooleanLiteral:
      return nativeBoolToBooleanObject((node as BooleanLiteral).value);
    case node instanceof ArrayLiteral: {
      const elements = evalExpressions((node as ArrayLiteral).elements, env);
      if (elements.length === 1 && isError(elements[0])) {
        return elements[0];
      }
      return new MonkeyArray(elements);
    }
    case node instanceof HashLiteral:
      return evalHashLiteral((node as HashLiteral), env);
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
      case evaluated instanceof Err:
        if (evaluated instanceof Err) {
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

function evalHashLiteral(node: HashLiteral, env: Environment): MonkeyObject {
  const pairs: Map<string, HashPair> = new Map();

  node.pairs.forEach((valNode, keyNode) => {
    const key = monkeyEval(keyNode, env);
    if (isError(key)) {
      return key;
    }

    if (!('hashKey' in key)) {
      return new Err(`unusable as hash key: ${key.type()}`);
    }

    const hashKey = key as Hashable;

    const value = monkeyEval(valNode, env);
    if (isError(value)) {
      return value;
    }

    const hashed = hashKey.hashKey();
    pairs.set(JSON.stringify(hashed), new HashPair(key, value));

    return pairs;
  })

  return new MonkeyHash(pairs);
}

function evalExpressions(exps: Expression[], env: Environment): MonkeyObject[] {
  const result: MonkeyObject[] = [];

  for (const exp of exps) {
    const evaluated = monkeyEval(exp, env);

    if (isError(evaluated)) {
      return [evaluated];
    }

    result.push(evaluated);
  }

  return result;
}

function evalPrefixExpression(operator: string, right: MonkeyObject): MonkeyObject {
  switch (operator) {
    case '!':
      return evalBangOperatorExpression(right);
    case '-':
      return evalMinusPrefixOperatorExpression(right);
    default:
      return new Err(`unknown operator: ${operator}${right.type()}`);
  }
}

function evalInfixExpression(operator: string, left: MonkeyObject, right: MonkeyObject): MonkeyObject {
  switch (true) {
    case (left.type() === OBJECT_TYPE.INTEGER_OBJ) && (right.type() === OBJECT_TYPE.INTEGER_OBJ):
      return evalIntegerInfixExpression(operator, left, right);
    case (left.type() === OBJECT_TYPE.STRING_OBJ) && (right.type() === OBJECT_TYPE.STRING_OBJ):
      return evalStringInfixExpression(operator, left, right);
    case operator === '==': {
      return nativeBoolToBooleanObject(left === right);
    }
    case operator === '!=': {
      return nativeBoolToBooleanObject(left !== right);
    }
    case left.type() !== right.type():
      return new Err(`type mismatch: ${left.type()} ${operator} ${right.type()}`);
    default:
      return new Err(`unknown operator: ${left.type()} ${operator} ${right.type()}`);
  }
}

function evalIndexExpression(left: MonkeyObject, index: MonkeyObject): MonkeyObject {
  switch (true) {
    case left.type() === OBJECT_TYPE.ARRAY_OBJ && index.type() === OBJECT_TYPE.INTEGER_OBJ: {
      return evalArrayIndexExpression(left, index);
    }
    case left.type() === OBJECT_TYPE.HASH_OBJ: {
      return evalHashIndexExpression(left, index);
    }
    default:
      return new Err(`index operator not supported: ${left.type()}`);
  }
}

function evalIdentifier(node: Identifier, env: Environment): MonkeyObject {
  const val = env.get(node.value);

  if (val) {
    return val;
  }

  const builtin = builtins.get(node.value);
  if (builtin) {
    return builtin;
  }

  return new Err(`identifier not found: ${node.value}`)
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
    return new Err(`unknown operator: -${right.type()}`);
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
      return new Err(`unknown operator: ${right.type()} ${operator} ${right.type()}`);
  }
}

function evalStringInfixExpression(operator: string, left: MonkeyObject, right: MonkeyObject): MonkeyObject {
  if (operator !== '+') {
    return new Err(`unknown operator: ${left.type()} ${operator} ${right.type()}`);
  }

  const leftVal = (left as MonkeyString).value;
  const rightVal = (right as MonkeyString).value;

  return new MonkeyString(leftVal + rightVal);
}

function evalArrayIndexExpression(array: MonkeyObject, index: MonkeyObject): MonkeyObject {
  const arrayObj = array as MonkeyArray;
  const idx = (index as Integer).value;
  const max = arrayObj.elements.length - 1;

  if (idx < 0 || idx > max) {
    return NATIVE_TO_OBJ.NULL;
  }

  return arrayObj.elements[idx];
}

function evalHashIndexExpression(hash: MonkeyObject, index: MonkeyObject): MonkeyObject {
  const hashObject = hash as MonkeyHash;

  if (!('hashKey' in index)) {
    return new Err(`unusable as hash key: ${index.type()}`)
  }

  const key = index as Hashable;

  const pair = hashObject.pairs.get(JSON.stringify(key.hashKey()));

  return pair ? pair.value : NATIVE_TO_OBJ.NULL;
}

function nativeBoolToBooleanObject(input: boolean): MonkeyObject {
  if (input) {
    return NATIVE_TO_OBJ.TRUE;
  }

  return NATIVE_TO_OBJ.FALSE;
}

function applyFunction(fn: MonkeyObject, args: MonkeyObject[]): MonkeyObject {
  switch (true) {
    case (fn instanceof MonkeyFunction): {
      const extendedEnv = extendedFunctionEnv(fn as MonkeyFunction, args);
      const evaluated = monkeyEval((fn as MonkeyFunction).body, extendedEnv);
      return unwrapedReturnValue(evaluated);
    }
    case (fn instanceof Builtin): {
      return (fn as Builtin).fn(args);
    }
    default:
      return new Err(`not a function: ${fn.type()}`);
  }
}

function extendedFunctionEnv(fn: MonkeyFunction, args: MonkeyObject[]): Environment {
  const env = newEnclosedEnvironment(fn.env);

  for (const [paramIdx, param] of fn.parameters.entries()) {
    env.set(param.value, args[paramIdx]);
  }

  return env;
}

function unwrapedReturnValue(obj: MonkeyObject): MonkeyObject {
  if (obj instanceof ReturnValue) {
    return obj.value;
  }

  return obj;
}

function quote(node: Node, env: Environment): MonkeyObject {
  node = evalUnquoteCalls(node, env);
  return new Quote(node);
}

function evalUnquoteCalls(quoted: Node, env: Environment): Node {
  return modify(quoted, (node): Node => {
    if (!isUnquoteCall(node)) {
      return node;
    }

    if (!(node instanceof CallExpression)) {
      return node;
    }

    const call = node as CallExpression;
    if (call.arguments.length !== 1) {
      return node;
    }

    const unquoted = monkeyEval(call.arguments[0], env);
    return convertObjectToASTNode(unquoted);
  })
}

function isUnquoteCall(node: Node): boolean {
  if (!(node instanceof CallExpression)) {
    return false;
  }
  const callExp = node

  return callExp.fn.tokenLiteral() === 'unquote'
}

function convertObjectToASTNode(obj: MonkeyObject): Node {
  switch (obj.type()) {
    case 'INTEGER': {
      const t = createNewToken(TokenType.INT, (obj as Integer).value.toString());
      const intLiteral = new IntegerLiteral(t);
      intLiteral.value = (obj as Integer).value;
      return intLiteral;
    }
    default:
      return new IntegerLiteral({ type: TokenType.INT, literal: '0' });
  }
}
