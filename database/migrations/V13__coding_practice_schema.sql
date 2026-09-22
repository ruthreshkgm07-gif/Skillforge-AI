-- ==============================================================================
-- Flyway Migration V13: Coding Practice Platform Problems Schema & Seed Data
-- Database: PostgreSQL 16 / H2 compatible
-- Project: SkillForge AI
-- ==============================================================================

-- 1. Coding Problems Table
CREATE TABLE IF NOT EXISTS coding_problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic VARCHAR(100) NOT NULL, -- Arrays, Strings, Linked Lists, Recursion, Sorting, Trees, Graphs, Dynamic Programming, SQL Queries
    title VARCHAR(255) NOT NULL,
    difficulty VARCHAR(20) NOT NULL DEFAULT 'MEDIUM', -- EASY, MEDIUM, HARD
    description TEXT NOT NULL,
    constraints_text TEXT,
    sample_input TEXT,
    sample_output TEXT,
    starter_code_java TEXT,
    starter_code_python TEXT,
    starter_code_js TEXT,
    starter_code_cpp TEXT,
    test_cases_json TEXT, -- JSON array of [{ input, expectedOutput }]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_coding_problems_topic ON coding_problems(topic);
CREATE INDEX IF NOT EXISTS idx_coding_problems_difficulty ON coding_problems(difficulty);

-- 2. Student Coding Submissions Table
CREATE TABLE IF NOT EXISTS student_coding_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES coding_problems(id) ON DELETE CASCADE,
    language VARCHAR(50) NOT NULL,
    submitted_code TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PASSED', -- PASSED, FAILED, RUNTIME_ERROR
    test_cases_passed INT NOT NULL DEFAULT 0,
    total_test_cases INT NOT NULL DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_coding_sub_student ON student_coding_submissions(student_id);

-- ==============================================================================
-- Seed Data: Topic-Based Coding Practice Problems
-- ==============================================================================

-- 1. Arrays & Strings
INSERT INTO coding_problems (id, topic, title, difficulty, description, constraints_text, sample_input, sample_output, starter_code_python, starter_code_java, test_cases_json) VALUES
('e1000000-0000-0000-0000-000000000001', 'Arrays', 'Two Sum Target Index', 'EASY', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.', '2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9', 'nums = [2, 7, 11, 15], target = 9', '[0, 1]', 
'def two_sum(nums, target):\n    # Write your solution using a HashMap for O(N) lookup\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []',
'import java.util.HashMap;\nimport java.util.Map;\n\npublic class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int diff = target - nums[i];\n            if (map.containsKey(diff)) {\n                return new int[]{map.get(diff), i};\n            }\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}',
'[{"input": "[2,7,11,15], 9", "expectedOutput": "[0, 1]"}, {"input": "[3,2,4], 6", "expectedOutput": "[1, 2]"}]'),

('e1000000-0000-0000-0000-000000000002', 'Strings', 'Valid Anagram Check', 'EASY', 'Given two strings s and t, return true if t is an anagram of s, and false otherwise. An Anagram is a word formed by rearranging the letters of a different word.', '1 <= s.length, t.length <= 5 * 10^4', 's = "anagram", t = "nagaram"', 'true',
'def is_anagram(s: str, t: str) -> bool:\n    if len(s) != len(t): return False\n    counts = {}\n    for char in s:\n        counts[char] = counts.get(char, 0) + 1\n    for char in t:\n        if char not in counts or counts[char] == 0:\n            return False\n        counts[char] -= 1\n    return True',
'import java.util.Arrays;\n\npublic class Solution {\n    public boolean isAnagram(String s, String t) {\n        if (s.length() != t.length()) return false;\n        int[] count = new int[26];\n        for (int i = 0; i < s.length(); i++) {\n            count[s.charAt(i) - ''a'']++;\n            count[t.charAt(i) - ''a'']--;\n        }\n        for (int c : count) if (c != 0) return false;\n        return true;\n    }\n}',
'[{"input": "\"anagram\", \"nagaram\"", "expectedOutput": "true"}]'),

-- 2. Linked Lists
INSERT INTO coding_problems (id, topic, title, difficulty, description, constraints_text, sample_input, sample_output, starter_code_python, starter_code_java, test_cases_json) VALUES
('e1000000-0000-0000-0000-000000000010', 'Linked Lists', 'Reverse Singly Linked List', 'EASY', 'Given the head of a singly linked list, reverse the list, and return the reversed list.', '0 <= number of nodes <= 5000', 'head = [1, 2, 3, 4, 5]', '[5, 4, 3, 2, 1]',
'class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverse_list(head: ListNode) -> ListNode:\n    prev = None\n    curr = head\n    while curr:\n        next_temp = curr.next\n        curr.next = prev\n        prev = curr\n        curr = next_temp\n    return prev',
'public class Solution {\n    public ListNode reverseList(ListNode head) {\n        ListNode prev = null;\n        ListNode curr = head;\n        while (curr != null) {\n            ListNode nextTemp = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = nextTemp;\n        }\n        return prev;\n    }\n}',
'[{"input": "[1,2,3,4,5]", "expectedOutput": "[5,4,3,2,1]"}]'),

-- 3. Recursion & Dynamic Programming
INSERT INTO coding_problems (id, topic, title, difficulty, description, constraints_text, sample_input, sample_output, starter_code_python, starter_code_java, test_cases_json) VALUES
('e1000000-0000-0000-0000-000000000020', 'Dynamic Programming', 'Climbing Stairs DP', 'EASY', 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?', '1 <= n <= 45', 'n = 3', '3',
'def climb_stairs(n: int) -> int:\n    if n <= 2: return n\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    return b',
'public class Solution {\n    public int climbStairs(int n) {\n        if (n <= 2) return n;\n        int first = 1, second = 2;\n        for (int i = 3; i <= n; i++) {\n            int third = first + second;\n            first = second;\n            second = third;\n        }\n        return second;\n    }\n}',
'[{"input": "3", "expectedOutput": "3"}, {"input": "5", "expectedOutput": "8"}]'),

-- 4. SQL Queries
INSERT INTO coding_problems (id, topic, title, difficulty, description, constraints_text, sample_input, sample_output, starter_code_python, starter_code_java, test_cases_json) VALUES
('e1000000-0000-0000-0000-000000000030', 'SQL Queries', 'Second Highest Salary Query', 'MEDIUM', 'Write a SQL query to report the second highest salary from the Employee table. If there is no second highest salary, the query should report null.', 'Employee table contains id (INT) and salary (INT)', 'Employee = [[1, 100], [2, 200], [3, 300]]', '200',
'-- Write SQL Query\nSELECT MAX(salary) AS SecondHighestSalary \nFROM Employee \nWHERE salary < (SELECT MAX(salary) FROM Employee);',
'SELECT MAX(salary) AS SecondHighestSalary FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee);',
'[{"input": "Employee table with 100, 200, 300", "expectedOutput": "200"}]');
