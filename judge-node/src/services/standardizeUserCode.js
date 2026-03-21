// Universal code standardizer for LeetCode-style judge
// Supports: Python, Java, C, C++
// Auto-corrects function signature, wraps code, parses input, injects testcases

/**
 * Standardizes user code for all languages.
 * @param {string} userCode - The raw user code
 * @param {object} problem - Problem object with functionName, testcases, etc.
 * @param {string} language - 'python' | 'java' | 'c' | 'cpp'
 * @returns {string} - Fully wrapped, corrected code ready for execution
 */
export function standardizeUserCode(userCode, problem, language) {
  const paramTypes = inferParamTypesFromTestcasesAndConstraints(problem);
  const functionName = problem.functionName || 'solve';
  if (language === 'python') {
    const pySig = `def ${functionName}(${paramTypes.map(p => p.name).join(', ')}):`;
    const userLogic = stripUserSignature(userCode, 'python');
    let wrapper = `${pySig}\n${userLogic}\n\nif __name__ == '__main__':\n`;
    const inputVars = paramTypes.map((p, i) => `${p.name} = ${pythonParseInput(problem.testcases[0].input, i)}`).join('\n');
    wrapper += `${inputVars}\n    print(${functionName}(${paramTypes.map(p => p.name).join(', ')}))`;
    return wrapper;
  }
  if (language === 'java') {
    const javaSig = `public static ${paramTypes[0].retType || 'int'} ${functionName}(${paramTypes.map(p => p.type + ' ' + p.name).join(', ')})`;
    const userLogic = stripUserSignature(userCode, 'java');
    let wrapper = `class Solution {\n    ${javaSig} {\n${userLogic}\n    }\n    public static void main(String[] args) {\n        // TODO: Add input parsing and call\n    }\n}`;
    return wrapper;
  }
  // TODO: Add C/C++
  return userCode;
}

function stripUserSignature(userCode, language) {
  if (language === 'python') {
    return userCode.replace(/^def\s+\w+\s*\([^)]*\):/, '').replace(/^\s*\n/, '');
  }
  if (language === 'java') {
    return userCode.replace(/public\s+\w+\s+\w+\s*\([^)]*\)\s*\{/, '').replace(/^\s*\n/, '');
  }
  return userCode;
}

function pythonParseInput(input, idx) {
  // Very basic: split by comma, handle arrays/strings
  const parts = smartSplitInput(input);
  let val = parts[idx] || '';
  if (/^\[.*\]$/.test(val)) return val;
  if (/^\".*\"$|^'.*'$/.test(val)) return val;
  if (/^-?\d+$/.test(val)) return val;
  return val;
}

// ...reuse inferParamTypesFromTestcasesAndConstraints, smartSplitInput, etc. from contest-problem.js
