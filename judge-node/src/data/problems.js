export const problems = [
  {
    id: 1,
    title: "Reverse String",
    difficulty: "Easy",
    description: "Write a function that reverses a string.",
    testcases: [
      { input: "hello\n", expected: "olleh" },
      { input: "world\n", expected: "dlrow" }
    ]
  }
];

export function getProblemById(id) {
  return problems.find((p) => p.id === Number(id)) || null;
}
