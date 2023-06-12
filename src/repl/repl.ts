import { Lexer } from "../lexer/lexer";
import { TokenType } from "../token/token";
import * as readline from "node:readline/promises";
import {stdin as input, stdout as output} from "node:process";

const PROMPT = ">> ";

async function main() {
  const rl = readline.createInterface({input, output});
  rl.setPrompt(PROMPT);
  const userInput = await rl.question("Welcome to TS version of Monkey Interpreter!")
  const l = new Lexer(userInput);
}

main();
