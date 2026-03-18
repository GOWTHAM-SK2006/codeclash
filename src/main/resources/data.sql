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

-- Easy Problems (20 problems)
INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Reverse String', 'Reverse the given string.', 'Easy',
'def reverseString(s):
    # Your code here
    pass',
'[{"input":"hello","expected":"olleh"},{"input":"world","expected":"dlrow"},{"input":"abc","expected":"cba"}]',
'olleh', 10, 'Strings') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Find Maximum Number', 'Return the maximum number in an array.', 'Easy',
'def findMax(nums):
    # Your code here
    pass',
'[{"input":"[1,5,3,9,2]","expected":"9"},{"input":"[10,20,5]","expected":"20"},{"input":"[1]","expected":"1"}]',
'9', 10, 'Arrays') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Sum of Array', 'Return sum of all elements.', 'Easy',
'def sumArray(nums):
    # Your code here
    pass',
'[{"input":"[1,2,3,4]","expected":"10"},{"input":"[5,5,5]","expected":"15"},{"input":"[0]","expected":"0"}]',
'10', 10, 'Arrays') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Check Even or Odd', 'Check if number is even or odd.', 'Easy',
'def checkEvenOdd(n):
    # Your code here
    pass',
'[{"input":"7","expected":"Odd"},{"input":"4","expected":"Even"},{"input":"0","expected":"Even"}]',
'Odd', 10, 'Logic') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Count Vowels', 'Count vowels in string.', 'Easy',
'def countVowels(s):
    # Your code here
    pass',
'[{"input":"hello","expected":"2"},{"input":"aeiou","expected":"5"},{"input":"bcdfg","expected":"0"}]',
'2', 10, 'Strings') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Palindrome String', 'Check if string is palindrome.', 'Easy',
'def isPalindrome(s):
    # Your code here
    pass',
'[{"input":"madam","expected":"True"},{"input":"hello","expected":"False"},{"input":"a","expected":"True"}]',
'True', 10, 'Strings') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Find Minimum', 'Return minimum element.', 'Easy',
'def findMin(nums):
    # Your code here
    pass',
'[{"input":"[4,2,7,1]","expected":"1"},{"input":"[10,5,15]","expected":"5"},{"input":"[5]","expected":"5"}]',
'1', 10, 'Arrays') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Factorial', 'Return factorial of n.', 'Easy',
'def factorial(n):
    # Your code here
    pass',
'[{"input":"5","expected":"120"},{"input":"0","expected":"1"},{"input":"3","expected":"6"}]',
'120', 10, 'Math') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Fibonacci Nth', 'Return nth Fibonacci number.', 'Easy',
'def fibonacci(n):
    # Your code here
    pass',
'[{"input":"6","expected":"8"},{"input":"1","expected":"1"},{"input":"5","expected":"5"}]',
'8', 10, 'Math') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Reverse Array', 'Reverse array.', 'Easy',
'def reverseArray(nums):
    # Your code here
    pass',
'[{"input":"[1,2,3]","expected":"[3,2,1]"},{"input":"[10,20]","expected":"[20,10]"},{"input":"[5]","expected":"[5]"}]',
'[3,2,1]', 10, 'Arrays') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Count Digits', 'Count number of digits.', 'Easy',
'def countDigits(n):
    # Your code here
    pass',
'[{"input":"12345","expected":"5"},{"input":"100","expected":"3"},{"input":"9","expected":"1"}]',
'5', 10, 'Math') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Sum of Digits', 'Return sum of digits.', 'Easy',
'def sumOfDigits(n):
    # Your code here
    pass',
'[{"input":"123","expected":"6"},{"input":"100","expected":"1"},{"input":"555","expected":"15"}]',
'6', 10, 'Math') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Check Prime', 'Check if number is prime.', 'Easy',
'def isPrime(n):
    # Your code here
    pass',
