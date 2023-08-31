import { Lexer } from "../lexer/lexer";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";


async function main() {
  const rl = readline.createInterface({
    input,
    output,
  });

  console.log(`Welcome to TS version of Monkey Language!

Type some legal Monkey statements, 
but be careful not to launch your machine into an infinite loop as this is a WIP!`)

  rl.setPrompt(">> ");
  rl.prompt();

  rl.on('line', async (input) => {
    const l = new Lexer(input);

    while (true) {
      const token = l.nextToken();
      console.log(token);
      if (token.type === '') {
        break;
      }
    }
  });

  rl.on('close', () => {
    console.log('Session ended')
  })
}

main();
