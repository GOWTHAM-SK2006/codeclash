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
    description = 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.
You may assume that each input would have exactly one solution, and you may not use the same element twice.
You can return the answer in any order.',
    input_format = 'Line 1: Array of integers `nums`
Line 2: Integer `target`',
    output_format = 'Array of two integers representing the indices.',
    function_signatures = '{"python":"def twoSum(nums, target):\n    pass","java":"class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};","c":"/**\n * Note: The returned array must be malloced, assume caller calls free().\n */\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    \n}","javascript":"var twoSum = function(nums, target) {\n    \n};"}',
    test_cases = '[{"input":"[2,7,11,15]\\n9","expected":"[0, 1]"},{"input":"[3,2,4]\\n6","expected":"[1, 2]"},{"input":"[3,3]\\n6","expected":"[0, 1]"}]',
    expected_output = '[0, 1]',
    wrapper_config = '{"functionName":"twoSum","returnType":"int[]","params":[{"name":"nums","type":"json"},{"name":"target","type":"int"}]}'
WHERE title = 'Two Sum';

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Reverse String', 'Write a function that reverses a string.
Read a string from input() and print its reverse.', 'Easy',
's = input()
print(s[::-1])',
'[{"input":"hello","expected":"olleh"},{"input":"world","expected":"dlrow"},{"input":"abcd","expected":"dcba"}]',
'olleh', 10, 'Strings') ON CONFLICT DO NOTHING;

    function_signatures = '{"python":"def reverseString(s):\n    pass","java":"class Solution {\n    public String reverseString(String s) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    string reverseString(string s) {\n        \n    }\n};","c":"char* reverseString(char* s) {\n    \n}","javascript":"var reverseString = function(s) {\n    \n};"}',
    test_cases = '[{"input":"hello","expected":"olleh"},{"input":"world","expected":"dlrow"},{"input":"abcd","expected":"dcba"}]',
    expected_output = 'olleh',
    wrapper_config = '{"functionName":"reverseString","returnType":"string","params":[{"name":"s","type":"str"}]}'
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
    description = 'Given an integer `n`, return a string array `answer` (1-indexed) where:
- `answer[i] == "FizzBuzz"` if `i` is divisible by 3 and 5.
- `answer[i] == "Fizz"` if `i` is divisible by 3.
- `answer[i] == "Buzz"` if `i` is divisible by 5.
- `answer[i] == i` (as a string) if none of the above conditions are true.',
    input_format = 'An integer `n`.',
    output_format = 'A list of strings from 1 to `n`.',
    function_signatures = '{"python":"def fizzBuzz(n):\n    pass","java":"class Solution {\n    public List<String> fizzBuzz(int n) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    vector<string> fizzBuzz(int n) {\n        \n    }\n};","c":"/**\n * Note: The returned array must be malloced, assume caller calls free().\n */\nchar** fizzBuzz(int n, int* returnSize) {\n    \n}","javascript":"var fizzBuzz = function(n) {\n    \n};"}',
    test_cases = '[{"input":"5","expected":"[\\"1\\",\\"2\\",\\"Fizz\\",\\"4\\",\\"Buzz\\"]"},{"input":"3","expected":"[\\"1\\",\\"2\\",\\"Fizz\\"]"}]',
    expected_output = '["1","2","Fizz","4","Buzz"]',
    wrapper_config = '{"functionName":"fizzBuzz","returnType":"String[]","params":[{"name":"n","type":"int"}]}'
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
    description = 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.
An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.',
    input_format = 'A single string `s` containing brackets.',
    output_format = 'Boolean `True` or `False`.',
    function_signatures = '{"python":"def isValid(s):\n    pass","java":"class Solution {\n    public boolean isValid(String s) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    bool isValid(string s) {\n        \n    }\n};","c":"bool isValid(char* s) {\n    \n}","javascript":"var isValid = function(s) {\n    \n};"}',
    test_cases = '[{"input":"()[]{}","expected":"True"},{"input":"(]","expected":"False"},{"input":"([)]","expected":"False"}]',
    expected_output = 'True',
    wrapper_config = '{"functionName":"isValid","returnType":"bool","params":[{"name":"s","type":"str"}]}'
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
    description = 'You are given two integer arrays `nums1` and `nums2`, sorted in non-decreasing order. Merge `nums1` and `nums2` into a single array sorted in non-decreasing order.',
    input_format = 'Line 1: Sorted array `nums1`
Line 2: Sorted array `nums2`',
    output_format = 'A single merged sorted array.',
    function_signatures = '{"python":"def merge(nums1, nums2):\n    pass","java":"class Solution {\n    public int[] merge(int[] nums1, int[] nums2) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    vector<int> merge(vector<int>& nums1, vector<int>& nums2) {\n        \n    }\n};","c":"/**\n * Note: The returned array must be malloced, assume caller calls free().\n */\nint* merge(int* nums1, int m, int* nums2, int n, int* returnSize) {\n    \n}","javascript":"var merge = function(nums1, nums2) {\n    \n};"}',
    test_cases = '[{"input":"[1,3,5]\\n[2,4,6]","expected":"[1, 2, 3, 4, 5, 6]"},{"input":"[1,2]\\n[3,4]","expected":"[1, 2, 3, 4]"}]',
    expected_output = '[1, 2, 3, 4, 5, 6]',
    wrapper_config = '{"functionName":"merge","returnType":"int[]","params":[{"name":"nums1","type":"json"},{"name":"nums2","type":"json"}]}'
WHERE title = 'Merge Sorted Arrays';

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Binary Search', 'Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.', 'Medium', 
'Line 1: Sorted array `nums`
Line 2: Integer `target`', 
'Index of `target` or -1.', 
'{"python":"def search(nums, target):\n    pass","java":"class Solution {\n    public int search(int[] nums, int target) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        \n    }\n};","c":"int search(int* nums, int numsSize, int target) {\n    \n}","javascript":"var search = function(nums, target) {\n    \n};"}', 
'[{"input":"[1,3,5,7,9]\\n5","expected":"2"},{"input":"[1,3,5,7,9]\\n2","expected":"-1"}]', 
'2', 20, 'Search', '{"functionName":"search","returnType":"int","params":[{"name":"nums","type":"json"},{"name":"target","type":"int"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Longest Common Subsequence', 'Given two strings `text1` and `text2`, return the length of their longest common subsequence. If there is no common subsequence, return 0.
A subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.', 'Hard', 
'Line 1: String `text1`
Line 2: String `text2`', 
'Length of the longest common subsequence.', 
'{"python":"def longestCommonSubsequence(text1, text2):\n    pass","java":"class Solution {\n    public int longestCommonSubsequence(String text1, String text2) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    int longestCommonSubsequence(string text1, string text2) {\n        \n    }\n};","c":"int longestCommonSubsequence(char* text1, char* text2) {\n    \n}","javascript":"var longestCommonSubsequence = function(text1, text2) {\n    \n};"}', 
'[{"input":"abcde\\nace","expected":"3"},{"input":"abc\\nabc","expected":"3"},{"input":"abc\\ndef","expected":"0"}]', 
'3', 30, 'Dynamic Programming', '{"functionName":"longestCommonSubsequence","returnType":"int","params":[{"name":"text1","type":"str"},{"name":"text2","type":"str"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Median of Two Sorted Arrays', 'Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).', 'Hard', 
'Line 1: Sorted array `nums1`
Line 2: Sorted array `nums2`', 
'The median as a float.', 
'{"python":"def findMedianSortedArrays(nums1, nums2):\n    pass","java":"class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        \n    }\n};","c":"double findMedianSortedArrays(int* nums1, int nums1Size, int* nums2, int nums2Size) {\n    \n}","javascript":"var findMedianSortedArrays = function(nums1, nums2) {\n    \n};"}', 
'[{"input":"[1,3]\\n[2]","expected":"2.0"},{"input":"[1,2]\\n[3,4]","expected":"2.5"}]', 
'2.0', 30, 'Binary Search', '{"functionName":"findMedianSortedArrays","returnType":"double","params":[{"name":"nums1","type":"json"},{"name":"nums2","type":"json"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

-- Easy Problems (20 problems)
-- Skip redundant 'Reverse String' if already updated above, or update it to be consistent
UPDATE problems SET
    description = 'Write a function that reverses a string. The input string is given as an array of characters `s`.',
    input_format = 'A single string `s`.',
    output_format = 'The reversed string.',
    function_signatures = '{"python":"def reverseString(s):\n    pass","java":"class Solution {\n    public String reverseString(String s) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    string reverseString(string s) {\n        \n    }\n};","c":"char* reverseString(char* s) {\n    \n}","javascript":"/**\n * @param {string} s\n * @return {string}\n */\nvar reverseString = function(s) {\n    \n};"}',
    test_cases = '[{"input":"hello","expected":"olleh"},{"input":"world","expected":"dlrow"},{"input":"abcd","expected":"dcba"}]',
    expected_output = 'olleh',
    wrapper_config = '{"functionName":"reverseString","returnType":"string","params":[{"name":"s","type":"str"}]}'
