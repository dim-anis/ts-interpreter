module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  parserOptions: {
	  project: ['./tsconfig.json'],
	  tsconfigRootDir: __dirname,
	  ecmaVersion: 'latest',
	  sourceType: 'module',
  },
};
