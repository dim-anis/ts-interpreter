import * as readline from "node:readline/promises";
import {stdin as input} from "node:process";
import { Lexer } from "./lexer/lexer";
import { TokenType } from "./token/token";

const PROMPT = ">> ";

async function main() {
  const rl = readline.createInterface({input});
  rl.setPrompt(PROMPT);
  rl.prompt();

  rl.on('line', (input) => {
    const l = new Lexer(input);
    let tok = l.nextToken();

    while (tok.type !== TokenType.EOF) {
      console.log(tok);
      tok = l.nextToken();
    }
  })

  rl.on('close', () => console.log('exited'));
}

main();