WHERE title = 'Reverse String';

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Find Maximum Number', 'Given an array of integers `nums`, return the largest element.', 'Easy', 
'An array of integers `nums`.', 
'The maximum integer in the array.', 
'{"python":"def findMax(nums):\n    pass","java":"class Solution {\n    public int findMax(int[] nums) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    int findMax(vector<int>& nums) {\n        \n    }\n};","c":"int findMax(int* nums, int numsSize) {\n    \n}","javascript":"var findMax = function(nums) {\n    \n};"}', 
'[{"input":"[1,5,3,9,2]","expected":"9"},{"input":"[10,20,5]","expected":"20"},{"input":"[1]","expected":"1"}]', 
'9', 10, 'Arrays', '{"functionName":"findMax","returnType":"int","params":[{"name":"nums","type":"json"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Sum of Array', 'Given an array of integers `nums`, return the sum of all its elements.', 'Easy', 
'An array of integers `nums`.', 
'The total sum of elements.', 
'{"python":"def sumArray(nums):\n    pass","java":"class Solution {\n    public int sumArray(int[] nums) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    int sumArray(vector<int>& nums) {\n        \n    }\n};","c":"int sumArray(int* nums, int numsSize) {\n    \n}","javascript":"var sumArray = function(nums) {\n    \n};"}', 
'[{"input":"[1,2,3,4]","expected":"10"},{"input":"[5,5,5]","expected":"15"},{"input":"[0]","expected":"0"}]', 
'10', 10, 'Arrays', '{"functionName":"sumArray","returnType":"int","params":[{"name":"nums","type":"json"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Check Even or Odd', 'Given an integer `n`, return "Even" if the number is even, and "Odd" if it is odd.', 'Easy', 
'An integer `n`.', 
'String "Even" or "Odd".', 
'{"python":"def checkEvenOdd(n):\n    pass","java":"class Solution {\n    public String checkEvenOdd(int n) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    string checkEvenOdd(int n) {\n        \n    }\n};","c":"char* checkEvenOdd(int n) {\n    \n}","javascript":"var checkEvenOdd = function(n) {\n    \n};"}', 
'[{"input":"7","expected":"Odd"},{"input":"4","expected":"Even"},{"input":"0","expected":"Even"}]', 
'Odd', 10, 'Logic', '{"functionName":"checkEvenOdd","returnType":"string","params":[{"name":"n","type":"int"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Count Vowels', 'Given a string `s`, count the number of vowels (a, e, i, o, u) it contains.', 'Easy', 
'A string `s`.', 
'The count of vowels as an integer.', 
'{"python":"def countVowels(s):\n    pass","java":"class Solution {\n    public int countVowels(String s) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    int countVowels(string s) {\n        \n    }\n};","c":"int countVowels(char* s) {\n    \n}","javascript":"var countVowels = function(s) {\n    \n};"}', 
'[{"input":"hello","expected":"2"},{"input":"aeiou","expected":"5"},{"input":"bcdfg","expected":"0"}]', 
'2', 10, 'Strings', '{"functionName":"countVowels","params":[{"name":"s","type":"str"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Palindrome String', 'Given a string `s`, return `True` if it is a palindrome (reads the same forwards and backwards), and `False` otherwise.', 'Easy', 
'A string `s`.', 
'Boolean `True` or `False`.', 
'{"python":"def isPalindrome(s):\n    pass","java":"class Solution {\n    public boolean isPalindrome(String s) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    bool isPalindrome(string s) {\n        \n    }\n};","c":"bool isPalindrome(char* s) {\n    \n}","javascript":"var isPalindrome = function(s) {\n    \n};"}', 
'[{"input":"madam","expected":"True"},{"input":"hello","expected":"False"},{"input":"a","expected":"True"}]', 
'True', 10, 'Strings', '{"functionName":"isPalindrome","params":[{"name":"s","type":"str"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Find Minimum', 'Given an array of integers `nums`, return the smallest element.', 'Easy', 
'An array of integers `nums`.', 
'The minimum integer in the array.', 
'{"python":"def findMin(nums):\n    pass","java":"class Solution {\n    public int findMin(int[] nums) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    int findMin(vector<int>& nums) {\n        \n    }\n};","c":"int findMin(int* nums, int numsSize) {\n    \n}","javascript":"var findMin = function(nums) {\n    \n};"}', 
'[{"input":"[4,2,7,1]","expected":"1"},{"input":"[10,5,15]","expected":"5"},{"input":"[5]","expected":"5"}]', 
'1', 10, 'Arrays', '{"functionName":"findMin","returnType":"int","params":[{"name":"nums","type":"json"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Factorial', 'Given a non-negative integer `n`, return its factorial.', 'Easy', 
'An integer `n`.', 
'The factorial of `n`.', 
'{"python":"def factorial(n):\n    pass","java":"class Solution {\n    public long factorial(int n) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    long long factorial(int n) {\n        \n    }\n};","c":"long long factorial(int n) {\n    \n}","javascript":"var factorial = function(n) {\n    \n};"}', 
'[{"input":"5","expected":"120"},{"input":"0","expected":"1"},{"input":"3","expected":"6"}]', 
'120', 10, 'Math', '{"functionName":"factorial","returnType":"int","params":[{"name":"n","type":"int"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Fibonacci Nth', 'Given an integer `n`, return the `n`-th Fibonacci number.', 'Easy', 
'An integer `n`.', 
'The `n`-th Fibonacci number.', 
'{"python":"def fibonacci(n):\n    pass","java":"class Solution {\n    public int fibonacci(int n) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    int fibonacci(int n) {\n        \n    }\n};","c":"int fibonacci(int n) {\n    \n}","javascript":"var fibonacci = function(n) {\n    \n};"}', 
'[{"input":"6","expected":"8"},{"input":"1","expected":"1"},{"input":"5","expected":"5"}]', 
'8', 10, 'Math', '{"functionName":"fibonacci","params":[{"name":"n","type":"int"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Reverse Array', 'Given an array of integers `nums`, return the array in reverse order.', 'Easy', 
'An array of integers `nums`.', 
'The reversed array.', 
'{"python":"def reverseArray(nums):\n    pass","java":"class Solution {\n    public int[] reverseArray(int[] nums) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    vector<int> reverseArray(vector<int>& nums) {\n        \n    }\n};","c":"int* reverseArray(int* nums, int numsSize, int* returnSize) {\n    \n}","javascript":"var reverseArray = function(nums) {\n    \n};"}', 
'[{"input":"[1,2,3]","expected":"[3,2,1]"},{"input":"[10,20]","expected":"[20,10]"},{"input":"[5]","expected":"[5]"}]', 
'[3,2,1]', 10, 'Arrays', '{"functionName":"reverseArray","returnType":"int[]","params":[{"name":"nums","type":"json"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Count Digits', 'Given a non-negative integer `n`, return the number of digits it contains.', 'Easy', 
'An integer `n`.', 
'The number of digits.', 
'{"python":"def countDigits(n):\n    pass","java":"class Solution {\n    public int countDigits(int n) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    int countDigits(int n) {\n        \n    }\n};","c":"int countDigits(int n) {\n    \n}","javascript":"var countDigits = function(n) {\n    \n};"}', 
'[{"input":"12345","expected":"5"},{"input":"100","expected":"3"},{"input":"9","expected":"1"}]', 
'5', 10, 'Math', '{"functionName":"countDigits","returnType":"int","params":[{"name":"n","type":"int"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Sum of Digits', 'Given a non-negative integer `n`, return the sum of its digits.', 'Easy', 
'An integer `n`.', 
'The sum of digits.', 
'{"python":"def sumOfDigits(n):\n    pass","java":"class Solution {\n    public int sumOfDigits(int n) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    int sumOfDigits(int n) {\n        \n    }\n};","c":"int sumOfDigits(int n) {\n    \n}","javascript":"var sumOfDigits = function(n) {\n    \n};"}', 
'[{"input":"123","expected":"6"},{"input":"100","expected":"1"},{"input":"555","expected":"15"}]', 
'6', 10, 'Math', '{"functionName":"sumOfDigits","returnType":"int","params":[{"name":"n","type":"int"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Check Prime', 'Given a positive integer `n`, return `True` if it is a prime number, and `False` otherwise.', 'Easy', 
'An integer `n`.', 
'Boolean `True` or `False`.', 
'{"python":"def isPrime(n):\n    pass","java":"class Solution {\n    public boolean isPrime(int n) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    bool isPrime(int n) {\n        \n    }\n};","c":"bool isPrime(int n) {\n    \n}","javascript":"var isPrime = function(n) {\n    \n};"}', 
'[{"input":"7","expected":"True"},{"input":"4","expected":"False"},{"input":"2","expected":"True"}]', 
'True', 10, 'Math', '{"functionName":"isPrime","returnType":"bool","params":[{"name":"n","type":"int"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Largest of Three', 'Given three integers `a`, `b`, and `c`, return the largest of them.', 'Easy', 
'Three integers `a`, `b`, and `c`.', 
'The largest integer.', 
'{"python":"def largestOfThree(a, b, c):\n    pass","java":"class Solution {\n    public int largestOfThree(int a, int b, int c) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    int largestOfThree(int a, int b, int c) {\n        \n    }\n};","c":"int largestOfThree(int a, int b, int c) {\n    \n}","javascript":"var largestOfThree = function(a, b, c) {\n    \n};"}', 
'[{"input":"3 7 5","expected":"7"},{"input":"10 5 15","expected":"15"},{"input":"1 1 1","expected":"1"}]', 
'7', 10, 'Logic', '{"functionName":"largestOfThree","returnType":"int","params":[{"name":"a","type":"int"},{"name":"b","type":"int"},{"name":"c","type":"int"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('String Length', 'Given a string `s`, return its length.', 'Easy', 
'A string `s`.', 
'The length of the string.', 
'{"python":"def stringLength(s):\n    pass","java":"class Solution {\n    public int stringLength(String s) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    int stringLength(string s) {\n        \n    }\n};","c":"int stringLength(char* s) {\n    \n}","javascript":"var stringLength = function(s) {\n    \n};"}', 
'[{"input":"hello","expected":"5"},{"input":"world","expected":"5"},{"input":"a","expected":"1"}]', 
'5', 10, 'Strings', '{"functionName":"stringLength","returnType":"int","params":[{"name":"s","type":"str"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Uppercase String', 'Given a string `s`, return it converted to uppercase.', 'Easy', 
'A string `s`.', 
'The uppercase version of `s`.', 
'{"python":"def toUppercase(s):\n    pass","java":"class Solution {\n    public String toUppercase(String s) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    string toUppercase(string s) {\n        \n    }\n};","c":"char* toUppercase(char* s) {\n    \n}","javascript":"var toUppercase = function(s) {\n    \n};"}', 
'[{"input":"hello","expected":"HELLO"},{"input":"World","expected":"WORLD"}]', 
'HELLO', 10, 'Strings', '{"functionName":"toUppercase","returnType":"string","params":[{"name":"s","type":"str"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Lowercase String', 'Given a string `s`, return it converted to lowercase.', 'Easy', 
'A string `s`.', 
'The lowercase version of `s`.', 
'{"python":"def toLowercase(s):\n    pass","java":"class Solution {\n    public String toLowercase(String s) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    string toLowercase(string s) {\n        \n    }\n};","c":"char* toLowercase(char* s) {\n    \n}","javascript":"var toLowercase = function(s) {\n    \n};"}', 
'[{"input":"HELLO","expected":"hello"},{"input":"World","expected":"world"}]', 
'hello', 10, 'Strings', '{"functionName":"toLowercase","returnType":"string","params":[{"name":"s","type":"str"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('First Character', 'Given a string `s`, return its first character.', 'Easy', 
'A string `s`.', 
'The first character.', 
'{"python":"def firstChar(s):\n    pass","java":"class Solution {\n    public char firstChar(String s) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    char firstChar(string s) {\n        \n    }\n};","c":"char firstChar(char* s) {\n    \n}","javascript":"var firstChar = function(s) {\n    \n};"}', 
'[{"input":"hello","expected":"h"},{"input":"world","expected":"w"},{"input":"a","expected":"a"}]', 
'h', 10, 'Strings', '{"functionName":"firstChar","returnType":"string","params":[{"name":"s","type":"str"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Last Character', 'Given a string `s`, return its last character.', 'Easy', 
'A string `s`.', 
'The last character.', 
'{"python":"def lastChar(s):\n    pass","java":"class Solution {\n    public char lastChar(String s) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    char lastChar(string s) {\n        \n    }\n};","c":"char lastChar(char* s) {\n    \n}","javascript":"var lastChar = function(s) {\n    \n};"}', 
'[{"input":"hello","expected":"o"},{"input":"world","expected":"d"},{"input":"a","expected":"a"}]', 
'o', 10, 'Strings', '{"functionName":"lastChar","returnType":"string","params":[{"name":"s","type":"str"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Swap Two Numbers', 'Given two integers `a` and `b`, return an array containing them in swapped order.', 'Easy', 
'Two integers `a` and `b`.', 
'An array `[b, a]`.', 
'{"python":"def swapNumbers(a, b):\n    pass","java":"class Solution {\n    public int[] swapNumbers(int a, int b) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    vector<int> swapNumbers(int a, int b) {\n        \n    }\n};","c":"int* swapNumbers(int a, int b, int* returnSize) {\n    \n}","javascript":"var swapNumbers = function(a, b) {\n    \n};"}', 
'[{"input":"3 5","expected":"[5, 3]"},{"input":"10 20","expected":"[20, 10]"},{"input":"1 1","expected":"[1, 1]"}]', 
'[5, 3]', 10, 'Logic', '{"functionName":"swapNumbers","returnType":"int[]","params":[{"name":"a","type":"int"},{"name":"b","type":"int"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Check Positive or Negative', 'Given an integer `n`, return "Positive" if it is greater than 0, "Negative" if it is less than 0, and "Zero" if it is equal to 0.', 'Easy', 
'An integer `n`.', 
'String "Positive", "Negative", or "Zero".', 
'{"python":"def checkSign(n):\n    pass","java":"class Solution {\n    public String checkSign(int n) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    string checkSign(int n) {\n        \n    }\n};","c":"char* checkSign(int n) {\n    \n}","javascript":"var checkSign = function(n) {\n    \n};"}', 
'[{"input":"-5","expected":"Negative"},{"input":"10","expected":"Positive"},{"input":"0","expected":"Zero"}]', 
'Negative', 10, 'Logic', '{"functionName":"checkSign","returnType":"string","params":[{"name":"n","type":"int"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Sum of First N Numbers', 'Given a positive integer `n`, return the sum of the first `n` natural numbers.', 'Easy', 
'An integer `n`.', 
'The sum of the first `n` natural numbers.', 
'{"python":"def sumFirstN(n):\n    pass","java":"class Solution {\n    public int sumFirstN(int n) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    int sumFirstN(int n) {\n        \n    }\n};","c":"int sumFirstN(int n) {\n    \n}","javascript":"var sumFirstN = function(n) {\n    \n};"}', 
'[{"input":"5","expected":"15"},{"input":"10","expected":"55"},{"input":"1","expected":"1"}]', 
'15', 10, 'Math', '{"functionName":"sumFirstN","returnType":"int","params":[{"name":"n","type":"int"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Multiplication Table', 'Given an integer `n`, return an array containing its multiplication table up to 10.', 'Easy', 
'An integer `n`.', 
'An array of 10 integers.', 
'{"python":"def multiplicationTable(n):\n    pass","java":"class Solution {\n    public int[] multiplicationTable(int n) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    vector<int> multiplicationTable(int n) {\n        \n    }\n};","c":"int* multiplicationTable(int n, int* returnSize) {\n    \n}","javascript":"var multiplicationTable = function(n) {\n    \n};"}', 
'[{"input":"3","expected":"[3, 6, 9, 12, 15, 18, 21, 24, 27, 30]"},{"input":"2","expected":"[2, 4, 6, 8, 10, 12, 14, 16, 18, 20]"}]', 
'[3, 6, 9, 12, 15, 18, 21, 24, 27, 30]', 10, 'Logic', '{"functionName":"multiplicationTable","returnType":"int[]","params":[{"name":"n","type":"int"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Count Even Numbers in Array', 'Given an array of integers `nums`, return the count of even numbers.', 'Easy', 
'An array of integers `nums`.', 
'The count of even numbers.', 
'{"python":"def countEven(nums):\n    pass","java":"class Solution {\n    public int countEven(int[] nums) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    int countEven(vector<int>& nums) {\n        \n    }\n};","c":"int countEven(int* nums, int numsSize) {\n    \n}","javascript":"var countEven = function(nums) {\n    \n};"}', 
'[{"input":"[1,2,3,4,6]","expected":"3"},{"input":"[1,3,5]","expected":"0"},{"input":"[2,4]","expected":"2"}]', 
'3', 10, 'Arrays', '{"functionName":"countEven","returnType":"int","params":[{"name":"nums","type":"json"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Count Odd Numbers', 'Given an array of integers `nums`, return the count of odd numbers.', 'Easy', 
'An array of integers `nums`.', 
'The count of odd numbers.', 
'{"python":"def countOdd(nums):\n    pass","java":"class Solution {\n    public int countOdd(int[] nums) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    int countOdd(vector<int>& nums) {\n        \n    }\n};","c":"int countOdd(int* nums, int numsSize) {\n    \n}","javascript":"var countOdd = function(nums) {\n    \n};"}', 
'[{"input":"[1,2,3,4,5]","expected":"3"},{"input":"[2,4]","expected":"0"},{"input":"[1,3,5]","expected":"3"}]', 
'3', 10, 'Arrays', '{"functionName":"countOdd","returnType":"int","params":[{"name":"nums","type":"json"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Square of Numbers', 'Given an array of integers `nums`, return a new array where each element is squared.', 'Easy', 
'An array of integers `nums`.', 
'An array of squared integers.', 
'{"python":"def squareArray(nums):\n    pass","java":"class Solution {\n    public int[] squareArray(int[] nums) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    vector<int> squareArray(vector<int>& nums) {\n        \n    }\n};","c":"int* squareArray(int* nums, int numsSize, int* returnSize) {\n    \n}","javascript":"var squareArray = function(nums) {\n    \n};"}', 
'[{"input":"[1,2,3]","expected":"[1,4,9]"},{"input":"[2,3,4]","expected":"[4,9,16]"}]', 
'[1,4,9]', 10, 'Arrays', '{"functionName":"squareArray","returnType":"int[]","params":[{"name":"nums","type":"json"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Cube of Numbers', 'Given an array of integers `nums`, return a new array where each element is cubed.', 'Easy', 
'An array of integers `nums`.', 
'An array of cubed integers.', 
'{"python":"def cubeArray(nums):\n    pass","java":"class Solution {\n    public int[] cubeArray(int[] nums) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    vector<int> cubeArray(vector<int>& nums) {\n        \n    }\n};","c":"int* cubeArray(int* nums, int numsSize, int* returnSize) {\n    \n}","javascript":"var cubeArray = function(nums) {\n    \n};"}', 
'[{"input":"[1,2,3]","expected":"[1,8,27]"},{"input":"[2,3]","expected":"[8,27]"}]', 
'[1,8,27]', 10, 'Arrays', '{"functionName":"cubeArray","returnType":"int[]","params":[{"name":"nums","type":"json"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Check Armstrong Number', 'Given an integer `n`, return `True` if it is an Armstrong number (the sum of its own digits each raised to the power of the number of digits equals the number itself), and `False` otherwise.', 'Easy', 
'An integer `n`.', 
'Boolean `True` or `False`.', 
'{"python":"def isArmstrong(n):\n    pass","java":"class Solution {\n    public boolean isArmstrong(int n) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    bool isArmstrong(int n) {\n        \n    }\n};","c":"bool isArmstrong(int n) {\n    \n}","javascript":"var isArmstrong = function(n) {\n    \n};"}', 
'[{"input":"153","expected":"True"},{"input":"370","expected":"True"},{"input":"123","expected":"False"}]', 
'True', 10, 'Math', '{"functionName":"isArmstrong","returnType":"bool","params":[{"name":"n","type":"int"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Reverse Number', 'Given an integer `n`, return the integer with its digits reversed.', 'Easy', 
'An integer `n`.', 
'The reversed integer.', 
'{"python":"def reverseNum(n):\n    pass","java":"class Solution {\n    public int reverseNum(int n) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    int reverseNum(int n) {\n        \n    }\n};","c":"int reverseNum(int n) {\n    \n}","javascript":"var reverseNum = function(n) {\n    \n};"}', 
'[{"input":"123","expected":"321"},{"input":"1000","expected":"1"},{"input":"456","expected":"654"}]', 
'321', 10, 'Math', '{"functionName":"reverseNum","returnType":"int","params":[{"name":"n","type":"int"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Sum of Even Numbers', 'Given an array of integers `nums`, return the sum of all even numbers.', 'Easy', 
'An array of integers `nums`.', 
'The sum of even numbers.', 
'{"python":"def sumEven(nums):\n    pass","java":"class Solution {\n    public int sumEven(int[] nums) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    int sumEven(vector<int>& nums) {\n        \n    }\n};","c":"int sumEven(int* nums, int numsSize) {\n    \n}","javascript":"var sumEven = function(nums) {\n    \n};"}', 
'[{"input":"[1,2,3,4]","expected":"6"},{"input":"[2,4,6]","expected":"12"},{"input":"[1,3,5]","expected":"0"}]', 
'6', 10, 'Arrays', '{"functionName":"sumEven","returnType":"int","params":[{"name":"nums","type":"json"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Sum of Odd Numbers', 'Given an array of integers `nums`, return the sum of all odd numbers.', 'Easy', 
'An array of integers `nums`.', 
'The sum of odd numbers.', 
'{"python":"def sumOdd(nums):\n    pass","java":"class Solution {\n    public int sumOdd(int[] nums) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    int sumOdd(vector<int>& nums) {\n        \n    }\n};","c":"int sumOdd(int* nums, int numsSize) {\n    \n}","javascript":"var sumOdd = function(nums) {\n    \n};"}', 
'[{"input":"[1,2,3,4,5]","expected":"9"},{"input":"[1,3,5]","expected":"9"},{"input":"[2,4]","expected":"0"}]', 
'9', 10, 'Arrays', '{"functionName":"sumOdd","returnType":"int","params":[{"name":"nums","type":"json"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Find Second Largest', 'Given an array of integers `nums`, return the second largest unique element.', 'Easy', 
'An array of integers `nums`.', 
'The second largest integer.', 
'{"python":"def secondLargest(nums):\n    pass","java":"class Solution {\n    public int secondLargest(int[] nums) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    int secondLargest(vector<int>& nums) {\n        \n    }\n};","c":"int secondLargest(int* nums, int numsSize) {\n    \n}","javascript":"var secondLargest = function(nums) {\n    \n};"}', 
'[{"input":"[1,5,3,9,2]","expected":"5"},{"input":"[10,20,15]","expected":"15"},{"input":"[1,2]","expected":"1"}]', 
'5', 10, 'Arrays', '{"functionName":"secondLargest","returnType":"int","params":[{"name":"nums","type":"json"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Check Sorted Array', 'Given an array of integers `nums`, return `True` if it is sorted in non-decreasing order, and `False` otherwise.', 'Easy', 
'An array of integers `nums`.', 
'Boolean `True` or `False`.', 
'{"python":"def isSorted(nums):\n    pass","java":"class Solution {\n    public boolean isSorted(int[] nums) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    bool isSorted(vector<int>& nums) {\n        \n    }\n};","c":"bool isSorted(int* nums, int numsSize) {\n    \n}","javascript":"var isSorted = function(nums) {\n    \n};"}', 
'[{"input":"[1,2,3,4]","expected":"True"},{"input":"[4,3,2,1]","expected":"False"},{"input":"[1,1,1]","expected":"True"}]', 
'True', 10, 'Arrays', '{"functionName":"isSorted","returnType":"bool","params":[{"name":"nums","type":"json"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Count Spaces in String', 'Given a string `s`, return the number of spaces it contains.', 'Easy', 
'A string `s`.', 
'The count of spaces.', 
'{"python":"def countSpaces(s):\n    pass","java":"class Solution {\n    public int countSpaces(String s) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    int countSpaces(string s) {\n        \n    }\n};","c":"int countSpaces(char* s) {\n    \n}","javascript":"var countSpaces = function(s) {\n    \n};"}', 
'[{"input":"hello world","expected":"1"},{"input":"hello  world","expected":"2"},{"input":"nospaces","expected":"0"}]', 
'1', 10, 'Strings', '{"functionName":"countSpaces","returnType":"int","params":[{"name":"s","type":"str"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Remove Spaces From String', 'Given a string `s`, return a new string with all spaces removed.', 'Easy', 
'A string `s`.', 
'The string without spaces.', 
'{"python":"def removeSpaces(s):\n    pass","java":"class Solution {\n    public String removeSpaces(String s) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    string removeSpaces(string s) {\n        \n    }\n};","c":"char* removeSpaces(char* s) {\n    \n}","javascript":"var removeSpaces = function(s) {\n    \n};"}', 
'[{"input":"hello world","expected":"helloworld"},{"input":"h e l l o","expected":"hello"},{"input":"nosp","expected":"nosp"}]', 
'helloworld', 10, 'Strings', '{"functionName":"removeSpaces","returnType":"string","params":[{"name":"s","type":"str"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Replace Character', 'Given a string `s`, an `old` character, and a `new` character, return a new string where all occurrences of `old` are replaced by `new`.', 'Easy', 
'A string `s`, and two characters `old` and `new`.', 
'The updated string.', 
'{"python":"def replaceChar(s, old, new):\n    pass","java":"class Solution {\n    public String replaceChar(String s, char old, char new) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    string replaceChar(string s, char old, char new) {\n        \n    }\n};","c":"char* replaceChar(char* s, char old, char new) {\n    \n}","javascript":"var replaceChar = function(s, old, new) {\n    \n};"}', 
'[{"input":"hello l x","expected":"hexxo"},{"input":"aaa a b","expected":"bbb"}]', 
'hexxo', 10, 'Strings', '{"functionName":"replaceChar","returnType":"string","params":[{"name":"s","type":"str"},{"name":"old","type":"str"},{"name":"new","type":"str"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Count Character Frequency', 'Given a string `s`, return a string representing the frequency of each character in the format "char:count".', 'Easy', 
'A string `s`.', 
'A frequency string.', 
'{"python":"def charFrequency(s):\n    pass","java":"class Solution {\n    public String charFrequency(String s) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    string charFrequency(string s) {\n        \n    }\n};","c":"char* charFrequency(char* s) {\n    \n}","javascript":"var charFrequency = function(s) {\n    \n};"}', 
'[{"input":"hello","expected":"h:1 e:1 l:2 o:1"},{"input":"aabbcc","expected":"a:2 b:2 c:2"}]', 
'h:1 e:1 l:2 o:1', 10, 'Strings', '{"functionName":"charFrequency","returnType":"string","params":[{"name":"s","type":"str"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Check Anagram', 'Given two strings `s1` and `s2`, return `True` if they are anagrams (contain the same characters in any order), and `False` otherwise.', 'Easy', 
'Two strings `s1` and `s2`.', 
'Boolean `True` or `False`.', 
'{"python":"def isAnagram(s1, s2):\n    pass","java":"class Solution {\n    public boolean isAnagram(String s1, String s2) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    bool isAnagram(string s1, string s2) {\n        \n    }\n};","c":"bool isAnagram(char* s1, char* s2) {\n    \n}","javascript":"var isAnagram = function(s1, s2) {\n    \n};"}', 
'[{"input":"listen silent","expected":"True"},{"input":"hello world","expected":"False"}]', 
'True', 10, 'Strings', '{"functionName":"isAnagram","returnType":"bool","params":[{"name":"s1","type":"str"},{"name":"s2","type":"str"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Merge Two Arrays', 'Given two sorted arrays `a` and `b`, return a new sorted array containing all elements from both.', 'Easy', 
'Two sorted arrays of integers `a` and `b`.', 
'A merged sorted array.', 
'{"python":"def mergeArrays(a, b):\n    pass","java":"class Solution {\n    public int[] mergeArrays(int[] a, int[] b) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    vector<int> mergeArrays(vector<int>& a, vector<int>& b) {\n        \n    }\n};","c":"int* mergeArrays(int* a, int aSize, int* b, int bSize, int* returnSize) {\n    \n}","javascript":"var mergeArrays = function(a, b) {\n    \n};"}', 
'[{"input":"[1,2] [3,4]","expected":"[1,2,3,4]"},{"input":"[1] [2]","expected":"[1,2]"}]', 
'[1,2,3,4]', 10, 'Arrays', '{"functionName":"mergeArrays","returnType":"int[]","params":[{"name":"a","type":"json"},{"name":"b","type":"json"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Remove Duplicates', 'Given an array of integers `nums`, return a new array with duplicate elements removed.', 'Easy', 
'An array of integers `nums`.', 
'An array with unique elements.', 
'{"python":"def removeDuplicates(nums):\n    pass","java":"class Solution {\n    public int[] removeDuplicates(int[] nums) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    vector<int> removeDuplicates(vector<int>& nums) {\n        \n    }\n};","c":"int* removeDuplicates(int* nums, int numsSize, int* returnSize) {\n    \n}","javascript":"var removeDuplicates = function(nums) {\n    \n};"}', 
'[{"input":"[1,2,2,3,3]","expected":"[1,2,3]"},{"input":"[1,1,1]","expected":"[1]"}]', 
'[1,2,3]', 10, 'Arrays', '{"functionName":"removeDuplicates","returnType":"int[]","params":[{"name":"nums","type":"json"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Find Index of Element', 'Given an array of integers `nums` and a `target` element, return the index of the first occurrence of `target`. Return -1 if not found.', 'Easy', 
'An array of integers `nums` and a `target` integer.', 
'The index or -1.', 
'{"python":"def findIndex(nums, target):\n    pass","java":"class Solution {\n    public int findIndex(int[] nums, int target) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    int findIndex(vector<int>& nums, int target) {\n        \n    }\n};","c":"int findIndex(int* nums, int numsSize, int target) {\n    \n}","javascript":"var findIndex = function(nums, target) {\n    \n};"}', 
'[{"input":"[1,2,3,4] 3","expected":"2"},{"input":"[5,10,15] 10","expected":"1"}]', 
'2', 10, 'Arrays', '{"functionName":"findIndex","returnType":"int","params":[{"name":"nums","type":"json"},{"name":"target","type":"int"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Count Occurrences', 'Given an array of integers `nums` and a `target` element, return the number of times `target` appears in the array.', 'Easy', 
'An array of integers `nums` and a `target` integer.', 
'The count of occurrences.', 
'{"python":"def countOccurrences(nums, target):\n    pass","java":"class Solution {\n    public int countOccurrences(int[] nums, int target) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    int countOccurrences(vector<int>& nums, int target) {\n        \n    }\n};","c":"int countOccurrences(int* nums, int numsSize, int target) {\n    \n}","javascript":"var countOccurrences = function(nums, target) {\n    \n};"}', 
'[{"input":"[1,2,2,3] 2","expected":"2"},{"input":"[1,1,1,1] 1","expected":"4"}]', 
'2', 10, 'Arrays', '{"functionName":"countOccurrences","returnType":"int","params":[{"name":"nums","type":"json"},{"name":"target","type":"int"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Check Substring', 'Given a string `s` and a `sub` string, return `True` if `sub` is present in `s`, and `False` otherwise.', 'Easy', 
'Two strings `s` and `sub`.', 
'Boolean `True` or `False`.', 
'{"python":"def isSubstring(s, sub):\n    pass","java":"class Solution {\n    public boolean isSubstring(String s, String sub) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    bool isSubstring(string s, string sub) {\n        \n    }\n};","c":"bool isSubstring(char* s, char* sub) {\n    \n}","javascript":"var isSubstring = function(s, sub) {\n    \n};"}', 
'[{"input":"hello l","expected":"True"},{"input":"world ol","expected":"False"}]', 
'True', 10, 'Strings', '{"functionName":"isSubstring","returnType":"bool","params":[{"name":"s","type":"str"},{"name":"sub","type":"str"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Remove Character From String', 'Given a string `s` and a character `ch`, return a new string with all occurrences of `ch` removed.', 'Easy', 
'A string `s` and a character `ch`.', 
'String without occurrences of `ch`.', 
'{"python":"def removeChar(s, ch):\n    pass","java":"class Solution {\n    public String removeChar(String s, char ch) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    string removeChar(string s, char ch) {\n        \n    }\n};","c":"char* removeChar(char* s, char ch) {\n    \n}","javascript":"var removeChar = function(s, ch) {\n    \n};"}', 
'[{"input":"hello l","expected":"heo"},{"input":"aabbaa a","expected":"bb"}]', 
'heo', 10, 'Strings', '{"functionName":"removeChar","returnType":"string","params":[{"name":"s","type":"str"},{"name":"ch","type":"str"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Multiply All Elements', 'Given an array of integers `nums`, return the product of all elements.', 'Easy', 
'An array of integers `nums`.', 
'The product of all elements.', 
'{"python":"def multiplyAll(nums):\n    pass","java":"class Solution {\n    public int multiplyAll(int[] nums) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    int multiplyAll(vector<int>& nums) {\n        \n    }\n};","c":"int multiplyAll(int* nums, int numsSize) {\n    \n}","javascript":"var multiplyAll = function(nums) {\n    \n};"}', 
'[{"input":"[1,2,3,4]","expected":"24"},{"input":"[2,3]","expected":"6"},{"input":"[5]","expected":"5"}]', 
'24', 10, 'Arrays', '{"functionName":"multiplyAll","returnType":"int","params":[{"name":"nums","type":"json"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Find Average', 'Given an array of integers `nums`, return the average of its elements.', 'Easy', 
'An array of integers `nums`.', 
'The average as an integer.', 
'{"python":"def findAverage(nums):\n    pass","java":"class Solution {\n    public int findAverage(int[] nums) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    int findAverage(vector<int>& nums) {\n        \n    }\n};","c":"int findAverage(int* nums, int numsSize) {\n    \n}","javascript":"var findAverage = function(nums) {\n    \n};"}', 
'[{"input":"[2,4,6,8]","expected":"5"},{"input":"[1,2,3]","expected":"2"},{"input":"[10]","expected":"10"}]', 
'5', 10, 'Arrays', '{"functionName":"findAverage","returnType":"int","params":[{"name":"nums","type":"json"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Is Leap Year Check', 'Given a year `year`, return `True` if it is a leap year, and `False` otherwise.', 'Easy', 
'An integer `year`.', 
'Boolean `True` or `False`.', 
'{"python":"def isLeapYear(year):\n    pass","java":"class Solution {\n    public boolean isLeapYear(int year) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    bool isLeapYear(int year) {\n        \n    }\n};","c":"bool isLeapYear(int year) {\n    \n}","javascript":"var isLeapYear = function(year) {\n    \n};"}', 
'[{"input":"2024","expected":"True"},{"input":"2000","expected":"True"},{"input":"1900","expected":"False"}]', 
'True', 10, 'Logic', '{"functionName":"isLeapYear","returnType":"bool","params":[{"name":"year","type":"int"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('Power of Number', 'Given a base `base` and an exponent `exp`, return `base` raised to the power of `exp`.', 'Easy', 
'Two integers `base` and `exp`.', 
'The result as an integer.', 
'{"python":"def powerOf(base, exp):\n    pass","java":"class Solution {\n    public int powerOf(int base, int exp) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    int powerOf(int base, int exp) {\n        \n    }\n};","c":"int powerOf(int base, int exp) {\n    \n}","javascript":"var powerOf = function(base, exp) {\n    \n};"}', 
'[{"input":"2 3","expected":"8"},{"input":"3 2","expected":"9"},{"input":"5 0","expected":"1"}]', 
'8', 10, 'Math', '{"functionName":"powerOf","returnType":"int","params":[{"name":"base","type":"int"},{"name":"exp","type":"int"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('GCD of Two Numbers', 'Given two integers `a` and `b`, return their greatest common divisor.', 'Easy', 
'Two integers `a` and `b`.', 
'The GCD as an integer.', 
'{"python":"def findGCD(a, b):\n    pass","java":"class Solution {\n    public int findGCD(int a, int b) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    int findGCD(int a, int b) {\n        \n    }\n};","c":"int findGCD(int a, int b) {\n    \n}","javascript":"var findGCD = function(a, b) {\n    \n};"}', 
'[{"input":"12 18","expected":"6"},{"input":"10 20","expected":"10"},{"input":"7 11","expected":"1"}]', 
'6', 10, 'Math', '{"functionName":"findGCD","returnType":"int","params":[{"name":"a","type":"int"},{"name":"b","type":"int"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

