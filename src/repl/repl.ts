import { Lexer } from '../lexer/lexer';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { Parser } from '../parser/parser';
import { monkeyEval } from '../evaluator/evaluator';
import { newEnvironment } from '../object/object';
import { defineMacros, expandMacros } from '../evaluator/evaluator';

async function main() {
  const rl = readline.createInterface({
    input,
    output,
    prompt: '>> ',
  });

  console.log(`Welcome to TS version of Monkey Language!

Type some legal Monkey statements, 
but be careful not to launch your machine into an infinite loop as this is a WIP!`);

  rl.prompt();

  const env = newEnvironment();
  const macroEnv = newEnvironment();

  rl.on('line', async (input) => {
    const l = new Lexer(input);
    const p = new Parser(l);
    const program = p.parseProgram();

    if (p.errors().length !== 0) {
      printParseErrors(p.errors());
    }

    defineMacros(program, macroEnv);
    const expanded = expandMacros(program, macroEnv);
    const evaluated = monkeyEval(expanded, env);

    if (Object.keys(evaluated).length > 0) {
      console.log(`${evaluated.inspect()}\n`);
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log('Session ended');
  });
}

function printParseErrors(errors: string[]) {
  const out: string[] = [
    'Woops, we ran into some problems!',
    'parser errors:',
  ];

  for (const err of errors) {
    out.push(`\t${err}\n`);
  }

  console.error(out.join('\n'));
}

main();