'[{"input":"7","expected":"True"},{"input":"4","expected":"False"},{"input":"2","expected":"True"}]',
'True', 10, 'Math') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Largest of Three', 'Return largest of three numbers.', 'Easy',
'def largestOfThree(a, b, c):
    # Your code here
    pass',
'[{"input":"3 7 5","expected":"7"},{"input":"10 5 15","expected":"15"},{"input":"1 1 1","expected":"1"}]',
'7', 10, 'Logic') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('String Length', 'Return length of string.', 'Easy',
'def stringLength(s):
    # Your code here
    pass',
'[{"input":"hello","expected":"5"},{"input":"world","expected":"5"},{"input":"a","expected":"1"}]',
'5', 10, 'Strings') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Uppercase String', 'Convert string to uppercase.', 'Easy',
'def toUppercase(s):
    # Your code here
    pass',
'[{"input":"hello","expected":"HELLO"},{"input":"World","expected":"WORLD"},{"input":"HeLLo","expected":"HELLO"}]',
'HELLO', 10, 'Strings') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Lowercase String', 'Convert string to lowercase.', 'Easy',
'def toLowercase(s):
    # Your code here
    pass',
'[{"input":"HELLO","expected":"hello"},{"input":"World","expected":"world"},{"input":"HeLLo","expected":"hello"}]',
'hello', 10, 'Strings') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('First Character', 'Return first character of string.', 'Easy',
'def firstChar(s):
    # Your code here
    pass',
'[{"input":"hello","expected":"h"},{"input":"world","expected":"w"},{"input":"a","expected":"a"}]',
'h', 10, 'Strings') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Last Character', 'Return last character of string.', 'Easy',
'def lastChar(s):
    # Your code here
    pass',
'[{"input":"hello","expected":"o"},{"input":"world","expected":"d"},{"input":"a","expected":"a"}]',
'o', 10, 'Strings') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Swap Two Numbers', 'Swap two numbers and return them.', 'Easy',
'def swapNumbers(a, b):
    # Your code here
    pass',
'[{"input":"3 5","expected":"5 3"},{"input":"10 20","expected":"20 10"},{"input":"1 1","expected":"1 1"}]',
'5 3', 10, 'Logic') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Check Positive or Negative', 'Check if number is positive or negative.', 'Easy',
'def checkSign(n):
    # Your code here
    pass',
'[{"input":"-5","expected":"Negative"},{"input":"10","expected":"Positive"},{"input":"0","expected":"Zero"}]',
'Negative', 10, 'Logic') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Sum of First N Numbers', 'Return sum of first N natural numbers.', 'Easy',
'def sumFirstN(n):
    # Your code here
    pass',
'[{"input":"5","expected":"15"},{"input":"10","expected":"55"},{"input":"1","expected":"1"}]',
'15', 10, 'Math') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Multiplication Table', 'Print multiplication table of N up to 10.', 'Easy',
'def multiplicationTable(n):
    # Your code here
    pass',
'[{"input":"3","expected":"3 6 9 12 15 18 21 24 27 30"},{"input":"2","expected":"2 4 6 8 10 12 14 16 18 20"}]',
'3 6 9 12 15 18 21 24 27 30', 10, 'Logic') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Count Even Numbers in Array', 'Count even numbers in array.', 'Easy',
'def countEven(nums):
    # Your code here
    pass',
'[{"input":"[1,2,3,4,6]","expected":"3"},{"input":"[1,3,5]","expected":"0"},{"input":"[2,4]","expected":"2"}]',
'3', 10, 'Arrays') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Count Odd Numbers', 'Count odd numbers in array.', 'Easy',
'def countOdd(nums):
    # Your code here
    pass',
'[{"input":"[1,2,3,4,5]","expected":"3"},{"input":"[2,4]","expected":"0"},{"input":"[1,3,5]","expected":"3"}]',
'3', 10, 'Arrays') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Square of Numbers', 'Return array of squares.', 'Easy',
'def squareArray(nums):
    # Your code here
    pass',