INSERT INTO problems (title, description, difficulty, input_format, output_format, function_signatures, test_cases, expected_output, points, category, wrapper_config) VALUES
('LCM of Two Numbers', 'Given two integers `a` and `b`, return their least common multiple.', 'Easy', 
'Two integers `a` and `b`.', 
'The LCM as an integer.', 
'{"python":"def findLCM(a, b):\n    pass","java":"class Solution {\n    public int findLCM(int a, int b) {\n        \n    }\n}","cpp":"class Solution {\npublic:\n    int findLCM(int a, int b) {\n        \n    }\n};","c":"int findLCM(int a, int b) {\n    \n}","javascript":"var findLCM = function(a, b) {\n    \n};"}', 
'[{"input":"12 18","expected":"36"},{"input":"5 10","expected":"10"},{"input":"7 11","expected":"77"}]', 
'36', 10, 'Math', '{"functionName":"findLCM","returnType":"int","params":[{"name":"a","type":"int"},{"name":"b","type":"int"}]}') ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    function_signatures = EXCLUDED.function_signatures,
    test_cases = EXCLUDED.test_cases,
    expected_output = EXCLUDED.expected_output,
    wrapper_config = EXCLUDED.wrapper_config;

-- ============================================
-- AUTO-GENERATED: 15 test cases per problem
-- First 3 = sample (visible), remaining 12 = hidden
-- ============================================

