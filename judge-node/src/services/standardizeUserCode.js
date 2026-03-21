import { inferParamTypesFromTestcases, mapType } from '../utils.js';

/**
 * Intelligent Code Standardizer (Magical Transformation)
 * Transforms beginner/incorrect code into platform-compatible Solution format.
 */
export function standardizeUserCode(userCode, problem, language) {
  const paramTypes = inferParamTypesFromTestcases(problem);
  const functionName = problem.functionName || 'solve';
  const returnType = detectReturnType(problem);

  let normalized = userCode.trim();

  if (language === 'java') {
    normalized = normalizeJava(normalized, functionName, paramTypes, returnType);
  } else if (language === 'python' || language === 'python3') {
    normalized = normalizePython(normalized, functionName, paramTypes);
  } else if (language === 'cpp') {
    normalized = normalizeCpp(normalized, functionName, paramTypes, returnType);
  } else if (language === 'c') {
    normalized = normalizeC(normalized, functionName, paramTypes, returnType);
  }

  return { code: normalized, paramTypes, functionName };
}

function normalizeJava(code, functionName, params, returnType) {
  // 1. Remove packages and imports (we provide standard imports)
  let clean = code.replace(/package\s+[\w\.]+;/g, '');

  // 2. Remove all class declarations but keep their bodies
  // Simple regex for top-level classes
  clean = clean.replace(/public\s+class\s+\w+\s*\{|class\s+\w+\s*\{/g, '');
  // Remove last closing brace if we removed a class (best effort)
  if (code.includes('class')) {
    const lastBrace = clean.lastIndexOf('}');
    if (lastBrace !== -1) clean = clean.substring(0, lastBrace);
  }

  // 3. Remove main method if exists
  clean = clean.replace(/public\s+static\s+void\s+main\s*\([^)]*\)\s*\{[^}]*\}/g, '');

  // 4. Remove I/O distractions
  clean = clean.replace(/Scanner\s+\w+\s*=\s*new\s*Scanner\([^)]*\);/g, '');
  clean = clean.replace(/System\.out\.println\(/g, '// System.out.println(');

  // 5. Wrap everything into Solution class and target method
  const javaRet = mapType(returnType, 'java');
  const javaParams = params.map(p => `${mapType(p.type, 'java')} ${p.name}`).join(', ');

  // If user already wrote the method, don't double wrap
  if (clean.includes(`${functionName}(`)) {
    return `class Solution {\n    public ${javaRet} ${functionName}(${javaParams}) {\n        ${clean}\n    }\n}`;
  }

  // Raw logic wrap
  return `class Solution {\n    public ${javaRet} ${functionName}(${javaParams}) {\n        ${clean}\n    }\n}`;
}

function normalizePython(code, functionName, params) {
  let clean = code.trim();

  // Remove common boilerplate
  clean = clean.replace(/import\s+sys/g, '');
  clean = clean.replace(/input\(\)/g, 'None # input() removed');
  clean = clean.replace(/print\(/g, '# print(');

  // Wrap in function if not already
  if (!clean.includes(`def ${functionName}`)) {
    const indent = clean.split('\n').map(l => '    ' + l).join('\n');
    return `def ${functionName}(${params.map(p => p.name).join(', ')}):\n${indent}`;
  }
  return clean;
}

function normalizeCpp(code, functionName, params, returnType) {
  let clean = code.trim();

  // Remove main
  clean = clean.replace(/int\s+main\s*\([^)]*\)\s*\{[^}]*\}/g, '');

  // Remove class Solution if user provided it to avoid double nesting
  clean = clean.replace(/class\s+Solution\s*\{/g, '').replace(/public:/g, '');

  const cppRet = mapType(returnType, 'cpp');
  const cppParams = params.map(p => `${mapType(p.type, 'cpp')} ${p.name}`).join(', ');

  return `class Solution {\npublic:\n    ${cppRet} ${functionName}(${cppParams}) {\n        ${clean}\n    }\n};`;
}

function normalizeC(code, functionName, params, returnType) {
  let clean = code.trim();
  clean = clean.replace(/int\s+main\s*\([^)]*\)\s*\{[^}]*\}/g, '');
  const cRet = mapType(returnType, 'c');
  const cParams = params.map(p => `${mapType(p.type, 'c')} ${p.name}`).join(', ');
  return `${cRet} ${functionName}(${cParams}) {\n    ${clean}\n}`;
}

function detectReturnType(problem) {
  const expected = String(problem.testcases?.[0]?.expected || '0');
  if (/^\[.*\]$/.test(expected)) return 'int[]';
  if (/^\".*\"$|^'.*'$/.test(expected)) return 'String';
  if (/^-?\d+$/.test(expected)) return 'int';
  if (/^-?\d*\.\d+$/.test(expected)) return 'double';
  if (/^(true|false)$/i.test(expected)) return 'boolean';
  return 'int';
}
