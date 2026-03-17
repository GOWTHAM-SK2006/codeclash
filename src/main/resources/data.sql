-- Seed Languages
INSERT INTO languages (name, slug, icon, color) VALUES ('Python', 'python', '🐍', '#3776AB') ON CONFLICT DO NOTHING;
INSERT INTO languages (name, slug, icon, color) VALUES ('Java', 'java', '☕', '#ED8B00') ON CONFLICT DO NOTHING;
INSERT INTO languages (name, slug, icon, color) VALUES ('C', 'c', '⚙️', '#A8B9CC') ON CONFLICT DO NOTHING;
INSERT INTO languages (name, slug, icon, color) VALUES ('C++', 'cpp', '🔧', '#00599C') ON CONFLICT DO NOTHING;
INSERT INTO languages (name, slug, icon, color) VALUES ('JavaScript', 'javascript', '🌐', '#F7DF1E') ON CONFLICT DO NOTHING;

-- Seed Topics for Python (language_id=1)
INSERT INTO topics (language_id, title, description, difficulty, order_index) VALUES (1, 'Variables & Data Types', 'Learn about Python variables, numbers, strings, and booleans.', 'Beginner', 1) ON CONFLICT DO NOTHING;
INSERT INTO topics (language_id, title, description, difficulty, order_index) VALUES (1, 'Control Flow', 'Master if/else statements, loops, and conditional logic.', 'Beginner', 2) ON CONFLICT DO NOTHING;
INSERT INTO topics (language_id, title, description, difficulty, order_index) VALUES (1, 'Functions', 'Define and use functions, parameters, and return values.', 'Intermediate', 3) ON CONFLICT DO NOTHING;
INSERT INTO topics (language_id, title, description, difficulty, order_index) VALUES (1, 'Data Structures', 'Lists, dictionaries, tuples, and sets in Python.', 'Intermediate', 4) ON CONFLICT DO NOTHING;

-- Seed Topics for Java (language_id=2)
INSERT INTO topics (language_id, title, description, difficulty, order_index) VALUES (2, 'Hello World & Basics', 'Java program structure, main method, and basic I/O.', 'Beginner', 1) ON CONFLICT DO NOTHING;
INSERT INTO topics (language_id, title, description, difficulty, order_index) VALUES (2, 'OOP Concepts', 'Classes, objects, inheritance, and polymorphism.', 'Intermediate', 2) ON CONFLICT DO NOTHING;
INSERT INTO topics (language_id, title, description, difficulty, order_index) VALUES (2, 'Collections Framework', 'ArrayList, HashMap, and other Java collections.', 'Advanced', 3) ON CONFLICT DO NOTHING;

-- Seed Topics for JavaScript (language_id=5)
INSERT INTO topics (language_id, title, description, difficulty, order_index) VALUES (5, 'JS Fundamentals', 'Variables, operators, and basic JavaScript concepts.', 'Beginner', 1) ON CONFLICT DO NOTHING;
INSERT INTO topics (language_id, title, description, difficulty, order_index) VALUES (5, 'DOM Manipulation', 'Selecting elements, events, and dynamic HTML.', 'Intermediate', 2) ON CONFLICT DO NOTHING;
INSERT INTO topics (language_id, title, description, difficulty, order_index) VALUES (5, 'Async JavaScript', 'Promises, async/await, and fetch API.', 'Advanced', 3) ON CONFLICT DO NOTHING;

-- Seed Lessons for Python Variables (topic_id=1)
INSERT INTO lessons (topic_id, title, content, code_example, exercise, order_index) VALUES
(1, 'Introduction to Variables', 'Variables are containers for storing data values. In Python, you don''t need to declare a variable type.', 'x = 5\nname = "Alice"\nis_student = True\nprint(x, name, is_student)', 'Create variables for your name, age, and whether you are a student. Print them all.', 1) ON CONFLICT DO NOTHING;
INSERT INTO lessons (topic_id, title, content, code_example, exercise, order_index) VALUES
(1, 'Numbers and Strings', 'Python supports integers, floats, and complex numbers. Strings are sequences of characters.', 'age = 25\npi = 3.14159\ngreeting = "Hello, World!"\nprint(type(age), type(pi), type(greeting))', 'Calculate the area of a circle with radius 7 and store it in a variable.', 2) ON CONFLICT DO NOTHING;

-- Seed Problems
-- INSERT first (for fresh DBs), then UPDATE to fix stale data in existing DBs.
-- UPDATE always runs so old rows with wrong test_cases/starter_code are corrected.

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Two Sum', 'Given an array of integers and a target, return indices of two numbers that add up to the target.
Read the array from input() on line 1 and the target on line 2.', 'Easy',
'def two_sum(nums, target):
    # Your code here
    pass',
'[{"input":"[2,7,11,15]\n9","expected":"[0, 1]"},{"input":"[3,2,4]\n6","expected":"[1, 2]"},{"input":"[3,3]\n6","expected":"[0, 1]"}]',
'[0, 1]', 10, 'Arrays') ON CONFLICT DO NOTHING;

UPDATE problems SET
    description = 'Given an array of integers and a target, return indices of two numbers that add up to the target.
Write a function twoSum(nums, target) that returns the answer.',
    starter_code = 'def twoSum(nums, target):
    # Your code here
    pass',
    test_cases = '[{"input":"[2,7,11,15]\n9","expected":"[0, 1]"},{"input":"[3,2,4]\n6","expected":"[1, 2]"},{"input":"[3,3]\n6","expected":"[0, 1]"}]',
    expected_output = '[0, 1]',
    wrapper_config = '{"functionName":"twoSum","params":[{"name":"nums","type":"json"},{"name":"target","type":"int"}]}'