UPDATE problems SET test_cases = '[{"input":"[2,7,11,15]\\n9","expected":"[0, 1]","sample":true},{"input":"[3,2,4]\\n6","expected":"[1, 2]","sample":true},{"input":"[3,3]\\n6","expected":"[0, 1]","sample":true},{"input":"[1,5,3,7]\\n8","expected":"[1, 3]","sample":false},{"input":"[4,6,1]\\n5","expected":"[0, 2]","sample":false},{"input":"[0,4,3,0]\\n0","expected":"[0, 3]","sample":false},{"input":"[2,2]\\n4","expected":"[0, 1]","sample":false},{"input":"[1,2,3,4,5]\\n9","expected":"[3, 4]","sample":false},{"input":"[10,20,30]\\n50","expected":"[1, 2]","sample":false},{"input":"[-1,0,1]\\n0","expected":"[0, 2]","sample":false},{"input":"[100,200]\\n300","expected":"[0, 1]","sample":false},{"input":"[5,10,15,20]\\n25","expected":"[1, 2]","sample":false},{"input":"[1,3,5,7,9]\\n10","expected":"[0, 4]","sample":false},{"input":"[6,6]\\n12","expected":"[0, 1]","sample":false},{"input":"[1,4,5,6]\\n10","expected":"[1, 3]","sample":false}]' WHERE title = 'Two Sum';

UPDATE problems SET test_cases = '[{"input":"hello","expected":"olleh","sample":true},{"input":"world","expected":"dlrow","sample":true},{"input":"abcd","expected":"dcba","sample":true},{"input":"a","expected":"a","sample":false},{"input":"ab","expected":"ba","sample":false},{"input":"racecar","expected":"racecar","sample":false},{"input":"python","expected":"nohtyp","sample":false},{"input":"12345","expected":"54321","sample":false},{"input":"OpenAI","expected":"IAnepO","sample":false},{"input":"abcdef","expected":"fedcba","sample":false},{"input":"zzz","expected":"zzz","sample":false},{"input":"code","expected":"edoc","sample":false},{"input":"test","expected":"tset","sample":false},{"input":"hello world","expected":"dlrow olleh","sample":false},{"input":"madam","expected":"madam","sample":false}]' WHERE title = 'Reverse String';

UPDATE problems SET test_cases = '[{"input":"5","expected":"1\\n2\\nFizz\\n4\\nBuzz","sample":true},{"input":"15","expected":"1\\n2\\nFizz\\n4\\nBuzz\\nFizz\\n7\\n8\\nFizz\\nBuzz\\n11\\nFizz\\n13\\n14\\nFizzBuzz","sample":true},{"input":"3","expected":"1\\n2\\nFizz","sample":true},{"input":"1","expected":"1","sample":false},{"input":"2","expected":"1\\n2","sample":false},{"input":"6","expected":"1\\n2\\nFizz\\n4\\nBuzz\\nFizz","sample":false},{"input":"10","expected":"1\\n2\\nFizz\\n4\\nBuzz\\nFizz\\n7\\n8\\nFizz\\nBuzz","sample":false},{"input":"4","expected":"1\\n2\\nFizz\\n4","sample":false},{"input":"7","expected":"1\\n2\\nFizz\\n4\\nBuzz\\nFizz\\n7","sample":false},{"input":"9","expected":"1\\n2\\nFizz\\n4\\nBuzz\\nFizz\\n7\\n8\\nFizz","sample":false},{"input":"11","expected":"1\\n2\\nFizz\\n4\\nBuzz\\nFizz\\n7\\n8\\nFizz\\nBuzz\\n11","sample":false},{"input":"12","expected":"1\\n2\\nFizz\\n4\\nBuzz\\nFizz\\n7\\n8\\nFizz\\nBuzz\\n11\\nFizz","sample":false},{"input":"13","expected":"1\\n2\\nFizz\\n4\\nBuzz\\nFizz\\n7\\n8\\nFizz\\nBuzz\\n11\\nFizz\\n13","sample":false},{"input":"14","expected":"1\\n2\\nFizz\\n4\\nBuzz\\nFizz\\n7\\n8\\nFizz\\nBuzz\\n11\\nFizz\\n13\\n14","sample":false},{"input":"8","expected":"1\\n2\\nFizz\\n4\\nBuzz\\nFizz\\n7\\n8","sample":false}]' WHERE title = 'FizzBuzz';

