import { Lexer } from '../lexer/lexer';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { Parser } from '../parser/parser';
import { monkeyEval } from '../evaluator/evaluator';
import { newEnvironment } from '../object/object';

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

  rl.on('line', async (input) => {
    const l = new Lexer(input);
    const p = new Parser(l);
    const program = p.parseProgram();

    if (p.errors().length !== 0) {
      printParseErrors(p.errors());
    }

    const evaluated = monkeyEval(program, env);
    if (evaluated !== null) {
      console.log(`${evaluated.inspect()}\n`);
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log('Session ended');
  });
}

main();