WHERE title = 'Two Sum';

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Reverse String', 'Write a function that reverses a string.
Read a string from input() and print its reverse.', 'Easy',
's = input()
print(s[::-1])',
'[{"input":"hello","expected":"olleh"},{"input":"world","expected":"dlrow"},{"input":"abcd","expected":"dcba"}]',
'olleh', 10, 'Strings') ON CONFLICT DO NOTHING;

UPDATE problems SET
    description = 'Write a function reverseString(s) that reverses a string and returns it.',
    starter_code = 'def reverseString(s):
    # Your code here
    pass',
    test_cases = '[{"input":"hello","expected":"olleh"},{"input":"world","expected":"dlrow"},{"input":"abcd","expected":"dcba"}]',
    expected_output = 'olleh',
    wrapper_config = '{"functionName":"reverseString","params":[{"name":"s","type":"str"}]}'
WHERE title = 'Reverse String';

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('FizzBuzz', 'Print numbers 1 to n. For multiples of 3 print Fizz, for 5 print Buzz, for both print FizzBuzz.
Read n from input().', 'Easy',
'n = int(input())
for i in range(1, n + 1):
    if i % 15 == 0:
        print("FizzBuzz")
    elif i % 3 == 0:
        print("Fizz")
    elif i % 5 == 0:
        print("Buzz")
    else:
        print(i)',
'[{"input":"5","expected":"1\n2\nFizz\n4\nBuzz"},{"input":"15","expected":"1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz"}]',
'FizzBuzz', 10, 'Logic') ON CONFLICT DO NOTHING;

UPDATE problems SET
    description = 'Write a function fizzBuzz(n) that returns a list of strings for numbers 1 to n. Multiples of 3 → "Fizz", multiples of 5 → "Buzz", both → "FizzBuzz", otherwise the number as a string.',
    starter_code = 'def fizzBuzz(n):
    result = []
    # Your code here
    return result',
    test_cases = '[{"input":"5","expected":"[''1'', ''2'', ''Fizz'', ''4'', ''Buzz'']"}]',
    expected_output = '[''1'', ''2'', ''Fizz'', ''4'', ''Buzz'']',
    wrapper_config = '{"functionName":"fizzBuzz","params":[{"name":"n","type":"int"}]}'
WHERE title = 'FizzBuzz';

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Valid Parentheses', 'Given a string of brackets, determine if the input string is valid.
Read the string from input().', 'Medium',
's = input()
stack = []
mapping = {")": "(", "}": "{", "]": "["}
for char in s:
    if char in mapping:
        top = stack.pop() if stack else "#"
        if mapping[char] != top:
            print(False)
            exit()
    else:
        stack.append(char)
print(not stack)',
'[{"input":"()[]{}","expected":"True"},{"input":"(]","expected":"False"},{"input":"([)]","expected":"False"}]',
'True', 20, 'Stack') ON CONFLICT DO NOTHING;

UPDATE problems SET
    description = 'Write a function isValid(s) that returns True if the bracket string is valid, False otherwise.',
    starter_code = 'def isValid(s):
    # Your code here
    pass',
    test_cases = '[{"input":"()[]{}","expected":"True"},{"input":"(]","expected":"False"},{"input":"([)]","expected":"False"}]',
    expected_output = 'True',
    wrapper_config = '{"functionName":"isValid","params":[{"name":"s","type":"str"}]}'
WHERE title = 'Valid Parentheses';

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Merge Sorted Arrays', 'Merge two sorted arrays into one sorted array.
Read array 1 on line 1 and array 2 on line 2.', 'Medium',
'import ast
a = ast.literal_eval(input())
b = ast.literal_eval(input())
print(sorted(a + b))',
'[{"input":"[1,3,5]\n[2,4,6]","expected":"[1, 2, 3, 4, 5, 6]"},{"input":"[1,2]\n[3,4]","expected":"[1, 2, 3, 4]"}]',
'[1, 2, 3, 4, 5, 6]', 20, 'Arrays') ON CONFLICT DO NOTHING;

UPDATE problems SET
    description = 'Write a function merge(nums1, nums2) that merges two sorted arrays and returns a single sorted array.',
    starter_code = 'def merge(nums1, nums2):
    # Your code here
    pass',
    test_cases = '[{"input":"[1,3,5]\n[2,4,6]","expected":"[1, 2, 3, 4, 5, 6]"},{"input":"[1,2]\n[3,4]","expected":"[1, 2, 3, 4]"}]',
    expected_output = '[1, 2, 3, 4, 5, 6]',
    wrapper_config = '{"functionName":"merge","params":[{"name":"nums1","type":"json"},{"name":"nums2","type":"json"}]}'
WHERE title = 'Merge Sorted Arrays';

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Binary Search', 'Implement binary search on a sorted array. Return the index of the target or -1.', 'Medium',
'def binary_search(nums, target):\n    # Your code here\n    pass', 'Input: [1,3,5,7,9], target=5\nExpected: 2', '2', 20, 'Search') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Longest Common Subsequence', 'Find the length of the longest subsequence common to two strings.', 'Hard',
'def lcs(text1, text2):\n    # Your code here\n    pass', 'Input: "abcde", "ace"\nExpected: 3', '3', 30, 'Dynamic Programming') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Median of Two Sorted Arrays', 'Find the median of two sorted arrays with O(log(m+n)) time complexity.', 'Hard',
'def find_median(nums1, nums2):\n    # Your code here\n    pass', 'Input: [1,3], [2]\nExpected: 2.0', '2.0', 30, 'Binary Search') ON CONFLICT DO NOTHING;