UPDATE problems SET test_cases = '[{"input":"()[]{}","expected":"True","sample":true},{"input":"(]","expected":"False","sample":true},{"input":"([)]","expected":"False","sample":true},{"input":"()","expected":"True","sample":false},{"input":"{}","expected":"True","sample":false},{"input":"[]","expected":"True","sample":false},{"input":"((()))","expected":"True","sample":false},{"input":"(","expected":"False","sample":false},{"input":")","expected":"False","sample":false},{"input":"({[]})","expected":"True","sample":false},{"input":"[{()}]","expected":"True","sample":false},{"input":"","expected":"True","sample":false},{"input":"(()","expected":"False","sample":false},{"input":"({})[()]","expected":"True","sample":false},{"input":"([{}])()","expected":"True","sample":false}]' WHERE title = 'Valid Parentheses';

UPDATE problems SET test_cases = '[{"input":"[1,3,5]\\n[2,4,6]","expected":"[1, 2, 3, 4, 5, 6]","sample":true},{"input":"[1,2]\\n[3,4]","expected":"[1, 2, 3, 4]","sample":true},{"input":"[1]\\n[2]","expected":"[1, 2]","sample":true},{"input":"[]\\n[1,2,3]","expected":"[1, 2, 3]","sample":false},{"input":"[1,2,3]\\n[]","expected":"[1, 2, 3]","sample":false},{"input":"[1,1,1]\\n[1,1,1]","expected":"[1, 1, 1, 1, 1, 1]","sample":false},{"input":"[5,10,15]\\n[3,7,12]","expected":"[3, 5, 7, 10, 12, 15]","sample":false},{"input":"[1,3,5,7]\\n[2,4,6,8]","expected":"[1, 2, 3, 4, 5, 6, 7, 8]","sample":false},{"input":"[100]\\n[1]","expected":"[1, 100]","sample":false},{"input":"[2,4]\\n[1,3,5]","expected":"[1, 2, 3, 4, 5]","sample":false},{"input":"[0,0]\\n[0,0]","expected":"[0, 0, 0, 0]","sample":false},{"input":"[10,20,30]\\n[5,15,25]","expected":"[5, 10, 15, 20, 25, 30]","sample":false},{"input":"[-3,-1]\\n[-2,0]","expected":"[-3, -2, -1, 0]","sample":false},{"input":"[1,2,3,4,5]\\n[6,7,8,9,10]","expected":"[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]","sample":false},{"input":"[50]\\n[25,75]","expected":"[25, 50, 75]","sample":false}]' WHERE title = 'Merge Sorted Arrays';

UPDATE problems SET test_cases = '[{"input":"[1,3,5,7,9]\\n5","expected":"2","sample":true},{"input":"[1,3,5,7,9]\\n2","expected":"-1","sample":true},{"input":"[1,2,3,4,5]\\n1","expected":"0","sample":true},{"input":"[1,2,3,4,5]\\n5","expected":"4","sample":false},{"input":"[10,20,30,40,50]\\n30","expected":"2","sample":false},{"input":"[1]\\n1","expected":"0","sample":false},{"input":"[1]\\n2","expected":"-1","sample":false},{"input":"[2,4,6,8,10]\\n8","expected":"3","sample":false},{"input":"[1,3,5,7,9,11]\\n11","expected":"5","sample":false},{"input":"[100,200,300]\\n100","expected":"0","sample":false},{"input":"[5,15,25,35,45]\\n45","expected":"4","sample":false},{"input":"[1,2,3]\\n4","expected":"-1","sample":false},{"input":"[10,20,30,40]\\n10","expected":"0","sample":false},{"input":"[3,6,9,12,15]\\n9","expected":"2","sample":false},{"input":"[1,5,10,15,20,25]\\n15","expected":"3","sample":false}]' WHERE title = 'Binary Search';

UPDATE problems SET test_cases = '[{"input":"abcde\\nace","expected":"3","sample":true},{"input":"abc\\nabc","expected":"3","sample":true},{"input":"abc\\ndef","expected":"0","sample":true},{"input":"abcd\\nabd","expected":"3","sample":false},{"input":"a\\na","expected":"1","sample":false},{"input":"a\\nb","expected":"0","sample":false},{"input":"abcdef\\nacf","expected":"3","sample":false},{"input":"xyz\\nxyz","expected":"3","sample":false},{"input":"abcde\\nbce","expected":"3","sample":false},{"input":"abc\\n","expected":"0","sample":false},{"input":"pqrs\\nprt","expected":"2","sample":false},{"input":"aab\\nazb","expected":"2","sample":false},{"input":"bl\\nyby","expected":"1","sample":false},{"input":"abcba\\nabcbcba","expected":"5","sample":false},{"input":"oxcpqrsvwf\\nshmtulqrypy","expected":"2","sample":false}]' WHERE title = 'Longest Common Subsequence';

UPDATE problems SET test_cases = '[{"input":"[1,3]\\n[2]","expected":"2.0","sample":true},{"input":"[1,2]\\n[3,4]","expected":"2.5","sample":true},{"input":"[0,0]\\n[0,0]","expected":"0.0","sample":true},{"input":"[1]\\n[2,3]","expected":"2.0","sample":false},{"input":"[1,2,3]\\n[4,5,6]","expected":"3.5","sample":false},{"input":"[1]\\n[1]","expected":"1.0","sample":false},{"input":"[2]\\n[1,3,4]","expected":"2.5","sample":false},{"input":"[1,3,5]\\n[2,4,6]","expected":"3.5","sample":false},{"input":"[1,2]\\n[1,2]","expected":"1.5","sample":false},{"input":"[3]\\n[1,2]","expected":"2.0","sample":false},{"input":"[1,5,9]\\n[2,6,10]","expected":"5.5","sample":false},{"input":"[100]\\n[200]","expected":"150.0","sample":false},{"input":"[1,2,3,4]\\n[5,6,7,8]","expected":"4.5","sample":false},{"input":"[10,20]\\n[15,25]","expected":"17.5","sample":false},{"input":"[1]\\n[2,3,4,5]","expected":"3.0","sample":false}]' WHERE title = 'Median of Two Sorted Arrays';

UPDATE problems SET test_cases = '[{"input":"[1,5,3,9,2]","expected":"9","sample":true},{"input":"[10,20,5]","expected":"20","sample":true},{"input":"[1]","expected":"1","sample":true},{"input":"[3,3,3]","expected":"3","sample":false},{"input":"[-1,-5,-3]","expected":"-1","sample":false},{"input":"[100,200,300]","expected":"300","sample":false},{"input":"[0,0,0,0]","expected":"0","sample":false},{"input":"[7]","expected":"7","sample":false},{"input":"[5,4,3,2,1]","expected":"5","sample":false},{"input":"[1,2,3,4,5]","expected":"5","sample":false},{"input":"[-10,0,10]","expected":"10","sample":false},{"input":"[999,1000,998]","expected":"1000","sample":false},{"input":"[42,17,88,3]","expected":"88","sample":false},{"input":"[50,50]","expected":"50","sample":false},{"input":"[1,100,1]","expected":"100","sample":false}]' WHERE title = 'Find Maximum Number';

UPDATE problems SET test_cases = '[{"input":"[1,2,3,4]","expected":"10","sample":true},{"input":"[5,5,5]","expected":"15","sample":true},{"input":"[0]","expected":"0","sample":true},{"input":"[10,20,30]","expected":"60","sample":false},{"input":"[1]","expected":"1","sample":false},{"input":"[-1,1]","expected":"0","sample":false},{"input":"[100,200,300]","expected":"600","sample":false},{"input":"[7,3]","expected":"10","sample":false},{"input":"[0,0,0]","expected":"0","sample":false},{"input":"[1,2,3,4,5]","expected":"15","sample":false},{"input":"[10]","expected":"10","sample":false},{"input":"[50,50,50,50]","expected":"200","sample":false},{"input":"[-5,-3,-2]","expected":"-10","sample":false},{"input":"[99,1]","expected":"100","sample":false},{"input":"[1,1,1,1,1,1,1,1,1,1]","expected":"10","sample":false}]' WHERE title = 'Sum of Array';

UPDATE problems SET test_cases = '[{"input":"7","expected":"Odd","sample":true},{"input":"4","expected":"Even","sample":true},{"input":"0","expected":"Even","sample":true},{"input":"1","expected":"Odd","sample":false},{"input":"2","expected":"Even","sample":false},{"input":"100","expected":"Even","sample":false},{"input":"99","expected":"Odd","sample":false},{"input":"13","expected":"Odd","sample":false},{"input":"50","expected":"Even","sample":false},{"input":"1001","expected":"Odd","sample":false},{"input":"256","expected":"Even","sample":false},{"input":"3","expected":"Odd","sample":false},{"input":"10","expected":"Even","sample":false},{"input":"555","expected":"Odd","sample":false},{"input":"1024","expected":"Even","sample":false}]' WHERE title = 'Check Even or Odd';

UPDATE problems SET test_cases = '[{"input":"hello","expected":"2","sample":true},{"input":"aeiou","expected":"5","sample":true},{"input":"bcdfg","expected":"0","sample":true},{"input":"a","expected":"1","sample":false},{"input":"xyz","expected":"0","sample":false},{"input":"programming","expected":"3","sample":false},{"input":"AEIOU","expected":"5","sample":false},{"input":"python","expected":"1","sample":false},{"input":"beautiful","expected":"5","sample":false},{"input":"rhythm","expected":"0","sample":false},{"input":"education","expected":"5","sample":false},{"input":"b","expected":"0","sample":false},{"input":"umbrella","expected":"3","sample":false},{"input":"queue","expected":"4","sample":false},{"input":"strength","expected":"1","sample":false}]' WHERE title = 'Count Vowels';

UPDATE problems SET test_cases = '[{"input":"madam","expected":"True","sample":true},{"input":"hello","expected":"False","sample":true},{"input":"a","expected":"True","sample":true},{"input":"racecar","expected":"True","sample":false},{"input":"ab","expected":"False","sample":false},{"input":"aba","expected":"True","sample":false},{"input":"abba","expected":"True","sample":false},{"input":"abc","expected":"False","sample":false},{"input":"level","expected":"True","sample":false},{"input":"noon","expected":"True","sample":false},{"input":"kayak","expected":"True","sample":false},{"input":"world","expected":"False","sample":false},{"input":"deed","expected":"True","sample":false},{"input":"python","expected":"False","sample":false},{"input":"civic","expected":"True","sample":false}]' WHERE title = 'Palindrome String';

UPDATE problems SET test_cases = '[{"input":"[4,2,7,1]","expected":"1","sample":true},{"input":"[10,5,15]","expected":"5","sample":true},{"input":"[5]","expected":"5","sample":true},{"input":"[3,3,3]","expected":"3","sample":false},{"input":"[-1,-5,-3]","expected":"-5","sample":false},{"input":"[100,200,300]","expected":"100","sample":false},{"input":"[0,0,0,0]","expected":"0","sample":false},{"input":"[9,8,7,6,5]","expected":"5","sample":false},{"input":"[1,2,3]","expected":"1","sample":false},{"input":"[-10,0,10]","expected":"-10","sample":false},{"input":"[50]","expected":"50","sample":false},{"input":"[999,1,1000]","expected":"1","sample":false},{"input":"[42,17,88,3]","expected":"3","sample":false},{"input":"[50,50]","expected":"50","sample":false},{"input":"[7,2,9,4]","expected":"2","sample":false}]' WHERE title = 'Find Minimum';

UPDATE problems SET test_cases = '[{"input":"5","expected":"120","sample":true},{"input":"0","expected":"1","sample":true},{"input":"3","expected":"6","sample":true},{"input":"1","expected":"1","sample":false},{"input":"2","expected":"2","sample":false},{"input":"4","expected":"24","sample":false},{"input":"6","expected":"720","sample":false},{"input":"7","expected":"5040","sample":false},{"input":"8","expected":"40320","sample":false},{"input":"9","expected":"362880","sample":false},{"input":"10","expected":"3628800","sample":false},{"input":"11","expected":"39916800","sample":false},{"input":"12","expected":"479001600","sample":false},{"input":"13","expected":"6227020800","sample":false},{"input":"14","expected":"87178291200","sample":false}]' WHERE title = 'Factorial';

UPDATE problems SET test_cases = '[{"input":"6","expected":"8","sample":true},{"input":"1","expected":"1","sample":true},{"input":"5","expected":"5","sample":true},{"input":"0","expected":"0","sample":false},{"input":"2","expected":"1","sample":false},{"input":"3","expected":"2","sample":false},{"input":"4","expected":"3","sample":false},{"input":"7","expected":"13","sample":false},{"input":"8","expected":"21","sample":false},{"input":"9","expected":"34","sample":false},{"input":"10","expected":"55","sample":false},{"input":"11","expected":"89","sample":false},{"input":"12","expected":"144","sample":false},{"input":"13","expected":"233","sample":false},{"input":"14","expected":"377","sample":false}]' WHERE title = 'Fibonacci Nth';

