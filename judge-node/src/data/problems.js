// Input format: values are passed line-by-line (LeetCode style).
// Each line is consumed by a separate input() call in user Python code.
// Example for Two Sum: first line = nums list, second line = target integer.

export const problems = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nInput (line 1): nums as a list literal, e.g. [2,7,11,15]\nInput (line 2): target as an integer, e.g. 9\nOutput: indices as a list, e.g. [0,1]",
    testcases: [
      { input: "[2,7,11,15]\n9", expected: "[0, 1]" },
      { input: "[3,2,4]\n6",     expected: "[1, 2]" },
      { input: "[3,3]\n6",       expected: "[0, 1]" }
    ]
  },
  {
    id: 2,
    title: "Reverse String",
    difficulty: "Easy",
    description:
      "Write a function that reverses a string.\n\nInput (line 1): a string, e.g. hello\nOutput: the reversed string, e.g. olleh",
    testcases: [
      { input: "hello", expected: "olleh" },
      { input: "world", expected: "dlrow" },
      { input: "abcd",  expected: "dcba"  }
    ]
  },
  {
    id: 3,
    title: "FizzBuzz",
    difficulty: "Easy",
    description:
      "Given an integer n, print numbers from 1 to n. For multiples of 3 print Fizz, for multiples of 5 print Buzz, for multiples of both print FizzBuzz.\n\nInput (line 1): n as an integer\nOutput: each result on its own line",
    testcases: [
      { input: "5",  expected: "1\n2\nFizz\n4\nBuzz" },
      { input: "15", expected: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz" }
    ]
  },
  {
    id: 4,
    title: "Palindrome Check",
    difficulty: "Easy",
    description:
      "Given a string, determine if it is a palindrome.\n\nInput (line 1): a string\nOutput: True or False",
    testcases: [
      { input: "racecar", expected: "True"  },
      { input: "hello",   expected: "False" },
      { input: "madam",   expected: "True"  }
    ]
  },
  {
    id: 5,
    title: "Maximum Subarray",
    difficulty: "Medium",
    description:
      "Given an integer array nums, find the contiguous subarray with the largest sum and return its sum.\n\nInput (line 1): nums as a list literal, e.g. [-2,1,-3,4,-1,2,1,-5,4]\nOutput: the maximum sum as an integer",
    testcases: [
      { input: "[-2,1,-3,4,-1,2,1,-5,4]", expected: "6" },
      { input: "[1]",                      expected: "1" },
      { input: "[5,4,-1,7,8]",             expected: "23" }
    ]
  }
];

export function getProblemById(id) {
  return problems.find((p) => p.id === Number(id)) || null;
}
