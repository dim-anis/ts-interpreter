import { Lexer } from "../lexer/lexer";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = readline.createInterface({
  input,
  output
});

rl.setPrompt(">> ");

async function main() {
  await rl.question("Welcome to TS version of Monkey Interpreter!")

  rl.on('line', async (input) => {
    const l = new Lexer(input);
  })
}

main();