UPDATE problems SET test_cases = '[{"input":"[1,2,3]","expected":"[3, 2, 1]","sample":true},{"input":"[10,20]","expected":"[20, 10]","sample":true},{"input":"[5]","expected":"[5]","sample":true},{"input":"[1,2,3,4,5]","expected":"[5, 4, 3, 2, 1]","sample":false},{"input":"[0,0,0]","expected":"[0, 0, 0]","sample":false},{"input":"[9,8,7,6]","expected":"[6, 7, 8, 9]","sample":false},{"input":"[100]","expected":"[100]","sample":false},{"input":"[-1,-2,-3]","expected":"[-3, -2, -1]","sample":false},{"input":"[1,1,1,1]","expected":"[1, 1, 1, 1]","sample":false},{"input":"[3,6,9]","expected":"[9, 6, 3]","sample":false},{"input":"[2,4]","expected":"[4, 2]","sample":false},{"input":"[7,14,21,28]","expected":"[28, 21, 14, 7]","sample":false},{"input":"[50,40,30,20,10]","expected":"[10, 20, 30, 40, 50]","sample":false},{"input":"[1,3,5,7,9]","expected":"[9, 7, 5, 3, 1]","sample":false},{"input":"[11,22,33]","expected":"[33, 22, 11]","sample":false}]' WHERE title = 'Reverse Array';

UPDATE problems SET test_cases = '[{"input":"12345","expected":"5","sample":true},{"input":"100","expected":"3","sample":true},{"input":"9","expected":"1","sample":true},{"input":"0","expected":"1","sample":false},{"input":"10","expected":"2","sample":false},{"input":"99999","expected":"5","sample":false},{"input":"1000000","expected":"7","sample":false},{"input":"42","expected":"2","sample":false},{"input":"7","expected":"1","sample":false},{"input":"555","expected":"3","sample":false},{"input":"1234567890","expected":"10","sample":false},{"input":"11","expected":"2","sample":false},{"input":"123","expected":"3","sample":false},{"input":"9999","expected":"4","sample":false},{"input":"50","expected":"2","sample":false}]' WHERE title = 'Count Digits';

UPDATE problems SET test_cases = '[{"input":"123","expected":"6","sample":true},{"input":"100","expected":"1","sample":true},{"input":"555","expected":"15","sample":true},{"input":"0","expected":"0","sample":false},{"input":"9","expected":"9","sample":false},{"input":"99","expected":"18","sample":false},{"input":"12","expected":"3","sample":false},{"input":"999","expected":"27","sample":false},{"input":"1001","expected":"2","sample":false},{"input":"45","expected":"9","sample":false},{"input":"111","expected":"3","sample":false},{"input":"246","expected":"12","sample":false},{"input":"789","expected":"24","sample":false},{"input":"50","expected":"5","sample":false},{"input":"321","expected":"6","sample":false}]' WHERE title = 'Sum of Digits';

UPDATE problems SET test_cases = '[{"input":"7","expected":"True","sample":true},{"input":"4","expected":"False","sample":true},{"input":"2","expected":"True","sample":true},{"input":"1","expected":"False","sample":false},{"input":"3","expected":"True","sample":false},{"input":"9","expected":"False","sample":false},{"input":"11","expected":"True","sample":false},{"input":"13","expected":"True","sample":false},{"input":"15","expected":"False","sample":false},{"input":"17","expected":"True","sample":false},{"input":"19","expected":"True","sample":false},{"input":"20","expected":"False","sample":false},{"input":"23","expected":"True","sample":false},{"input":"25","expected":"False","sample":false},{"input":"29","expected":"True","sample":false}]' WHERE title = 'Check Prime';

UPDATE problems SET test_cases = '[{"input":"3 7 5","expected":"7","sample":true},{"input":"10 5 15","expected":"15","sample":true},{"input":"1 1 1","expected":"1","sample":true},{"input":"0 0 0","expected":"0","sample":false},{"input":"100 200 300","expected":"300","sample":false},{"input":"-1 -2 -3","expected":"-1","sample":false},{"input":"5 5 3","expected":"5","sample":false},{"input":"10 10 10","expected":"10","sample":false},{"input":"99 100 98","expected":"100","sample":false},{"input":"1 2 3","expected":"3","sample":false},{"input":"50 25 75","expected":"75","sample":false},{"input":"7 3 9","expected":"9","sample":false},{"input":"1000 999 998","expected":"1000","sample":false},{"input":"0 1 -1","expected":"1","sample":false},{"input":"42 42 41","expected":"42","sample":false}]' WHERE title = 'Largest of Three';

UPDATE problems SET test_cases = '[{"input":"hello","expected":"5","sample":true},{"input":"world","expected":"5","sample":true},{"input":"a","expected":"1","sample":true},{"input":"","expected":"0","sample":false},{"input":"ab","expected":"2","sample":false},{"input":"python","expected":"6","sample":false},{"input":"programming","expected":"11","sample":false},{"input":"test","expected":"4","sample":false},{"input":"hi","expected":"2","sample":false},{"input":"abcdef","expected":"6","sample":false},{"input":"123","expected":"3","sample":false},{"input":"x","expected":"1","sample":false},{"input":"longer string","expected":"13","sample":false},{"input":"code","expected":"4","sample":false},{"input":"abcdefghij","expected":"10","sample":false}]' WHERE title = 'String Length';

UPDATE problems SET test_cases = '[{"input":"hello","expected":"HELLO","sample":true},{"input":"World","expected":"WORLD","sample":true},{"input":"abc","expected":"ABC","sample":true},{"input":"a","expected":"A","sample":false},{"input":"python","expected":"PYTHON","sample":false},{"input":"test","expected":"TEST","sample":false},{"input":"HeLLo","expected":"HELLO","sample":false},{"input":"xyz","expected":"XYZ","sample":false},{"input":"code","expected":"CODE","sample":false},{"input":"java","expected":"JAVA","sample":false},{"input":"hi","expected":"HI","sample":false},{"input":"ALREADY","expected":"ALREADY","sample":false},{"input":"open","expected":"OPEN","sample":false},{"input":"data","expected":"DATA","sample":false},{"input":"fun","expected":"FUN","sample":false}]' WHERE title = 'Uppercase String';

UPDATE problems SET test_cases = '[{"input":"HELLO","expected":"hello","sample":true},{"input":"World","expected":"world","sample":true},{"input":"ABC","expected":"abc","sample":true},{"input":"A","expected":"a","sample":false},{"input":"PYTHON","expected":"python","sample":false},{"input":"TEST","expected":"test","sample":false},{"input":"HeLLo","expected":"hello","sample":false},{"input":"XYZ","expected":"xyz","sample":false},{"input":"CODE","expected":"code","sample":false},{"input":"JAVA","expected":"java","sample":false},{"input":"HI","expected":"hi","sample":false},{"input":"already","expected":"already","sample":false},{"input":"OPEN","expected":"open","sample":false},{"input":"DATA","expected":"data","sample":false},{"input":"FUN","expected":"fun","sample":false}]' WHERE title = 'Lowercase String';

UPDATE problems SET test_cases = '[{"input":"5","expected":"25","sample":true},{"input":"0","expected":"0","sample":true},{"input":"3","expected":"9","sample":true},{"input":"1","expected":"1","sample":false},{"input":"10","expected":"100","sample":false},{"input":"7","expected":"49","sample":false},{"input":"12","expected":"144","sample":false},{"input":"2","expected":"4","sample":false},{"input":"4","expected":"16","sample":false},{"input":"6","expected":"36","sample":false},{"input":"8","expected":"64","sample":false},{"input":"9","expected":"81","sample":false},{"input":"11","expected":"121","sample":false},{"input":"15","expected":"225","sample":false},{"input":"20","expected":"400","sample":false}]' WHERE title = 'Square of Numbers';

UPDATE problems SET test_cases = '[{"input":"3","expected":"27","sample":true},{"input":"0","expected":"0","sample":true},{"input":"2","expected":"8","sample":true},{"input":"1","expected":"1","sample":false},{"input":"5","expected":"125","sample":false},{"input":"4","expected":"64","sample":false},{"input":"6","expected":"216","sample":false},{"input":"7","expected":"343","sample":false},{"input":"10","expected":"1000","sample":false},{"input":"8","expected":"512","sample":false},{"input":"9","expected":"729","sample":false},{"input":"11","expected":"1331","sample":false},{"input":"12","expected":"1728","sample":false},{"input":"15","expected":"3375","sample":false},{"input":"20","expected":"8000","sample":false}]' WHERE title = 'Cube of Numbers';

UPDATE problems SET test_cases = '[{"input":"3 5","expected":"5 3","sample":true},{"input":"10 20","expected":"20 10","sample":true},{"input":"0 0","expected":"0 0","sample":true},{"input":"1 2","expected":"2 1","sample":false},{"input":"-1 1","expected":"1 -1","sample":false},{"input":"100 200","expected":"200 100","sample":false},{"input":"7 3","expected":"3 7","sample":false},{"input":"50 50","expected":"50 50","sample":false},{"input":"99 1","expected":"1 99","sample":false},{"input":"5 10","expected":"10 5","sample":false},{"input":"42 24","expected":"24 42","sample":false},{"input":"0 1","expected":"1 0","sample":false},{"input":"1000 2000","expected":"2000 1000","sample":false},{"input":"13 31","expected":"31 13","sample":false},{"input":"8 4","expected":"4 8","sample":false}]' WHERE title = 'Swap Two Numbers';

UPDATE problems SET test_cases = '[{"input":"2000","expected":"True","sample":true},{"input":"1900","expected":"False","sample":true},{"input":"2024","expected":"True","sample":true},{"input":"2023","expected":"False","sample":false},{"input":"2100","expected":"False","sample":false},{"input":"1600","expected":"True","sample":false},{"input":"2004","expected":"True","sample":false},{"input":"1999","expected":"False","sample":false},{"input":"2020","expected":"True","sample":false},{"input":"1800","expected":"False","sample":false},{"input":"400","expected":"True","sample":false},{"input":"100","expected":"False","sample":false},{"input":"2016","expected":"True","sample":false},{"input":"2019","expected":"False","sample":false},{"input":"2400","expected":"True","sample":false}]' WHERE title = 'Is Leap Year Check';

UPDATE problems SET test_cases = '[{"input":"5","expected":"15","sample":true},{"input":"10","expected":"55","sample":true},{"input":"1","expected":"1","sample":true},{"input":"0","expected":"0","sample":false},{"input":"3","expected":"6","sample":false},{"input":"100","expected":"5050","sample":false},{"input":"7","expected":"28","sample":false},{"input":"20","expected":"210","sample":false},{"input":"50","expected":"1275","sample":false},{"input":"2","expected":"3","sample":false},{"input":"4","expected":"10","sample":false},{"input":"15","expected":"120","sample":false},{"input":"25","expected":"325","sample":false},{"input":"6","expected":"21","sample":false},{"input":"8","expected":"36","sample":false}]' WHERE title = 'Sum of First N Numbers';

UPDATE problems SET test_cases = '[{"input":"2 3","expected":"8","sample":true},{"input":"5 2","expected":"25","sample":true},{"input":"10 0","expected":"1","sample":true},{"input":"3 3","expected":"27","sample":false},{"input":"2 10","expected":"1024","sample":false},{"input":"1 100","expected":"1","sample":false},{"input":"7 2","expected":"49","sample":false},{"input":"4 3","expected":"64","sample":false},{"input":"2 0","expected":"1","sample":false},{"input":"5 3","expected":"125","sample":false},{"input":"6 2","expected":"36","sample":false},{"input":"3 4","expected":"81","sample":false},{"input":"2 5","expected":"32","sample":false},{"input":"9 2","expected":"81","sample":false},{"input":"10 3","expected":"1000","sample":false}]' WHERE title = 'Power of Number';

UPDATE problems SET test_cases = '[{"input":"123","expected":"321","sample":true},{"input":"100","expected":"1","sample":true},{"input":"5","expected":"5","sample":true},{"input":"1234","expected":"4321","sample":false},{"input":"0","expected":"0","sample":false},{"input":"10","expected":"1","sample":false},{"input":"999","expected":"999","sample":false},{"input":"1001","expected":"1001","sample":false},{"input":"50","expected":"5","sample":false},{"input":"12","expected":"21","sample":false},{"input":"54321","expected":"12345","sample":false},{"input":"7","expected":"7","sample":false},{"input":"200","expected":"2","sample":false},{"input":"9876","expected":"6789","sample":false},{"input":"1010","expected":"101","sample":false}]' WHERE title = 'Reverse Number';

