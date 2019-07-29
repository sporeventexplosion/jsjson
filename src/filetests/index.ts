import { readdir, readFile } from 'fs';
import { promisify } from 'util';
import { join as joinPaths } from 'path';
import assert from 'assert';

import chalk from 'chalk';

import { parse } from '..';

const promiseReaddir = promisify(readdir);
const promiseReadFile = promisify(readFile);

const TEST_FILES = './__filetests/test_parsing';

enum ExpectedResult {
  Valid,
  Invalid,
  Indeterminate,
}

type TestResult = {
  filename: string;
  expected: ExpectedResult;
  actual: boolean;
  passed: boolean;
};

const getExpectedResult = (filename: string) => {
  switch (filename[0]) {
    case 'y':
      return ExpectedResult.Valid;
    case 'n':
      return ExpectedResult.Invalid;
    case 'i':
      return ExpectedResult.Indeterminate;
  }

  throw new TypeError(
    `Could not get expected test result for file name "${filename}"`
  );
};

const testFile = async (filename: string): Promise<TestResult> => {
  const contents = await promiseReadFile(joinPaths(TEST_FILES, filename), {
    encoding: 'utf-8',
  });
  const expected = getExpectedResult(filename);

  let valid = true;
  let parsed;
  let nativeParsed;
  try {
    parsed = parse(contents);
    nativeParsed = JSON.parse(contents);
  } catch (err) {
    valid = false;
  }

  if (valid) {
    assert.deepStrictEqual(parsed, nativeParsed);
  }

  // always pass for indeterminate
  let passed = true;
  switch (expected) {
    case ExpectedResult.Valid:
      passed = valid;
      break;
    case ExpectedResult.Invalid:
      passed = !valid;
  }

  return {
    filename,
    expected,
    actual: valid,
    passed,
  };
};

const expectedResultToString = (expectedResult: ExpectedResult) => {
  switch (expectedResult) {
    case ExpectedResult.Valid:
      return 'Valid';
    case ExpectedResult.Invalid:
      return 'Invalid';
    case ExpectedResult.Indeterminate:
      return 'Indeterminate';
  }
};

const printPassFailStatString = (results: TestResult[]) => {
  const [pass, fail] = results.reduce(
    ([pass, fail], current) =>
      current.passed ? [pass + 1, fail] : [pass, fail + 1],
    [0, 0]
  );

  console.log(`${pass} passed, ${fail} failed, ${results.length} total`);
};

const printTestResult = (result: TestResult) => {
  console.log(
    `${
      result.passed
        ? chalk.bgGreen.black('[PASS]')
        : chalk.bgRed.black('[FAIL]')
    }\t"${result.filename}"\t\tExpected ${expectedResultToString(
      result.expected
    )}\tActual ${result.actual ? 'Valid' : 'Invalid'}`
  );
}

const main = async () => {
  const filenames = await promiseReaddir(TEST_FILES);

  const results = await Promise.all(
    filenames.map(filename => testFile(filename))
  );

  for (const item of results) {
    printTestResult(item);
  }
  console.log();
  printPassFailStatString(results);
};

main();
