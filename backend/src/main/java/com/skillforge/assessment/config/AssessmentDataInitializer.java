package com.skillforge.assessment.config;

import com.skillforge.assessment.entity.*;
import com.skillforge.assessment.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Component
@Slf4j
@RequiredArgsConstructor
public class AssessmentDataInitializer implements CommandLineRunner {

    private final TestRepository testRepository;
    private final QuestionRepository questionRepository;
    private final SuggestionConfigRepository suggestionConfigRepository;
    private final QuestionBankRepository questionBankRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (suggestionConfigRepository.count() == 0) {
            log.info("Initializing default suggestion mappings in database...");
            initSuggestions();
        }

        if (testRepository.count() == 0) {
            log.info("Initializing default Communication & MCQ tests in database...");
            initCommunicationTest();
            initMcqTest();
            log.info("Successfully seeded Communication & MCQ test data!");
        }

        if (questionBankRepository.count() == 0) {
            log.info("Initializing IndiaBix MCQ QuestionBank dataset...");
            initQuestionBankData();
            log.info("Successfully seeded QuestionBank dataset with Aptitude & Technical MCQs!");
        }
    }

    private void initQuestionBankData() {
        questionBankRepository.saveAll(List.<QuestionBank>of(
            // Quantitative Aptitude
            QuestionBank.builder().category("Aptitude").topic("Quantitative Aptitude").subtopic("Percentages")
                .difficulty("EASY").questionText("If A's salary is 25% more than B's salary, then by what percentage is B's salary less than A's?")
                .optionA("20%").optionB("25%").optionC("16.66%").optionD("30%").correctOption(0)
                .explanation("Formula: [r / (100 + r)] * 100 = [25 / 125] * 100 = 20%.").build(),
            QuestionBank.builder().category("Aptitude").topic("Quantitative Aptitude").subtopic("Profit & Loss")
                .difficulty("MEDIUM").questionText("A trader sells an item at a profit of 20%. If he had bought it at 10% less and sold it for $18 less, he would have gained 25%. Find the cost price.")
                .optionA("$400").optionB("$360").optionC("$450").optionD("$480").correctOption(0)
                .explanation("Let CP = 100x. SP1 = 120x. New CP = 90x. New SP = 90x * 1.25 = 112.5x. 120x - 112.5x = 7.5x = 18 => x = 2.4 => CP = 100 * 4 = $400.").build(),
            QuestionBank.builder().category("Aptitude").topic("Quantitative Aptitude").subtopic("Speed & Distance")
                .difficulty("EASY").questionText("A train 140 m long running at 60 km/hr crosses a platform in 30 seconds. What is the length of the platform?")
                .optionA("360 m").optionB("340 m").optionC("300 m").optionD("260 m").correctOption(0)
                .explanation("Speed = 60 * (5/18) = 50/3 m/s. Total distance = (50/3) * 30 = 500 m. Platform length = 500 - 140 = 360 m.").build(),

            // Logical Reasoning
            QuestionBank.builder().category("Aptitude").topic("Logical Reasoning").subtopic("Number Series")
                .difficulty("EASY").questionText("Find the missing term in the sequence: 4, 9, 25, 49, 121, ?")
                .optionA("144").optionB("169").optionC("196").optionD("225").correctOption(1)
                .explanation("The sequence consists of squares of prime numbers: 2^2, 3^2, 5^2, 7^2, 11^2. Next prime is 13, 13^2 = 169.").build(),
            QuestionBank.builder().category("Aptitude").topic("Logical Reasoning").subtopic("Coding-Decoding")
                .difficulty("MEDIUM").questionText("In a certain code, COMPUTER is written as RFUVQNPC. How is MEDICINE written in that code?")
                .optionA("EOJDEJFM").optionB("MFEJDJOE").optionC("EOJDJEFM").optionD("DJEOJMFE").correctOption(0)
                .explanation("Reverse the word and add +1 to each internal letter except endpoints. MEDICINE reversed is ENICIDEM -> E O J D E J F M.").build(),
            QuestionBank.builder().category("Aptitude").topic("Logical Reasoning").subtopic("Syllogism")
                .difficulty("EASY").questionText("Statements: All cats are dogs. All dogs are birds. Conclusion: (I) All cats are birds. (II) All birds are cats.")
                .optionA("Only I follows").optionB("Only II follows").optionC("Both follow").optionD("Neither follows").correctOption(0)
                .explanation("Cats -> Dogs -> Birds implies All cats are birds. All birds are cats is not necessarily true.").build(),

            // Verbal Ability
            QuestionBank.builder().category("Aptitude").topic("Verbal Ability").subtopic("Synonyms")
                .difficulty("EASY").questionText("Select the most appropriate synonym for the word 'PRAGMATIC':")
                .optionA("Theoretical").optionB("Practical").optionC("Idealistic").optionD("Arrogant").correctOption(1)
                .explanation("Pragmatic means dealing with things sensibly and realistically in a practical way.").build(),
            QuestionBank.builder().category("Aptitude").topic("Verbal Ability").subtopic("Sentence Correction")
                .difficulty("MEDIUM").questionText("Identify the correct sentence:")
                .optionA("Each of the candidates have submitted their resume.").optionB("Each of the candidates has submitted his or her resume.")
                .optionC("Each of candidates having submitted resumes.").optionD("Each candidates has submitted resume.").correctOption(1)
                .explanation("'Each' is singular and requires a singular verb 'has' and singular possessive pronoun.").build(),

            // Data Interpretation
            QuestionBank.builder().category("Aptitude").topic("Data Interpretation").subtopic("Bar Charts")
                .difficulty("MEDIUM").questionText("If Company X produced 120 units in Q1 and 150 units in Q2, what is the percentage increase in production?")
                .optionA("20%").optionB("25%").optionC("30%").optionD("15%").correctOption(1)
                .explanation("Percentage increase = [(150 - 120) / 120] * 100 = (30 / 120) * 100 = 25%.").build(),

            // Data Structures
            QuestionBank.builder().category("Technical").topic("Data Structures").subtopic("Trees")
                .difficulty("MEDIUM").questionText("What is the time complexity of searching for an element in a balanced Binary Search Tree (BST)?")
                .optionA("O(1)").optionB("O(N)").optionC("O(log N)").optionD("O(N log N)").correctOption(2)
                .explanation("A balanced BST halves the search space at each node comparison, yielding O(log N) time complexity.").build(),
            QuestionBank.builder().category("Technical").topic("Data Structures").subtopic("Arrays")
                .difficulty("EASY").questionText("Which data structure operates on a Last-In, First-Out (LIFO) principle?")
                .optionA("Queue").optionB("Stack").optionC("Linked List").optionD("Binary Tree").correctOption(1)
                .explanation("Stack uses LIFO order where the last element inserted is the first one removed.").build(),

            // Algorithms
            QuestionBank.builder().category("Technical").topic("Algorithms").subtopic("Sorting")
                .difficulty("MEDIUM").questionText("Which sorting algorithm has the best average-case time complexity of O(N log N) and is stable?")
                .optionA("QuickSort").optionB("MergeSort").optionC("HeapSort").optionD("SelectionSort").correctOption(1)
                .explanation("MergeSort runs in guaranteed O(N log N) time in all cases and preserves relative element order (stable).").build(),

            // Java
            QuestionBank.builder().category("Technical").topic("Java").subtopic("Spring Boot")
                .difficulty("EASY").questionText("Which Java keyword prevents a variable from being serialized?")
                .optionA("volatile").optionB("transient").optionC("static").optionD("final").correctOption(1)
                .explanation("The 'transient' keyword marks a member variable not to be serialized when written to byte stream.").build(),
            QuestionBank.builder().category("Technical").topic("Java").subtopic("Streams")
                .difficulty("MEDIUM").questionText("What does the Java Stream 'map' intermediate operation do?")
                .optionA("Filters elements based on predicate").optionB("Transforms each element using a given function")
                .optionC("Reduces stream to single scalar value").optionD("Sorts the elements in natural order").correctOption(1)
                .explanation("'map' applies a function to transform each element of a Stream into another value.").build(),

            // Python
            QuestionBank.builder().category("Technical").topic("Python").subtopic("Decorators")
                .difficulty("MEDIUM").questionText("What is the purpose of `@classmethod` decorator in Python?")
                .optionA("Binds a method to the instance `self`").optionB("Binds a method to the class `cls` as its first parameter")
                .optionC("Makes the method private and non-callable").optionD("Converts a function into an iterator generator").correctOption(1)
                .explanation("`@classmethod` passes the class object `cls` as the first implicit argument instead of instance `self`.").build(),

            // SQL
            QuestionBank.builder().category("Technical").topic("SQL").subtopic("JOINs")
                .difficulty("EASY").questionText("Which SQL JOIN returns all rows from the left table and matching rows from the right table?")
                .optionA("INNER JOIN").optionB("LEFT JOIN").optionC("RIGHT JOIN").optionD("FULL OUTER JOIN").correctOption(1)
                .explanation("LEFT JOIN (or LEFT OUTER JOIN) returns all records from the left table and matched records from right table.").build(),

            // React
            QuestionBank.builder().category("Technical").topic("React").subtopic("Hooks")
                .difficulty("MEDIUM").questionText("What will happen if you update React state directly without using the setter function (e.g. `state.count = 5`)?")
                .optionA("React re-renders component instantly").optionB("React will throw a runtime error")
                .optionC("State mutates in place but component fails to trigger re-render").optionD("State value resets to initial default").correctOption(2)
                .explanation("Direct state mutation alters object reference without notifying React scheduler, skipping component re-render.").build(),

            // Spring Boot
            QuestionBank.builder().category("Technical").topic("Spring Boot").subtopic("REST Controller")
                .difficulty("EASY").questionText("Which annotation combines `@Controller` and `@ResponseBody` in Spring Boot?")
                .optionA("@Service").optionB("@RestController").optionC("@Repository").optionD("@Configuration").correctOption(1)
                .explanation("@RestController is a convenience annotation that marks the class as a controller where every method returns a domain object directly serialized as HTTP JSON response.").build(),

            // OOP Concepts
            QuestionBank.builder().category("Technical").topic("OOP Concepts").subtopic("Polymorphism")
                .difficulty("EASY").questionText("Which object-oriented programming concept allows a class to have multiple methods with the same name but different parameter lists?")
                .optionA("Method Overriding").optionB("Method Overloading").optionC("Encapsulation").optionD("Abstraction").correctOption(1)
                .explanation("Method Overloading is compile-time polymorphism where methods share the same name but differ in parameter count or types.").build(),

            // DBMS
            QuestionBank.builder().category("Technical").topic("DBMS").subtopic("ACID Properties")
                .difficulty("MEDIUM").questionText("In relational database transactions, what does the 'I' in ACID stand for?")
                .optionA("Integrity").optionB("Isolation").optionC("Indexing").optionD("Idempotency").correctOption(1)
                .explanation("Isolation ensures that concurrent transactions execute without interfering with one another's intermediate states.").build(),

            // Operating Systems
            QuestionBank.builder().category("Technical").topic("Operating Systems").subtopic("Deadlocks")
                .difficulty("MEDIUM").questionText("Which of the following is NOT one of Coffman's four necessary conditions for a deadlock to occur?")
                .optionA("Mutual Exclusion").optionB("Hold and Wait").optionC("Preemption").optionD("Circular Wait").correctOption(2)
                .explanation("The four conditions are Mutual Exclusion, Hold & Wait, NO Preemption, and Circular Wait. Preemption breaks deadlocks.").build(),

            // Computer Networks
            QuestionBank.builder().category("Technical").topic("Computer Networks").subtopic("OSI Model")
                .difficulty("EASY").questionText("At which layer of the OSI model does the HTTP/HTTPS protocol operate?")
                .optionA("Transport Layer").optionB("Network Layer").optionC("Application Layer").optionD("Session Layer").correctOption(2)
                .explanation("HTTP, HTTPS, FTP, SMTP, and DNS operate at Layer 7 (Application Layer) of the OSI model.").build(),

            // JavaScript
            QuestionBank.builder().category("Technical").topic("JavaScript").subtopic("Event Loop")
                .difficulty("MEDIUM").questionText("Which queue takes priority in the JavaScript Event Loop engine?")
                .optionA("Macrotask / Task Queue (setTimeout)").optionB("Microtask Queue (Promise.then)").optionC("Animation Frame Queue").optionD("IO Callback Queue").correctOption(1)
                .explanation("Microtask queue (Promises, queueMicrotask) is completely drained before processing the next Macrotask.").build(),

            // HR/Behavioral
            QuestionBank.builder().category("General").topic("HR/Behavioral MCQs").subtopic("STAR Method")
                .difficulty("EASY").questionText("What does the acronym STAR stand for in behavioral interview methodology?")
                .optionA("Situation, Task, Action, Result").optionB("Skills, Training, Ability, Review")
                .optionC("Speech, Strategy, Technique, Assessment").optionD("Solution, Target, Analysis, Reaction").correctOption(0)
                .explanation("STAR technique structures responses by describing Situation, Task required, Action taken, and Result achieved.").build()
        ));
    }


    private void initSuggestions() {
        suggestionConfigRepository.saveAll(List.of(
            SuggestionConfig.builder()
                .testType("COMMUNICATION")
                .skillCategory("Grammar")
                .thresholdPercentage(60.0)
                .suggestionText("Focus on subject-verb agreement and complex tense usage. Practice daily grammar drills on tense consistency.")
                .resourceLink("https://grammarly.com/blog/category/handbook")
                .build(),
            SuggestionConfig.builder()
                .testType("COMMUNICATION")
                .skillCategory("Vocabulary")
                .thresholdPercentage(60.0)
                .suggestionText("Expand your professional technical vocabulary. Learn 5 new context words daily and practice using them in sentences.")
                .resourceLink("https://vocabulary.com/lists")
                .build(),
            SuggestionConfig.builder()
                .testType("COMMUNICATION")
                .skillCategory("Fluency")
                .thresholdPercentage(60.0)
                .suggestionText("Work on sentence linking, transition words, and pacing. Try recording 2-minute spontaneous speeches.")
                .resourceLink("https://bbc.co.uk/learningenglish")
                .build(),
            SuggestionConfig.builder()
                .testType("COMMUNICATION")
                .skillCategory("Comprehension")
                .thresholdPercentage(60.0)
                .suggestionText("Practice active reading and main-idea extraction from complex tech blogs and documentation.")
                .resourceLink("https://medium.com/topic/technology")
                .build(),
            SuggestionConfig.builder()
                .testType("COMMUNICATION")
                .skillCategory("Pronunciation")
                .thresholdPercentage(60.0)
                .suggestionText("Practice stress and intonation patterns for common technical jargon. Listen and shadow native audio clips.")
                .resourceLink("https://youglish.com")
                .build(),
            SuggestionConfig.builder()
                .testType("MCQ")
                .skillCategory("Java")
                .thresholdPercentage(60.0)
                .suggestionText("Review Java 21 features, Stream API, Concurrency, and Memory Management fundamentals.")
                .resourceLink("https://docs.oracle.com/en/java/javase/21")
                .build(),
            SuggestionConfig.builder()
                .testType("MCQ")
                .skillCategory("React")
                .thresholdPercentage(60.0)
                .suggestionText("Deep dive into React Hooks lifecycle, state management, memoization, and component re-rendering optimization.")
                .resourceLink("https://react.dev/learn")
                .build(),
            SuggestionConfig.builder()
                .testType("MCQ")
                .skillCategory("SQL")
                .thresholdPercentage(60.0)
                .suggestionText("Master SQL window functions, indexing strategies, JOIN optimization, and query execution plans.")
                .resourceLink("https://postgresqltutorial.com")
                .build(),
            SuggestionConfig.builder()
                .testType("MCQ")
                .skillCategory("Data Structures")
                .thresholdPercentage(60.0)
                .suggestionText("Practice time/space complexity analysis (Big O), trees, graphs, dynamic programming, and binary search.")
                .resourceLink("https://leetcode.com/explore")
                .build()
        ));
    }

    private void initCommunicationTest() {
        Test commTest = Test.builder()
                .title("Professional Workplace Communication Assessment")
                .description("Comprehensive assessment evaluating professional grammar, tech vocabulary, sentence fluency, listening/reading comprehension, and pronunciation rules.")
                .type("COMMUNICATION")
                .moduleId("COMM_101")
                .durationMinutes(20)
                .passingScore(60)
                .isActive(true)
                .build();
        commTest = testRepository.save(commTest);

        // Q1: Grammar
        Question q1 = Question.builder()
                .test(commTest)
                .questionText("Identify the sentence with correct subject-verb agreement in a technical report context:")
                .type("MCQ")
                .skillCategory("Grammar")
                .difficulty("EASY")
                .points(10)
                .build();
        q1.setOptions(List.of(
                QuestionOption.builder().question(q1).optionText("Neither the server logs nor the database error report show any anomalies.").isCorrect(true).explanation("When using neither/nor, verb agrees with subject.").build(),
                QuestionOption.builder().question(q1).optionText("Neither the server logs nor the database error report shows any anomalies.").isCorrect(false).explanation("Incorrect agreement.").build(),
                QuestionOption.builder().question(q1).optionText("Each of the microservices were failing during stress testing.").isCorrect(false).explanation("Each is singular.").build(),
                QuestionOption.builder().question(q1).optionText("The group of developers have decided to refactor the module.").isCorrect(false).explanation("Group takes singular.").build()
        ));
        questionRepository.save(q1);

        // Q2: Vocabulary
        Question q2 = Question.builder()
                .test(commTest)
                .questionText("What is the most accurate synonym for 'idempotent' in software architecture communication?")
                .type("MCQ")
                .skillCategory("Vocabulary")
                .difficulty("MEDIUM")
                .points(10)
                .build();
        q2.setOptions(List.of(
                QuestionOption.builder().question(q2).optionText("Producing the same result regardless of how many times an operation is executed").isCorrect(true).explanation("Idempotency produces identical results.").build(),
                QuestionOption.builder().question(q2).optionText("Executing tasks asynchronously without blocking the main process thread").isCorrect(false).explanation("Asynchronous execution.").build(),
                QuestionOption.builder().question(q2).optionText("Automatically scaling database connections under high load").isCorrect(false).explanation("Auto-scaling.").build(),
                QuestionOption.builder().question(q2).optionText("Encrypting sensitive payloads during data transmission").isCorrect(false).explanation("Transport encryption.").build()
        ));
        questionRepository.save(q2);

        // Q3: Fluency
        Question q3 = Question.builder()
                .test(commTest)
                .questionText("Select the best cohesive transition word to complete: 'The deployment failed due to network latency; ______, we initiated the automated rollback procedure immediately.'")
                .type("MCQ")
                .skillCategory("Fluency")
                .difficulty("MEDIUM")
                .points(10)
                .build();
        q3.setOptions(List.of(
                QuestionOption.builder().question(q3).optionText("consequently").isCorrect(true).explanation("Connects cause to effect.").build(),
                QuestionOption.builder().question(q3).optionText("nevertheless").isCorrect(false).explanation("Used for contrast.").build(),
                QuestionOption.builder().question(q3).optionText("on the other hand").isCorrect(false).explanation("Presents opposing points.").build(),
                QuestionOption.builder().question(q3).optionText("in addition").isCorrect(false).explanation("Additive transition.").build()
        ));
        questionRepository.save(q3);

        // Q4: Comprehension
        Question q4 = Question.builder()
                .test(commTest)
                .questionText("Passage: 'Micro-frontend architecture decomposes a monolithic frontend into smaller, semi-independent web applications that can be built and deployed by separate teams.' What is the primary takeaway of micro-frontends according to this statement?")
                .type("MCQ")
                .skillCategory("Comprehension")
                .difficulty("EASY")
                .points(10)
                .build();
        q4.setOptions(List.of(
                QuestionOption.builder().question(q4).optionText("It enables autonomous team ownership and independent deployment of UI slices.").isCorrect(true).explanation("Enables independent deployment by separate teams.").build(),
                QuestionOption.builder().question(q4).optionText("It completely eliminates backend microservices requirement.").isCorrect(false).explanation("Irrelevant.").build(),
                QuestionOption.builder().question(q4).optionText("It forces all developers to write code in a single repository.").isCorrect(false).explanation("Incorrect.").build(),
                QuestionOption.builder().question(q4).optionText("It improves database indexing speed.").isCorrect(false).explanation("Irrelevant.").build()
        ));
        questionRepository.save(q4);

        // Q5: Pronunciation
        Question q5 = Question.builder()
                .test(commTest)
                .questionText("Which syllable carries the primary stress in the word 'architecture'?")
                .type("MCQ")
                .skillCategory("Pronunciation")
                .difficulty("EASY")
                .points(10)
                .build();
        q5.setOptions(List.of(
                QuestionOption.builder().question(q5).optionText("First syllable (AR-chi-tec-ture)").isCorrect(true).explanation("Primary stress is on the first syllable.").build(),
                QuestionOption.builder().question(q5).optionText("Second syllable (ar-CHI-tec-ture)").isCorrect(false).explanation("Incorrect stress.").build(),
                QuestionOption.builder().question(q5).optionText("Third syllable (ar-chi-TEC-ture)").isCorrect(false).explanation("Incorrect stress.").build(),
                QuestionOption.builder().question(q5).optionText("Fourth syllable (ar-chi-tec-TURE)").isCorrect(false).explanation("Incorrect stress.").build()
        ));
        questionRepository.save(q5);
    }

    private void initMcqTest() {
        Test mcqTest = Test.builder()
                .title("Full-Stack Engineering & Core CS Practice Test")
                .description("Timed multiple-choice practice test covering Java Spring Boot, React Architecture, SQL Queries, and Data Structures.")
                .type("MCQ")
                .moduleId("FS_201")
                .durationMinutes(15)
                .passingScore(60)
                .isActive(true)
                .build();
        mcqTest = testRepository.save(mcqTest);

        // Q1: Java
        Question q1 = Question.builder()
                .test(mcqTest)
                .questionText("What is the default bean scope in Spring Framework?")
                .type("MCQ")
                .skillCategory("Java")
                .difficulty("EASY")
                .points(10)
                .build();
        q1.setOptions(List.of(
                QuestionOption.builder().question(q1).optionText("singleton").isCorrect(true).explanation("Singleton is the default scope.").build(),
                QuestionOption.builder().question(q1).optionText("prototype").isCorrect(false).explanation("Creates new instance on every request.").build(),
                QuestionOption.builder().question(q1).optionText("request").isCorrect(false).explanation("Scoped to HTTP request.").build(),
                QuestionOption.builder().question(q1).optionText("session").isCorrect(false).explanation("Scoped to HTTP session.").build()
        ));
        questionRepository.save(q1);

        // Q2: React
        Question q2 = Question.builder()
                .test(mcqTest)
                .questionText("Which hook should be used to memoize expensive calculation results between re-renders?")
                .type("MCQ")
                .skillCategory("React")
                .difficulty("MEDIUM")
                .points(10)
                .build();
        q2.setOptions(List.of(
                QuestionOption.builder().question(q2).optionText("useMemo").isCorrect(true).explanation("useMemo caches calculation results.").build(),
                QuestionOption.builder().question(q2).optionText("useCallback").isCorrect(false).explanation("useCallback caches function definitions.").build(),
                QuestionOption.builder().question(q2).optionText("useEffect").isCorrect(false).explanation("useEffect handles side effects.").build(),
                QuestionOption.builder().question(q2).optionText("useRef").isCorrect(false).explanation("useRef stores mutable ref values.").build()
        ));
        questionRepository.save(q2);

        // Q3: SQL
        Question q3 = Question.builder()
                .test(mcqTest)
                .questionText("Which SQL clause is used to filter aggregate records after GROUP BY?")
                .type("MCQ")
                .skillCategory("SQL")
                .difficulty("EASY")
                .points(10)
                .build();
        q3.setOptions(List.of(
                QuestionOption.builder().question(q3).optionText("HAVING").isCorrect(true).explanation("HAVING filters aggregated records.").build(),
                QuestionOption.builder().question(q3).optionText("WHERE").isCorrect(false).explanation("WHERE filters rows before aggregation.").build(),
                QuestionOption.builder().question(q3).optionText("ORDER BY").isCorrect(false).explanation("ORDER BY sorts output.").build(),
                QuestionOption.builder().question(q3).optionText("LIMIT").isCorrect(false).explanation("LIMIT restricts row counts.").build()
        ));
        questionRepository.save(q3);

        // Q4: Data Structures
        Question q4 = Question.builder()
                .test(mcqTest)
                .questionText("What is the worst-case time complexity of QuickSort?")
                .type("MCQ")
                .skillCategory("Data Structures")
                .difficulty("HARD")
                .points(10)
                .build();
        q4.setOptions(List.of(
                QuestionOption.builder().question(q4).optionText("O(n^2)").isCorrect(true).explanation("Worst case is quadratic O(n^2).").build(),
                QuestionOption.builder().question(q4).optionText("O(n log n)").isCorrect(false).explanation("O(n log n) is average case.").build(),
                QuestionOption.builder().question(q4).optionText("O(n)").isCorrect(false).explanation("Linear time.").build(),
                QuestionOption.builder().question(q4).optionText("O(1)").isCorrect(false).explanation("Constant time.").build()
        ));
        questionRepository.save(q4);
    }
}