UPDATE problems SET test_cases = '[{"input":"153","expected":"True","sample":true},{"input":"370","expected":"True","sample":true},{"input":"100","expected":"False","sample":true},{"input":"1","expected":"True","sample":false},{"input":"0","expected":"True","sample":false},{"input":"371","expected":"True","sample":false},{"input":"407","expected":"True","sample":false},{"input":"10","expected":"False","sample":false},{"input":"9","expected":"True","sample":false},{"input":"123","expected":"False","sample":false},{"input":"5","expected":"True","sample":false},{"input":"200","expected":"False","sample":false},{"input":"8","expected":"True","sample":false},{"input":"999","expected":"False","sample":false},{"input":"2","expected":"True","sample":false}]' WHERE title = 'Check Armstrong Number';

UPDATE problems SET test_cases = '[{"input":"12 8","expected":"4","sample":true},{"input":"100 75","expected":"25","sample":true},{"input":"7 3","expected":"1","sample":true},{"input":"6 6","expected":"6","sample":false},{"input":"10 5","expected":"5","sample":false},{"input":"1 1","expected":"1","sample":false},{"input":"24 36","expected":"12","sample":false},{"input":"15 10","expected":"5","sample":false},{"input":"21 14","expected":"7","sample":false},{"input":"48 18","expected":"6","sample":false},{"input":"100 10","expected":"10","sample":false},{"input":"9 6","expected":"3","sample":false},{"input":"17 13","expected":"1","sample":false},{"input":"56 98","expected":"14","sample":false},{"input":"81 27","expected":"27","sample":false}]' WHERE title = 'GCD of Two Numbers';

UPDATE problems SET test_cases = '[{"input":"4 6","expected":"12","sample":true},{"input":"3 5","expected":"15","sample":true},{"input":"7 3","expected":"21","sample":true},{"input":"1 1","expected":"1","sample":false},{"input":"6 6","expected":"6","sample":false},{"input":"2 3","expected":"6","sample":false},{"input":"12 8","expected":"24","sample":false},{"input":"10 15","expected":"30","sample":false},{"input":"5 7","expected":"35","sample":false},{"input":"4 10","expected":"20","sample":false},{"input":"9 6","expected":"18","sample":false},{"input":"8 12","expected":"24","sample":false},{"input":"15 20","expected":"60","sample":false},{"input":"3 9","expected":"9","sample":false},{"input":"14 21","expected":"42","sample":false}]' WHERE title = 'LCM of Two Numbers';

UPDATE problems SET test_cases = '[{"input":"5","expected":"5 10 15 20 25 30 35 40 45 50","sample":true},{"input":"3","expected":"3 6 9 12 15 18 21 24 27 30","sample":true},{"input":"1","expected":"1 2 3 4 5 6 7 8 9 10","sample":true},{"input":"2","expected":"2 4 6 8 10 12 14 16 18 20","sample":false},{"input":"7","expected":"7 14 21 28 35 42 49 56 63 70","sample":false},{"input":"10","expected":"10 20 30 40 50 60 70 80 90 100","sample":false},{"input":"4","expected":"4 8 12 16 20 24 28 32 36 40","sample":false},{"input":"6","expected":"6 12 18 24 30 36 42 48 54 60","sample":false},{"input":"8","expected":"8 16 24 32 40 48 56 64 72 80","sample":false},{"input":"9","expected":"9 18 27 36 45 54 63 72 81 90","sample":false},{"input":"11","expected":"11 22 33 44 55 66 77 88 99 110","sample":false},{"input":"12","expected":"12 24 36 48 60 72 84 96 108 120","sample":false},{"input":"15","expected":"15 30 45 60 75 90 105 120 135 150","sample":false},{"input":"20","expected":"20 40 60 80 100 120 140 160 180 200","sample":false},{"input":"13","expected":"13 26 39 52 65 78 91 104 117 130","sample":false}]' WHERE title = 'Multiplication Table';

UPDATE problems SET test_cases = '[{"input":"[1,2,3,4,5,6]","expected":"12","sample":true},{"input":"[2,4,6]","expected":"12","sample":true},{"input":"[1,3,5]","expected":"0","sample":true},{"input":"[10,20,30]","expected":"60","sample":false},{"input":"[0]","expected":"0","sample":false},{"input":"[1]","expected":"0","sample":false},{"input":"[2]","expected":"2","sample":false},{"input":"[1,2,3,4]","expected":"6","sample":false},{"input":"[100,200]","expected":"300","sample":false},{"input":"[7,8,9,10]","expected":"18","sample":false},{"input":"[0,0,0]","expected":"0","sample":false},{"input":"[11,22,33,44]","expected":"66","sample":false},{"input":"[5,10,15,20]","expected":"30","sample":false},{"input":"[1,2]","expected":"2","sample":false},{"input":"[4,4,4]","expected":"12","sample":false}]' WHERE title = 'Sum of Even Numbers';

UPDATE problems SET test_cases = '[{"input":"[1,2,3,4,5]","expected":"9","sample":true},{"input":"[1,3,5]","expected":"9","sample":true},{"input":"[2,4,6]","expected":"0","sample":true},{"input":"[10,11,12,13]","expected":"24","sample":false},{"input":"[0]","expected":"0","sample":false},{"input":"[1]","expected":"1","sample":false},{"input":"[3]","expected":"3","sample":false},{"input":"[1,2,3,4]","expected":"4","sample":false},{"input":"[99,100]","expected":"99","sample":false},{"input":"[7,8,9,10]","expected":"16","sample":false},{"input":"[0,0,0]","expected":"0","sample":false},{"input":"[11,22,33,44]","expected":"44","sample":false},{"input":"[5,10,15,20]","expected":"20","sample":false},{"input":"[1,2]","expected":"1","sample":false},{"input":"[3,5,7]","expected":"15","sample":false}]' WHERE title = 'Sum of Odd Numbers';

UPDATE problems SET test_cases = '[{"input":"[1,2,3,4,5,6]","expected":"3","sample":true},{"input":"[2,4,6,8]","expected":"4","sample":true},{"input":"[1,3,5]","expected":"0","sample":true},{"input":"[10]","expected":"1","sample":false},{"input":"[1]","expected":"0","sample":false},{"input":"[0]","expected":"1","sample":false},{"input":"[2,3,4,5]","expected":"2","sample":false},{"input":"[100,200,300]","expected":"3","sample":false},{"input":"[7,8,9,10]","expected":"2","sample":false},{"input":"[1,2,3,4,5,6,7,8]","expected":"4","sample":false},{"input":"[11,22,33,44,55]","expected":"2","sample":false},{"input":"[0,0,0]","expected":"3","sample":false},{"input":"[1,1,1]","expected":"0","sample":false},{"input":"[2,2,2]","expected":"3","sample":false},{"input":"[5,10,15,20]","expected":"2","sample":false}]' WHERE title = 'Count Even Numbers in Array';

UPDATE problems SET test_cases = '[{"input":"[1,2,3,4,5]","expected":"3","sample":true},{"input":"[1,3,5,7]","expected":"4","sample":true},{"input":"[2,4,6]","expected":"0","sample":true},{"input":"[10]","expected":"0","sample":false},{"input":"[1]","expected":"1","sample":false},{"input":"[0]","expected":"0","sample":false},{"input":"[2,3,4,5]","expected":"2","sample":false},{"input":"[100,201,300]","expected":"1","sample":false},{"input":"[7,8,9,10]","expected":"2","sample":false},{"input":"[1,2,3,4,5,6,7,8]","expected":"4","sample":false},{"input":"[11,22,33,44,55]","expected":"3","sample":false},{"input":"[0,0,0]","expected":"0","sample":false},{"input":"[1,1,1]","expected":"3","sample":false},{"input":"[3,3,3]","expected":"3","sample":false},{"input":"[5,10,15,20]","expected":"2","sample":false}]' WHERE title = 'Count Odd Numbers';

UPDATE problems SET test_cases = '[{"input":"[1,2,3,4,5]","expected":"4","sample":true},{"input":"[10,20,30]","expected":"20","sample":true},{"input":"[5,5,5]","expected":"-1","sample":true},{"input":"[1,2]","expected":"1","sample":false},{"input":"[100,50,75]","expected":"75","sample":false},{"input":"[3,1,2]","expected":"2","sample":false},{"input":"[9,8,7,6]","expected":"8","sample":false},{"input":"[1,1,2]","expected":"1","sample":false},{"input":"[5,3,5,1]","expected":"3","sample":false},{"input":"[10,10,10]","expected":"-1","sample":false},{"input":"[7,7,8]","expected":"7","sample":false},{"input":"[1,3]","expected":"1","sample":false},{"input":"[50,40,30,20]","expected":"40","sample":false},{"input":"[99,100]","expected":"99","sample":false},{"input":"[2,4,6,8,10]","expected":"8","sample":false}]' WHERE title = 'Find Second Largest';

UPDATE problems SET test_cases = '[{"input":"[10,20,30]","expected":"20.0","sample":true},{"input":"[5,5,5]","expected":"5.0","sample":true},{"input":"[1,2,3,4]","expected":"2.5","sample":true},{"input":"[0]","expected":"0.0","sample":false},{"input":"[100]","expected":"100.0","sample":false},{"input":"[1,2]","expected":"1.5","sample":false},{"input":"[10,20]","expected":"15.0","sample":false},{"input":"[3,6,9]","expected":"6.0","sample":false},{"input":"[1,1,1,1]","expected":"1.0","sample":false},{"input":"[50,100]","expected":"75.0","sample":false},{"input":"[7,8,9]","expected":"8.0","sample":false},{"input":"[2,4,6,8,10]","expected":"6.0","sample":false},{"input":"[0,0,0]","expected":"0.0","sample":false},{"input":"[25,75]","expected":"50.0","sample":false},{"input":"[1,3,5,7,9]","expected":"5.0","sample":false}]' WHERE title = 'Find Average';

UPDATE problems SET test_cases = '[{"input":"[1,2,3,4,5]","expected":"True","sample":true},{"input":"[5,4,3,2,1]","expected":"False","sample":true},{"input":"[1]","expected":"True","sample":true},{"input":"[1,1,1]","expected":"True","sample":false},{"input":"[1,3,2]","expected":"False","sample":false},{"input":"[1,2]","expected":"True","sample":false},{"input":"[2,1]","expected":"False","sample":false},{"input":"[0,0,0,0]","expected":"True","sample":false},{"input":"[1,2,3]","expected":"True","sample":false},{"input":"[3,2,1]","expected":"False","sample":false},{"input":"[10,20,30,40]","expected":"True","sample":false},{"input":"[1,2,2,3]","expected":"True","sample":false},{"input":"[5,10,3]","expected":"False","sample":false},{"input":"[100,200,300]","expected":"True","sample":false},{"input":"[9,8]","expected":"False","sample":false}]' WHERE title = 'Check Sorted Array';

UPDATE problems SET test_cases = '[{"input":"[1,2,3]\\n[4,5,6]","expected":"[1, 2, 3, 4, 5, 6]","sample":true},{"input":"[1]\\n[2]","expected":"[1, 2]","sample":true},{"input":"[]\\n[1,2]","expected":"[1, 2]","sample":true},{"input":"[1,2]\\n[]","expected":"[1, 2]","sample":false},{"input":"[5,10]\\n[15,20]","expected":"[5, 10, 15, 20]","sample":false},{"input":"[0]\\n[0]","expected":"[0, 0]","sample":false},{"input":"[1,3,5]\\n[2,4,6]","expected":"[1, 3, 5, 2, 4, 6]","sample":false},{"input":"[100]\\n[200,300]","expected":"[100, 200, 300]","sample":false},{"input":"[7,8,9]\\n[10,11,12]","expected":"[7, 8, 9, 10, 11, 12]","sample":false},{"input":"[1,1]\\n[1,1]","expected":"[1, 1, 1, 1]","sample":false},{"input":"[-1]\\n[1]","expected":"[-1, 1]","sample":false},{"input":"[3,6]\\n[9,12]","expected":"[3, 6, 9, 12]","sample":false},{"input":"[50,60,70]\\n[80]","expected":"[50, 60, 70, 80]","sample":false},{"input":"[1,2,3,4]\\n[5,6,7,8]","expected":"[1, 2, 3, 4, 5, 6, 7, 8]","sample":false},{"input":"[10]\\n[20,30,40]","expected":"[10, 20, 30, 40]","sample":false}]' WHERE title = 'Merge Two Arrays';

UPDATE problems SET test_cases = '[{"input":"[1,2,2,3,3,4]","expected":"[1, 2, 3, 4]","sample":true},{"input":"[1,1,1]","expected":"[1]","sample":true},{"input":"[1,2,3]","expected":"[1, 2, 3]","sample":true},{"input":"[5]","expected":"[5]","sample":false},{"input":"[1,2,1,2]","expected":"[1, 2]","sample":false},{"input":"[3,3,3,3]","expected":"[3]","sample":false},{"input":"[10,20,10,30,20]","expected":"[10, 20, 30]","sample":false},{"input":"[0,0,1,1,2,2]","expected":"[0, 1, 2]","sample":false},{"input":"[5,4,3,2,1]","expected":"[5, 4, 3, 2, 1]","sample":false},{"input":"[7,7,8,8,9]","expected":"[7, 8, 9]","sample":false},{"input":"[1]","expected":"[1]","sample":false},{"input":"[2,2]","expected":"[2]","sample":false},{"input":"[100,200,100]","expected":"[100, 200]","sample":false},{"input":"[1,2,3,4,5]","expected":"[1, 2, 3, 4, 5]","sample":false},{"input":"[9,9,9,8,7]","expected":"[9, 8, 7]","sample":false}]' WHERE title = 'Remove Duplicates';

