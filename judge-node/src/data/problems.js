// Input format: values are passed line-by-line (LeetCode style).
// Each line is consumed by a separate input() call in user code.

function assertAndNormalizeTestcases(testcases) {
  if (!Array.isArray(testcases) || testcases.length !== 15) {
    throw new Error("Each problem must define exactly 15 testcases");
  }

  return testcases.map((tc, index) => ({
    input: String(tc.input ?? ""),
    expected: String(tc.expected ?? ""),
    visible: index < 3
  }));
}

export const problems = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    testcases: assertAndNormalizeTestcases([
      { input: "[2,7,11,15]\n9", expected: "[0, 1]" },
      { input: "[3,2,4]\n6", expected: "[1, 2]" },
      { input: "[3,3]\n6", expected: "[0, 1]" },
      { input: "[1,5,3,8]\n9", expected: "[0, 3]" },
      { input: "[10,20,30,40]\n50", expected: "[0, 3]" },
      { input: "[-1,-2,-3,-4,-5]\n-8", expected: "[2, 4]" },
      { input: "[0,4,3,0]\n0", expected: "[0, 3]" },
      { input: "[1,2,3,4,5]\n9", expected: "[3, 4]" },
      { input: "[5,75,25]\n100", expected: "[1, 2]" },
      { input: "[2,5,5,11]\n10", expected: "[1, 2]" },
      { input: "[8,1,2,7]\n9", expected: "[0, 1]" },
      { input: "[6,3,9,12]\n15", expected: "[0, 2]" },
      { input: "[100,200,300,400]\n700", expected: "[2, 3]" },
      { input: "[11,22,33,44,55]\n66", expected: "[0, 4]" },
      { input: "[9,9,2,7]\n18", expected: "[0, 1]" }
    ])
  },
  {
    id: 2,
    title: "Reverse String",
    difficulty: "Easy",
    description: "Write a function that reverses a string.",
    testcases: assertAndNormalizeTestcases([
      { input: "hello", expected: "olleh" },
      { input: "world", expected: "dlrow" },
      { input: "abcd", expected: "dcba" },
      { input: "python", expected: "nohtyp" },
      { input: "battle", expected: "elttab" },
      { input: "a", expected: "a" },
      { input: "racecar", expected: "racecar" },
      { input: "CodeClash", expected: "hsalCedoC" },
      { input: "12345", expected: "54321" },
      { input: "leetcode", expected: "edocteel" },
      { input: "space test", expected: "tset ecaps" },
      { input: "UPPER", expected: "REPPU" },
      { input: "lower", expected: "rewol" },
      { input: "x y z", expected: "z y x" },
      { input: "!@#", expected: "#@!" }
    ])
  },
  {
    id: 3,
    title: "FizzBuzz",
    difficulty: "Easy",
    description:
      "Given an integer n, print numbers from 1 to n. For multiples of 3 print Fizz, for 5 print Buzz, for both print FizzBuzz.",
    testcases: assertAndNormalizeTestcases([
      { input: "5", expected: "1\n2\nFizz\n4\nBuzz" },
      { input: "3", expected: "1\n2\nFizz" },
      { input: "15", expected: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz" },
      { input: "1", expected: "1" },
      { input: "2", expected: "1\n2" },
      { input: "6", expected: "1\n2\nFizz\n4\nBuzz\nFizz" },
      { input: "10", expected: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz" },
      { input: "8", expected: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8" },
      { input: "9", expected: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz" },
      { input: "11", expected: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11" },
      { input: "12", expected: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz" },
      { input: "13", expected: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13" },
      { input: "14", expected: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14" },
      { input: "16", expected: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16" },
      { input: "18", expected: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz" }
    ])
  },
  {
    id: 4,
    title: "Palindrome Check",
    difficulty: "Easy",
    description: "Given a string, determine if it is a palindrome.",
    testcases: assertAndNormalizeTestcases([
      { input: "racecar", expected: "True" },
      { input: "hello", expected: "False" },
      { input: "madam", expected: "True" },
      { input: "level", expected: "True" },
      { input: "abba", expected: "True" },
      { input: "abc", expected: "False" },
      { input: "a", expected: "True" },
      { input: "noon", expected: "True" },
      { input: "python", expected: "False" },
      { input: "rotor", expected: "True" },
      { input: "refer", expected: "True" },
      { input: "code", expected: "False" },
      { input: "civic", expected: "True" },
      { input: "deed", expected: "True" },
      { input: "battle", expected: "False" }
    ])
  },
  {
    id: 5,
    title: "Maximum Subarray",
    difficulty: "Medium",
    description:
      "Given an integer array nums, find the contiguous subarray with the largest sum and return its sum.",
    testcases: assertAndNormalizeTestcases([
      { input: "[-2,1,-3,4,-1,2,1,-5,4]", expected: "6" },
      { input: "[1]", expected: "1" },
      { input: "[5,4,-1,7,8]", expected: "23" },
      { input: "[-1,-2,-3]", expected: "-1" },
      { input: "[2,-1,2,3,4,-5]", expected: "10" },
      { input: "[0,0,0]", expected: "0" },
      { input: "[3,-2,5,-1]", expected: "6" },
      { input: "[-2,-1]", expected: "-1" },
      { input: "[1,2,3,4]", expected: "10" },
      { input: "[8,-19,5,-4,20]", expected: "21" },
      { input: "[-2,3,2,-1]", expected: "5" },
      { input: "[4,-1,2,1]", expected: "6" },
      { input: "[-5,4,6,-3,4,-1]", expected: "11" },
      { input: "[2,2,-1,2]", expected: "5" },
      { input: "[1,-1,1,-1,1,-1,1]", expected: "1" }
    ])
  }
];

export function getProblemById(id) {
  return problems.find((p) => p.id === Number(id)) || null;
}
