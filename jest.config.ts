import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ['<rootDir>'],
  verbose: true,
  testPathIgnorePatterns: [
    'node_modules',
    'dist',
    'build',
    'out'
  ]
}
export default config;
