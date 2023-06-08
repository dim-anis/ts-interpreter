import type { Config } from '@jest/types';
import {compilerOptions} from './tsconfig.json';

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ['<rootDir>'],
  modulePaths: [compilerOptions.baseUrl],
  verbose: true,
  testPathIgnorePatterns: [
    'node_modules',
    'dist',
    'build',
    'out'
  ]
}
export default config;
