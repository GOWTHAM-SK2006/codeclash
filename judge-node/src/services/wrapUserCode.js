// Utility to wrap user code for function-only execution (LeetCode style)
// Usage: wrapUserCode(userCode, functionName, testcases)

/**
 * Wraps user function code with a test runner that calls the function for each testcase.
 * @param {string} userCode - The user's function code (e.g., def twoSum(nums, target): ...)
 * @param {string} functionName - The function name to call (e.g., 'twoSum')
 * @param {Array<{input: string}>} testcases - Array of testcases with input as string (Python literal)
 * @returns {string} - The full Python code to execute
 */
export function wrapUserCode(userCode, functionName, testcases) {
  let runner = userCode + '\n';
  runner += 'def __run():\n';
  testcases.forEach((tc, idx) => {
    runner += `    try:\n`;
    runner += `        result = ${functionName}(*${tc.input})\n`;
    runner += `        print(\"CASE${idx}:\", result)\n`;
    runner += `    except Exception as e:\n`;
    runner += `        print(\"CASE${idx}:__EXCEPTION__\", e)\n`;
  });
  runner += '\n__run()\n';
  return runner;
}
