import { inferParamTypesFromTestcases, mapType } from '../utils.js';

/**
 * Standardizes user code for all languages.
 * @param {string} userCode - The raw user code
 * @param {object} problem - Problem object with functionName, testcases, etc.
 * @param {string} language - 'python' | 'java' | 'c' | 'cpp'
 * @returns {object} - { code, paramTypes, functionName }
 */
export function standardizeUserCode(userCode, problem, language) {
  const paramTypes = inferParamTypesFromTestcases(problem);
  const functionName = problem.functionName || 'solve';

  const { body, userParamNames } = stripUserSignature(userCode, language);

  // Use user's parameter names if available, fallback to inferred names
  const finalParams = paramTypes.map((p, i) => ({
    ...p,
    name: userParamNames[i] || p.name
  }));

  let correctedCode = '';

  if (language === 'python') {
    const pySig = `def ${functionName}(${finalParams.map(p => p.name).join(', ')}):`;
    const indentedBody = (body || 'pass').split('\n').map(line => '    ' + line).join('\n');
    correctedCode = `${pySig}\n${indentedBody}`;
  } else if (language === 'java') {
    const javaRet = mapType(detectReturnType(problem), 'java');
    const javaSig = `public ${javaRet} ${functionName}(${finalParams.map(p => mapType(p.type, 'java') + ' ' + p.name).join(', ')})`;
    correctedCode = `class Solution {\n    ${javaSig} {\n${body}\n    }\n}`;
  } else if (language === 'cpp') {
    const cppRet = mapType(detectReturnType(problem), 'cpp');
    const cppSig = `${cppRet} ${functionName}(${finalParams.map(p => {
      const t = mapType(p.type, 'cpp');
      return (t.startsWith('vector') ? 'const ' + t + '&' : t) + ' ' + p.name;
    }).join(', ')})`;
    correctedCode = `${cppSig} {\n${body}\n}`;
  } else if (language === 'c') {
    const cRet = mapType(detectReturnType(problem), 'c');
    const cSig = `${cRet} ${functionName}(${finalParams.map(p => mapType(p.type, 'c') + ' ' + p.name).join(', ')})`;
    correctedCode = `${cSig} {\n${body}\n}`;
  }

  return { code: correctedCode, paramTypes: finalParams, functionName };
}

function stripUserSignature(userCode, language) {
  let body = userCode.trim();
  let userParamNames = [];

  if (language === 'python') {
    const match = userCode.match(/^\s*def\s+\w+\s*\(([^)]*)\)\s*:/m);
    if (match) {
      userParamNames = match[1].split(',').map(n => n.trim().split(':')[0].trim()).filter(Boolean);
      body = userCode.replace(/^\s*def\s+\w+\s*\([^)]*\)\s*:\s*/, '').replace(/^\s*pass\s*/, '').trim();
    }
  } else if (language === 'java') {
    const match = userCode.match(/public\s+[\w\[\]<>]+\s+\w+\s*\(([^)]*)\)\s*\{/);
    if (match) {
      userParamNames = match[1].split(',').map(n => n.trim().split(/\s+/).pop()).filter(Boolean);
      let temp = userCode.trim();
      // Remove everything up to and including the signature's opening brace
      const sigIndex = temp.indexOf(match[0]);
      if (sigIndex !== -1) {
        temp = temp.substring(sigIndex + match[0].length);
      }
      // Remove last two closing braces (one for method, one for class)
      let count = 0;
      while (count < 2) {
        const lastBrace = temp.lastIndexOf('}');
        if (lastBrace === -1) break;
        temp = temp.substring(0, lastBrace);
        count++;
      }
      body = temp.trim();
    }
  } else if (language === 'cpp' || language === 'c') {
    const match = userCode.match(/\w+\s*\(([^)]*)\)\s*\{/);
    if (match) {
      userParamNames = match[1].split(',').map(n => n.trim().split(/\s+/).pop().replace(/^[*&]/, '')).filter(Boolean);
      let temp = userCode.trim();
      const sigIndex = temp.indexOf(match[0]);
      if (sigIndex !== -1) {
        temp = temp.substring(sigIndex + match[0].length);
      }
      const lastBrace = temp.lastIndexOf('}');
      if (lastBrace !== -1) temp = temp.substring(0, lastBrace);
      body = temp.trim();
    }
  }

  return { body, userParamNames };
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
