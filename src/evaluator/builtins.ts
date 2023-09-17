import { Builtin, MonkeyObject, Err, MonkeyString, Integer } from '../object/object';

const builtins = new Map<string, Builtin>();
const lenFn = new Builtin(
  (args: MonkeyObject[]) => {
    if (args.length !== 1) {
      return new Err(`wrong number of arguments. got=${args.length}, want=${1}`)
    }

    switch (true) {
      case (args[0] instanceof MonkeyString):
        return new Integer((args[0] as MonkeyString).value.length);
      default:
        return new Err(`argument to "len" not supported, got ${args[0].type()}`)
    }
  });

builtins.set('len', lenFn);

export default builtins;
