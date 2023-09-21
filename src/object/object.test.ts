import { MonkeyString } from "./object"

test('test string hash key', () => {
  const hello1 = new MonkeyString('Hello World');
  const hello2 = new MonkeyString('Hello World');
  const diff1 = new MonkeyString('My name is johnny');
  const diff2 = new MonkeyString('My name is johnny');

  expect(hello1.hashKey()).toStrictEqual(hello2.hashKey());
  expect(diff1.hashKey()).toStrictEqual(diff2.hashKey());
  expect(hello1.hashKey()).not.toStrictEqual(diff1.hashKey());
})