'[{"input":"[1,2,3]","expected":"[1,4,9]"},{"input":"[2,3,4]","expected":"[4,9,16]"}]',
'[1,4,9]', 10, 'Arrays') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Cube of Numbers', 'Return array of cubes.', 'Easy',
'def cubeArray(nums):
    # Your code here
    pass',
'[{"input":"[1,2,3]","expected":"[1,8,27]"},{"input":"[2,3]","expected":"[8,27]"}]',
'[1,8,27]', 10, 'Arrays') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Check Armstrong Number', 'Check if number is Armstrong number.', 'Easy',
'def isArmstrong(n):
    # Your code here
    pass',
'[{"input":"153","expected":"True"},{"input":"370","expected":"True"},{"input":"123","expected":"False"}]',
'True', 10, 'Math') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Reverse Number', 'Reverse a number.', 'Easy',
'def reverseNum(n):
    # Your code here
    pass',
'[{"input":"123","expected":"321"},{"input":"1000","expected":"1"},{"input":"456","expected":"654"}]',
'321', 10, 'Math') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Sum of Even Numbers', 'Sum of even numbers in array.', 'Easy',
'def sumEven(nums):
    # Your code here
    pass',
'[{"input":"[1,2,3,4]","expected":"6"},{"input":"[2,4,6]","expected":"12"},{"input":"[1,3,5]","expected":"0"}]',
'6', 10, 'Arrays') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Sum of Odd Numbers', 'Sum of odd numbers in array.', 'Easy',
'def sumOdd(nums):
    # Your code here
    pass',
'[{"input":"[1,2,3,4,5]","expected":"9"},{"input":"[1,3,5]","expected":"9"},{"input":"[2,4]","expected":"0"}]',
'9', 10, 'Arrays') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Find Second Largest', 'Find second largest element.', 'Easy',
'def secondLargest(nums):
    # Your code here
    pass',
'[{"input":"[1,5,3,9,2]","expected":"5"},{"input":"[10,20,15]","expected":"15"},{"input":"[1,2]","expected":"1"}]',
'5', 10, 'Arrays') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Check Sorted Array', 'Check if array is sorted.', 'Easy',
'def isSorted(nums):
    # Your code here
    pass',
'[{"input":"[1,2,3,4]","expected":"True"},{"input":"[4,3,2,1]","expected":"False"},{"input":"[1,1,1]","expected":"True"}]',
'True', 10, 'Arrays') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Count Spaces in String', 'Count spaces in string.', 'Easy',
'def countSpaces(s):
    # Your code here
    pass',
'[{"input":"hello world","expected":"1"},{"input":"hello  world","expected":"2"},{"input":"nospaces","expected":"0"}]',
'1', 10, 'Strings') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Remove Spaces', 'Remove spaces from string.', 'Easy',
'def removeSpaces(s):
    # Your code here
    pass',
'[{"input":"hello world","expected":"helloworld"},{"input":"h e l l o","expected":"hello"},{"input":"nosp","expected":"nosp"}]',
'helloworld', 10, 'Strings') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Replace Character', 'Replace all occurrences of character.', 'Easy',
'def replaceChar(s, old, new):
    # Your code here
    pass',
'[{"input":"hello l x","expected":"hexxo"},{"input":"aaa a b","expected":"bbb"}]',
'hexxo', 10, 'Strings') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Count Character Frequency', 'Count frequency of each character.', 'Easy',
'def charFrequency(s):
    # Your code here
    pass',
'[{"input":"hello","expected":"h:1 e:1 l:2 o:1"},{"input":"aabbcc","expected":"a:2 b:2 c:2"}]',
'h:1 e:1 l:2 o:1', 10, 'Strings') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Check Anagram', 'Check if two strings are anagrams.', 'Easy',
'def isAnagram(s1, s2):
    # Your code here
    pass',