UPDATE problems SET test_cases = '[{"input":"[1,2,3,4,5]\\n3","expected":"2","sample":true},{"input":"[10,20,30]\\n20","expected":"1","sample":true},{"input":"[5,10,15]\\n5","expected":"0","sample":true},{"input":"[1,2,3]\\n4","expected":"-1","sample":false},{"input":"[7]\\n7","expected":"0","sample":false},{"input":"[1,2,3,4,5]\\n1","expected":"0","sample":false},{"input":"[1,2,3,4,5]\\n5","expected":"4","sample":false},{"input":"[10,20,30,40]\\n40","expected":"3","sample":false},{"input":"[100]\\n50","expected":"-1","sample":false},{"input":"[3,6,9,12]\\n9","expected":"2","sample":false},{"input":"[1,1,1]\\n1","expected":"0","sample":false},{"input":"[5,10,15,20]\\n15","expected":"2","sample":false},{"input":"[2,4,6,8,10]\\n6","expected":"2","sample":false},{"input":"[0,0,0]\\n0","expected":"0","sample":false},{"input":"[50,100]\\n100","expected":"1","sample":false}]' WHERE title = 'Find Index of Element';

UPDATE problems SET test_cases = '[{"input":"[1,2,2,3,3,3]\\n3","expected":"3","sample":true},{"input":"[1,1,1,1]\\n1","expected":"4","sample":true},{"input":"[5,10,15]\\n20","expected":"0","sample":true},{"input":"[0,0,0,0,0]\\n0","expected":"5","sample":false},{"input":"[1,2,3]\\n2","expected":"1","sample":false},{"input":"[7]\\n7","expected":"1","sample":false},{"input":"[1,2,3]\\n4","expected":"0","sample":false},{"input":"[5,5,5,5]\\n5","expected":"4","sample":false},{"input":"[10,20,10,30,10]\\n10","expected":"3","sample":false},{"input":"[1,2,1,2,1]\\n1","expected":"3","sample":false},{"input":"[3,3,3]\\n3","expected":"3","sample":false},{"input":"[100,200,300]\\n200","expected":"1","sample":false},{"input":"[1]\\n1","expected":"1","sample":false},{"input":"[1]\\n2","expected":"0","sample":false},{"input":"[2,4,6,8,2]\\n2","expected":"2","sample":false}]' WHERE title = 'Count Occurrences';

UPDATE problems SET test_cases = '[{"input":"[1,2,3,4]","expected":"24","sample":true},{"input":"[5,5]","expected":"25","sample":true},{"input":"[1]","expected":"1","sample":true},{"input":"[2,3]","expected":"6","sample":false},{"input":"[10,10,10]","expected":"1000","sample":false},{"input":"[0,5,10]","expected":"0","sample":false},{"input":"[1,1,1,1]","expected":"1","sample":false},{"input":"[2,2,2]","expected":"8","sample":false},{"input":"[3,3,3]","expected":"27","sample":false},{"input":"[7,1]","expected":"7","sample":false},{"input":"[100]","expected":"100","sample":false},{"input":"[5,4,3,2,1]","expected":"120","sample":false},{"input":"[2,5]","expected":"10","sample":false},{"input":"[6,7]","expected":"42","sample":false},{"input":"[1,2,3,4,5]","expected":"120","sample":false}]' WHERE title = 'Multiply All Elements';

UPDATE problems SET test_cases = '[{"input":"5","expected":"Positive","sample":true},{"input":"-3","expected":"Negative","sample":true},{"input":"0","expected":"Zero","sample":true},{"input":"1","expected":"Positive","sample":false},{"input":"-1","expected":"Negative","sample":false},{"input":"100","expected":"Positive","sample":false},{"input":"-100","expected":"Negative","sample":false},{"input":"42","expected":"Positive","sample":false},{"input":"-42","expected":"Negative","sample":false},{"input":"999","expected":"Positive","sample":false},{"input":"-999","expected":"Negative","sample":false},{"input":"7","expected":"Positive","sample":false},{"input":"-7","expected":"Negative","sample":false},{"input":"50","expected":"Positive","sample":false},{"input":"-50","expected":"Negative","sample":false}]' WHERE title = 'Check Positive or Negative';

UPDATE problems SET test_cases = '[{"input":"listen\\nsilent","expected":"True","sample":true},{"input":"hello\\nworld","expected":"False","sample":true},{"input":"abc\\ncba","expected":"True","sample":true},{"input":"a\\na","expected":"True","sample":false},{"input":"ab\\nba","expected":"True","sample":false},{"input":"abc\\nabd","expected":"False","sample":false},{"input":"rat\\ntar","expected":"True","sample":false},{"input":"cat\\nact","expected":"True","sample":false},{"input":"dog\\ngod","expected":"True","sample":false},{"input":"test\\ntset","expected":"True","sample":false},{"input":"ab\\nab","expected":"True","sample":false},{"input":"abc\\ndef","expected":"False","sample":false},{"input":"aabb\\nbbaa","expected":"True","sample":false},{"input":"xyz\\nxzy","expected":"True","sample":false},{"input":"hello\\nhellp","expected":"False","sample":false}]' WHERE title = 'Check Anagram';

UPDATE problems SET test_cases = '[{"input":"hello world\\nworld","expected":"True","sample":true},{"input":"python\\njava","expected":"False","sample":true},{"input":"abc\\na","expected":"True","sample":true},{"input":"test\\ntest","expected":"True","sample":false},{"input":"abc\\nd","expected":"False","sample":false},{"input":"programming\\ngram","expected":"True","sample":false},{"input":"hello\\nlo","expected":"True","sample":false},{"input":"data\\ndat","expected":"True","sample":false},{"input":"code\\nxyz","expected":"False","sample":false},{"input":"abcdef\\ncde","expected":"True","sample":false},{"input":"hello\\nhello world","expected":"False","sample":false},{"input":"string\\nring","expected":"True","sample":false},{"input":"test\\nesting","expected":"False","sample":false},{"input":"abcabc\\nabc","expected":"True","sample":false},{"input":"xyz\\nxyz","expected":"True","sample":false}]' WHERE title = 'Check Substring';

UPDATE problems SET test_cases = '[{"input":"hello\\nl","expected":"2","sample":true},{"input":"aabbcc\\na","expected":"2","sample":true},{"input":"test\\nt","expected":"2","sample":true},{"input":"abc\\nd","expected":"0","sample":false},{"input":"aaaa\\na","expected":"4","sample":false},{"input":"hello\\no","expected":"1","sample":false},{"input":"programming\\nm","expected":"2","sample":false},{"input":"banana\\na","expected":"3","sample":false},{"input":"mississippi\\ns","expected":"4","sample":false},{"input":"hello\\nh","expected":"1","sample":false},{"input":"aeiou\\ne","expected":"1","sample":false},{"input":"xxx\\nx","expected":"3","sample":false},{"input":"abc\\na","expected":"1","sample":false},{"input":"abcabc\\nc","expected":"2","sample":false},{"input":"zzz\\nz","expected":"3","sample":false}]' WHERE title = 'Count Character Frequency';

UPDATE problems SET test_cases = '[{"input":"hello world","expected":"helloworld","sample":true},{"input":"a b c","expected":"abc","sample":true},{"input":"no spaces","expected":"nospaces","sample":true},{"input":"hello","expected":"hello","sample":false},{"input":"  leading","expected":"leading","sample":false},{"input":"trailing  ","expected":"trailing","sample":false},{"input":"  both  ","expected":"both","sample":false},{"input":"a  b  c","expected":"abc","sample":false},{"input":"one two three","expected":"onetwothree","sample":false},{"input":"x y z","expected":"xyz","sample":false},{"input":"hi there","expected":"hithere","sample":false},{"input":"test case","expected":"testcase","sample":false},{"input":"no  extra  space","expected":"noextraspace","sample":false},{"input":"a","expected":"a","sample":false},{"input":"  a  ","expected":"a","sample":false}]' WHERE title = 'Remove Spaces From String';

UPDATE problems SET test_cases = '[{"input":"hello","expected":"h","sample":true},{"input":"world","expected":"w","sample":true},{"input":"a","expected":"a","sample":true},{"input":"Python","expected":"P","sample":false},{"input":"Java","expected":"J","sample":false},{"input":"code","expected":"c","sample":false},{"input":"test","expected":"t","sample":false},{"input":"xyz","expected":"x","sample":false},{"input":"ABC","expected":"A","sample":false},{"input":"123","expected":"1","sample":false},{"input":"Z","expected":"Z","sample":false},{"input":"open","expected":"o","sample":false},{"input":"data","expected":"d","sample":false},{"input":"fun","expected":"f","sample":false},{"input":"hi","expected":"h","sample":false}]' WHERE title = 'First Character';

UPDATE problems SET test_cases = '[{"input":"hello","expected":"o","sample":true},{"input":"world","expected":"d","sample":true},{"input":"a","expected":"a","sample":true},{"input":"Python","expected":"n","sample":false},{"input":"Java","expected":"a","sample":false},{"input":"code","expected":"e","sample":false},{"input":"test","expected":"t","sample":false},{"input":"xyz","expected":"z","sample":false},{"input":"ABC","expected":"C","sample":false},{"input":"123","expected":"3","sample":false},{"input":"Z","expected":"Z","sample":false},{"input":"open","expected":"n","sample":false},{"input":"data","expected":"a","sample":false},{"input":"fun","expected":"n","sample":false},{"input":"hi","expected":"i","sample":false}]' WHERE title = 'Last Character';

UPDATE problems SET test_cases = '[{"input":"hello world","expected":"1","sample":true},{"input":"a b c d","expected":"3","sample":true},{"input":"nospaces","expected":"0","sample":true},{"input":" ","expected":"1","sample":false},{"input":"  ","expected":"2","sample":false},{"input":"one two three","expected":"2","sample":false},{"input":"a","expected":"0","sample":false},{"input":"hello  world","expected":"2","sample":false},{"input":"test case here","expected":"2","sample":false},{"input":"   three   ","expected":"6","sample":false},{"input":"hi there","expected":"1","sample":false},{"input":"abc","expected":"0","sample":false},{"input":"x y","expected":"1","sample":false},{"input":"a b c d e","expected":"4","sample":false},{"input":"single","expected":"0","sample":false}]' WHERE title = 'Count Spaces in String';

UPDATE problems SET test_cases = '[{"input":"hello\\nl","expected":"heo","sample":true},{"input":"world\\no","expected":"wrld","sample":true},{"input":"abc\\nb","expected":"ac","sample":true},{"input":"test\\nt","expected":"es","sample":false},{"input":"aaa\\na","expected":"","sample":false},{"input":"python\\np","expected":"ython","sample":false},{"input":"hello\\nx","expected":"hello","sample":false},{"input":"abcabc\\nc","expected":"abab","sample":false},{"input":"programming\\ng","expected":"prorammin","sample":false},{"input":"remove\\ne","expected":"rmov","sample":false},{"input":"data\\na","expected":"dt","sample":false},{"input":"coding\\nd","expected":"coing","sample":false},{"input":"xyz\\nz","expected":"xy","sample":false},{"input":"aeiou\\na","expected":"eiou","sample":false},{"input":"mississippi\\ni","expected":"msssspp","sample":false}]' WHERE title = 'Remove Character From String';

UPDATE problems SET test_cases = '[{"input":"hello\\nl\\nx","expected":"hexxo","sample":true},{"input":"world\\no\\na","expected":"warld","sample":true},{"input":"abc\\nb\\nz","expected":"azc","sample":true},{"input":"test\\nt\\nm","expected":"mesm","sample":false},{"input":"aaa\\na\\nb","expected":"bbb","sample":false},{"input":"python\\np\\nP","expected":"Python","sample":false},{"input":"hello\\nx\\ny","expected":"hello","sample":false},{"input":"abcabc\\nc\\nz","expected":"abzabz","sample":false},{"input":"data\\na\\no","expected":"doto","sample":false},{"input":"code\\ne\\na","expected":"coda","sample":false},{"input":"xyz\\nx\\na","expected":"ayz","sample":false},{"input":"aba\\na\\nc","expected":"cbc","sample":false},{"input":"test\\ne\\na","expected":"tast","sample":false},{"input":"noon\\nn\\nm","expected":"moom","sample":false},{"input":"deed\\nd\\nb","expected":"beeb","sample":false}]' WHERE title = 'Replace Character';
