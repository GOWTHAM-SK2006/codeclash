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
INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Two Sum', 'Given an array of integers and a target, return indices of two numbers that add up to the target.', 'Easy',
'def two_sum(nums, target):\n    # Your code here\n    pass', 'Input: nums=[2,7,11,15], target=9\nExpected: [0,1]', '[0, 1]', 10, 'Arrays') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Reverse String', 'Write a function that reverses a string.

Read a string from input() and print its reverse.', 'Easy',
'def reverse_string(s):
    # Your code here
    pass', '[{"input":"hello","expected":"olleh"},{"input":"world","expected":"dlrow"},{"input":"abcd","expected":"dcba"}]', 'olleh', 10, 'Strings') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('FizzBuzz', 'Print numbers 1 to n. For multiples of 3 print "Fizz", for 5 print "Buzz", for both print "FizzBuzz".

Read n from input().', 'Easy',
'def fizzbuzz(n):
    # Your code here
    pass', '[{"input":"5","expected":"1\n2\nFizz\n4\nBuzz"},{"input":"15","expected":"1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz"}]', 'FizzBuzz', 10, 'Logic') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Valid Parentheses', 'Given a string containing just the characters ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string is valid.

Read the string from input().', 'Medium',
'def is_valid(s):
    # Your code here
    pass', '[{"input":"()[]{}","expected":"True"},{"input":"(]","expected":"False"},{"input":"([)]","expected":"False"}]', 'True', 20, 'Stack') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Merge Sorted Arrays', 'Merge two sorted arrays into one sorted array.', 'Medium',
'def merge(nums1, nums2):\n    # Your code here\n    pass', 'Input: [1,3,5], [2,4,6]\nExpected: [1,2,3,4,5,6]', '[1, 2, 3, 4, 5, 6]', 20, 'Arrays') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Binary Search', 'Implement binary search on a sorted array. Return the index of the target or -1.', 'Medium',
'def binary_search(nums, target):\n    # Your code here\n    pass', 'Input: [1,3,5,7,9], target=5\nExpected: 2', '2', 20, 'Search') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Longest Common Subsequence', 'Find the length of the longest subsequence common to two strings.', 'Hard',
'def lcs(text1, text2):\n    # Your code here\n    pass', 'Input: "abcde", "ace"\nExpected: 3', '3', 30, 'Dynamic Programming') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Median of Two Sorted Arrays', 'Find the median of two sorted arrays with O(log(m+n)) time complexity.', 'Hard',
'def find_median(nums1, nums2):\n    # Your code here\n    pass', 'Input: [1,3], [2]\nExpected: 2.0', '2.0', 30, 'Binary Search') ON CONFLICT DO NOTHING;