'[{"input":"listen silent","expected":"True"},{"input":"hello world","expected":"False"}]',
'True', 10, 'Strings') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Merge Two Arrays', 'Merge two arrays.', 'Easy',
'def mergeArrays(a, b):
    # Your code here
    pass',
'[{"input":"[1,2] [3,4]","expected":"[1,2,3,4]"},{"input":"[1] [2]","expected":"[1,2]"}]',
'[1,2,3,4]', 10, 'Arrays') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Remove Duplicates', 'Remove duplicate elements.', 'Easy',
'def removeDuplicates(nums):
    # Your code here
    pass',
'[{"input":"[1,2,2,3,3]","expected":"[1,2,3]"},{"input":"[1,1,1]","expected":"[1]"}]',
'[1,2,3]', 10, 'Arrays') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Find Index of Element', 'Find index of element in array.', 'Easy',
'def findIndex(nums, target):
    # Your code here
    pass',
'[{"input":"[1,2,3,4] 3","expected":"2"},{"input":"[5,10,15] 10","expected":"1"}]',
'2', 10, 'Arrays') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Count Occurrences', 'Count occurrences of element.', 'Easy',
'def countOccurrences(nums, target):
    # Your code here
    pass',
'[{"input":"[1,2,2,3] 2","expected":"2"},{"input":"[1,1,1,1] 1","expected":"4"}]',
'2', 10, 'Arrays') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Check Substring', 'Check if substring exists in string.', 'Easy',
'def isSubstring(s, sub):
    # Your code here
    pass',
'[{"input":"hello ll","expected":"True"},{"input":"world ol","expected":"True"},{"input":"test xyz","expected":"False"}]',
'True', 10, 'Strings') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Remove Character', 'Remove all occurrences of character.', 'Easy',
'def removeChar(s, ch):
    # Your code here
    pass',
'[{"input":"hello l","expected":"heo"},{"input":"aabbaa a","expected":"bb"}]',
'heo', 10, 'Strings') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Multiply All Elements', 'Multiply all elements in array.', 'Easy',
'def multiplyAll(nums):
    # Your code here
    pass',
'[{"input":"[1,2,3,4]","expected":"24"},{"input":"[2,3]","expected":"6"},{"input":"[5]","expected":"5"}]',
'24', 10, 'Arrays') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Find Average', 'Find average of array elements.', 'Easy',
'def findAverage(nums):
    # Your code here
    pass',
'[{"input":"[2,4,6,8]","expected":"5"},{"input":"[1,2,3]","expected":"2"},{"input":"[10]","expected":"10"}]',
'5', 10, 'Arrays') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Check Leap Year', 'Check if year is leap year.', 'Easy',
'def isLeapYear(year):
    # Your code here
    pass',
'[{"input":"2024","expected":"True"},{"input":"2000","expected":"True"},{"input":"1900","expected":"False"}]',
'True', 10, 'Logic') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('Power of Number', 'Calculate power of number.', 'Easy',
'def powerOf(base, exp):
    # Your code here
    pass',
'[{"input":"2 3","expected":"8"},{"input":"3 2","expected":"9"},{"input":"5 0","expected":"1"}]',
'8', 10, 'Math') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('GCD of Two Numbers', 'Find GCD of two numbers.', 'Easy',
'def findGCD(a, b):
    # Your code here
    pass',
'[{"input":"12 18","expected":"6"},{"input":"10 20","expected":"10"},{"input":"7 11","expected":"1"}]',
'6', 10, 'Math') ON CONFLICT DO NOTHING;

INSERT INTO problems (title, description, difficulty, starter_code, test_cases, expected_output, points, category) VALUES
('LCM of Two Numbers', 'Find LCM of two numbers.', 'Easy',
'def findLCM(a, b):
    # Your code here
    pass',
'[{"input":"12 18","expected":"36"},{"input":"5 10","expected":"10"},{"input":"7 11","expected":"77"}]',
'36', 10, 'Math') ON CONFLICT DO NOTHING;
