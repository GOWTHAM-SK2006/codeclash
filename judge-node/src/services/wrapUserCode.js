import { smartSplitInput, mapType } from '../utils.js';

export function wrapUserCode(userCode, functionName, testcases, language, paramTypes) {
  if (language === 'python') return wrapPython(userCode, functionName, testcases);
  if (language === 'java') return wrapJava(userCode, functionName, testcases, paramTypes);
  if (language === 'cpp') return wrapCpp(userCode, functionName, testcases, paramTypes);
  if (language === 'c') return wrapC(userCode, functionName, testcases, paramTypes);
  return userCode;
}

function wrapPython(userCode, functionName, testcases) {
  let runner = userCode + '\n\n';
  runner += 'def __run():\n';
  testcases.forEach((tc, idx) => {
    runner += `    try:\n`;
    runner += `        result = ${functionName}(${tc.input})\n`;
    runner += `        print(\"CASE${idx}:\", result, flush=True)\n`;
    runner += `    except Exception as e:\n`;
    runner += `        print(\"CASE${idx}:__EXCEPTION__\", e, flush=True)\n`;
  });
  runner += '\n__run()\n';
  return runner;
}

function wrapJava(userCode, functionName, testcases, paramTypes) {
  let runner = `import java.util.*;\n\n`;
  runner += userCode + '\n\n';
  runner += `class SolutionRunner {\n`; // Removed public to avoid filename mismatch if any
  runner += `    public static String toString(Object obj) {\n`;
  runner += `        if (obj == null) return "null";\n`;
  runner += `        if (obj instanceof int[]) return Arrays.toString((int[])obj);\n`;
  runner += `        if (obj instanceof double[]) return Arrays.toString((double[])obj);\n`;
  runner += `        if (obj instanceof boolean[]) return Arrays.toString((boolean[])obj);\n`;
  runner += `        if (obj instanceof String[]) return Arrays.toString((String[])obj);\n`;
  runner += `        return String.valueOf(obj);\n`;
  runner += `    }\n`;
  runner += `    public static void main(String[] args) {\n`;
  runner += `        Solution sol = new Solution();\n`;
  testcases.forEach((tc, idx) => {
    const inputs = smartSplitInput(tc.input);
    runner += `        try {\n`;
    const callArgs = inputs.map((val, i) => {
      const type = paramTypes[i].type;
      if (type.endsWith('[]')) {
        const innerType = type.replace('[]', '');
        const javaVal = val.replace(/^\[/, '{').replace(/\]$/, '}');
        return `new ${innerType}[]${javaVal}`;
      }
      return val;
    }).join(', ');
    runner += `            System.out.println("CASE${idx}: " + toString(sol.${functionName}(${callArgs})));\n`;
    runner += `        } catch (Exception e) {\n`;
    runner += `            System.out.println("CASE${idx}:__EXCEPTION__ " + e.getMessage());\n`;
    runner += `        }\n`;
  });
  runner += `    }\n}\n`;
  return runner;
}

function wrapCpp(userCode, functionName, testcases, paramTypes) {
  let runner = `#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\n`;
  runner += `template<typename T>\nstring toString(const vector<T>& v) {\n  string s = "[";\n  for(size_t i=0; i<v.size(); i++) { \n    if constexpr (is_same_v<T, string>) s += "\\"" + v[i] + "\\""; \n    else s += to_string(v[i]); \n    if(i<v.size()-1) s += ", "; \n  }\n  return s + "]";\n}\n`;
  runner += `string toString(const string& s) { return "\\"" + s + "\\""; }\n`;
  runner += `string toString(int i) { return to_string(i); }\n`;
  runner += `string toString(double d) { return to_string(d); }\n`;
  runner += `string toString(bool b) { return b ? "true" : "false"; }\n\n`;
  runner += userCode + '\n\n';
  runner += `int main() {\n`;
  testcases.forEach((tc, idx) => {
    const inputs = smartSplitInput(tc.input);
    runner += `    try {\n`;
    const callArgs = inputs.map((val, i) => {
      const type = paramTypes[i].type;
      const cppType = mapType(type, 'cpp');
      if (type.endsWith('[]')) {
        const innerVal = val.replace(/^\[/, '{').replace(/\]$/, '}');
        return `${cppType}${innerVal}`;
      }
      return val;
    }).join(', ');
    runner += `        cout << "CASE${idx}: " << toString(${functionName}(${callArgs})) << endl;\n`;
    runner += `    } catch (...) {\n`;
    runner += `        cout << "CASE${idx}:__EXCEPTION__" << endl;\n`;
    runner += `    }\n`;
  });
  runner += `    return 0;\n}\n`;
  return runner;
}

function wrapC(userCode, functionName, testcases, paramTypes) {
  let runner = `#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\n`;
  runner += userCode + '\n\n';
  runner += `int main() {\n`;
  testcases.forEach((tc, idx) => {
    const inputs = smartSplitInput(tc.input);
    const callArgs = inputs.map((val, i) => {
      const p = paramTypes[i];
      if (p.type.endsWith('[]')) {
        const innerVal = val.replace(/^\[/, '{').replace(/\]$/, '}');
        const innerType = p.type.replace('[]', '');
        runner += `    ${innerType} p${i}_${idx}[] = ${innerVal};\n`;
        return `p${i}_${idx}`;
      }
      return val;
    }).join(', ');

    // For C, we assume int return for now, or double if detectReturnType says so.
    runner += `    printf("CASE${idx}: %d\\n", ${functionName}(${callArgs}));\n`;
  });
  runner += `    return 0;\n}\n`;
  return runner;
}
