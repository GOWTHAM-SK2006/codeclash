package com.codeclash.service;

import com.codeclash.entity.Problem;
import com.codeclash.repository.ProblemRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class TemplateValidationService {

    private final ProblemRepository problemRepository;
    private final DockerSandboxService dockerSandboxService;
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    public void autoFixIfNeeded(Problem problem) {
        String starterCode = problem.getStarterCode();
        String wrapperConfig = problem.getWrapperConfig();

        if (wrapperConfig == null || wrapperConfig.isBlank()) {
            return;
        }

        boolean pythonValid = isTemplateValid(starterCode, wrapperConfig, "PYTHON");
        boolean javaValid = isTemplateValid(starterCode, wrapperConfig, "JAVA");

        // If either is invalid (for simplicity we check the current starter code which
        // is usually language-agnostic in the DB or specifically one language)
        // In this platform, starterCode is often stored once and shared. Let's ensure
        // it's at least valid for the common patterns.
        if (!pythonValid && !javaValid) {
            log.info("Auto-fixing template for problem: {}", problem.getTitle());
            // Default to Python template as it's the most common starter code format in
            // data.sql
            problem.setStarterCode(generateDefaultTemplate(problem, "PYTHON"));
            problemRepository.save(problem);

            // Re-validate after fix
            if (!isTemplateValid(problem.getStarterCode(), wrapperConfig, "PYTHON")) {
                throw new RuntimeException("Could not fix problem template: " + problem.getTitle());
            }
        }

        // Final syntax check (dry run)
        validateSyntax(problem);
    }

    private void validateSyntax(Problem problem) {
        String code = problem.getStarterCode();
        // Since we mainly support Python for the quick battles, check Python syntax
        // For Java it's more complex as it needs the wrapper, but let's do a basic
        // check
        String executable = code;
        // Note: Full syntax check requires joining with wrapper, but we check the core
        // logic
        DockerSandboxService.ExecutionResult result = dockerSandboxService.execute("print('Syntax OK')\n" + code,
                "PYTHON");
        if (result.getExitCode() != 0 && !result.getStdout().contains("Syntax OK")) {
            log.warn("Syntax error detected in problem {}: {}", problem.getTitle(), result.getStderr());
            // If auto-fix failed to produce valid syntax, we might have a deeper issue
        }
    }

    public boolean isTemplateValid(String code, String wrapperConfigJson, String language) {
        if (code == null || code.isBlank() || wrapperConfigJson == null || wrapperConfigJson.isBlank()) {
            return false;
        }

        try {
            JsonNode config = OBJECT_MAPPER.readTree(wrapperConfigJson);
            String functionName = config.path("functionName").asText("").trim();
            if (functionName.isEmpty())
                return true; // Nothing to validate against

            if ("PYTHON".equalsIgnoreCase(language)) {
                return validatePython(code, functionName);
            } else if ("JAVA".equalsIgnoreCase(language)) {
                return validateJava(code, functionName);
            }
        } catch (Exception e) {
            log.warn("Failed to validate template: {}", e.getMessage());
        }
        return true; // Default to true if parsing fails to avoid blocking
    }

    private boolean validatePython(String code, String functionName) {
        return Pattern.compile("def\\s+" + functionName + "\\s*\\(").matcher(code).find();
    }

    private boolean validateJava(String code, String functionName) {
        boolean hasClass = code.contains("class Solution");
        boolean hasMethod = Pattern.compile("\\b" + functionName + "\\s*\\(").matcher(code).find();
        return hasClass && hasMethod;
    }

    public String generateDefaultTemplate(Problem problem, String language) {
        String wrapperConfig = problem.getWrapperConfig();
        if (wrapperConfig == null || wrapperConfig.isBlank()) {
            return "# Your code here";
        }

        try {
            JsonNode config = OBJECT_MAPPER.readTree(wrapperConfig);
            String functionName = config.path("functionName").asText("solution");
            JsonNode params = config.path("params");

            if ("PYTHON".equalsIgnoreCase(language)) {
                return generatePythonTemplate(functionName, params);
            } else if ("JAVA".equalsIgnoreCase(language)) {
                return generateJavaTemplate(functionName, params);
            }
        } catch (Exception e) {
            return "# Error generating template: " + e.getMessage();
        }
        return "";
    }

    private String generatePythonTemplate(String functionName, JsonNode params) {
        List<String> argNames = new ArrayList<>();
        if (params.isArray()) {
            for (JsonNode p : params) {
                argNames.add(p.path("name").asText("arg"));
            }
        }
        return "def " + functionName + "(" + String.join(", ", argNames) + "):\n    # Your code here\n    pass";
    }

    private String generateJavaTemplate(String functionName, JsonNode params) {
        List<String> args = new ArrayList<>();
        if (params.isArray()) {
            for (JsonNode p : params) {
                String name = p.path("name").asText("arg");
                String type = p.path("type").asText("str").toLowerCase();
                String javaType = switch (type) {
                    case "int", "number" -> "int";
                    case "float" -> "double";
                    case "bool", "boolean" -> "boolean";
                    case "json", "array", "list" -> "int[]";
                    default -> "String";
                };
                args.add(javaType + " " + name);
            }
        }
        return "public class Solution {\n    public Object " + functionName + "(" + String.join(", ", args)
                + ") {\n        // Your code here\n        return null;\n    }\n}";
    }
}
