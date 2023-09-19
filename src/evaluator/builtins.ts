import { Builtin, MonkeyObject, Err, MonkeyString, Integer, MonkeyArray, OBJECT_TYPE } from '../object/object';
import { NATIVE_TO_OBJ } from './evaluator';

const builtins = new Map<string, Builtin>();
const lenFn = new Builtin(
  (args: MonkeyObject[]): MonkeyObject => {
    if (args.length !== 1) {
      return new Err(`wrong number of arguments. got=${args.length}, want=${1}`)
    }

    switch (true) {
      case (args[0] instanceof MonkeyString):
        return new Integer((args[0] as MonkeyString).value.length);
      case (args[0] instanceof MonkeyArray):
        return new Integer((args[0] as MonkeyArray).elements.length);
      default:
        return new Err(`argument to "len" not supported, got ${args[0].type()}`)
    }
  });

const arrFirst = new Builtin(
  (args: MonkeyObject[]): MonkeyObject => {
    if (args.length !== 1) {
      return new Err(`wrong number of arguments. got=${args.length}, want=1`);
    }
    if (args[0].type() !== OBJECT_TYPE.ARRAY_OBJ) {
      return new Err(`argument to 'first' must be ARRAY, got ${args[0].type()}`)
    }

    const arr = args[0] as MonkeyArray;
    if (arr.elements.length > 0) {
      return arr.elements[0];
    }

    return NATIVE_TO_OBJ.NULL;
  });

const arrLast = new Builtin(
  (args: MonkeyObject[]): MonkeyObject => {
    if (args.length !== 1) {
      return new Err(`wrong number of arguments. got=${args.length}, want=1`);
    }
    if (args[0].type() !== OBJECT_TYPE.ARRAY_OBJ) {
      return new Err(`argument to 'last' must be ARRAY, got ${args[0].type()}`)
    }

    const arr = args[0] as MonkeyArray;
    if (arr.elements.length > 0) {
      return arr.elements[arr.elements.length - 1];
    }

    return NATIVE_TO_OBJ.NULL;
  }
)

const arrRest = new Builtin(
  (args: MonkeyObject[]): MonkeyObject => {
    if (args.length !== 1) {
      return new Err(`wrong number of arguments. got=${args.length}, want=1`);
    }
    if (args[0].type() !== OBJECT_TYPE.ARRAY_OBJ) {
      return new Err(`argument to 'rest' must be ARRAY, got ${args[0].type()}`)
    }

    const arr = args[0] as MonkeyArray;
    if (arr.elements.length > 0) {
      return new MonkeyArray(arr.elements.slice(1));
    }

    return NATIVE_TO_OBJ.NULL;
  }
)

const arrPush = new Builtin(
  (args: MonkeyObject[]): MonkeyObject => {
    if (args.length !== 2) {
      return new Err(`wrong number of arguments. got=${args.length}, want=2`);
    }
    if (args[0].type() !== OBJECT_TYPE.ARRAY_OBJ) {
      return new Err(`argument to 'push' must be ARRAY, got ${args[0].type()}`)
    }

    const arr = args[0] as MonkeyArray;
    return new MonkeyArray(arr.elements.concat(args[1]));
  }
)

builtins.set('len', lenFn);
builtins.set('first', arrFirst);
builtins.set('last', arrLast);
builtins.set('rest', arrRest);
builtins.set('push', arrPush);

export default builtins;
