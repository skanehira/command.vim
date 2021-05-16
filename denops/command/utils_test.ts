// Reference: https://deno.land/manual@v1.10.1/testing/assertions
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import * as utils from "./utils.ts";

Deno.test("format fish history", () => {
  const tests = [
    {
      input: `- cmd: echo 1 \\\\\\n2\n  when: 1611401590`,
      want: [`echo 1 2`],
    },
    {
      input:
        `- cmd: echo 1\n  when: 1611401590\n- cmd: ls -la\n  when: 1611401590`,
      want: [`echo 1`, `ls -la`],
    },
  ];

  for (const test of tests) {
    const got = utils.formatFishHistory(test.input);
    assertEquals(got, test.want);
  }
});

Deno.test("format zsh history", () => {
  const tests = [
    {
      input: `echo "\"hello world\""`,
      want: [`echo "\"hello world\""`],
    },
    {
      input: `echo 1\\\n2\\\n3`,
      want: [`echo 1 2 3`],
    },
    {
      input: `echo 1\\\n2\nls`,
      want: [`echo 1 2`, `ls`],
    },
  ];

  for (const test of tests) {
    const got = utils.formatZshHistory(test.input);
    assertEquals(got, test.want);
  }
});
