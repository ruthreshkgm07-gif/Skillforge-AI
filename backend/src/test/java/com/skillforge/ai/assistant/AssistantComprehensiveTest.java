package com.skillforge.ai.assistant;

import com.skillforge.common.service.LlmService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

import static org.junit.jupiter.api.Assertions.*;

public class AssistantComprehensiveTest {

    private LlmService llmService;

    @BeforeEach
    void setUp() {
        llmService = new LlmService();
    }

    @Test
    @DisplayName("Verify that 18 varied questions (in-scope, out-of-scope, short, long, follow-up, misspelled) all receive valid responses")
    void testEighteenVariedQuestions() {
        Map<String, String> testQuestions = new LinkedHashMap<>();

        // In-scope Platform Questions
        testQuestions.put("1. In-Scope: Resume ATS", "How does the Resume Analyzer calculate my ATS score?");
        testQuestions.put("2. In-Scope: MCQ Practice", "How can I practice technical MCQ tests on SkillForge?");
        testQuestions.put("3. In-Scope: Coding Sandbox", "What features does the coding practice platform have?");
        testQuestions.put("4. In-Scope: Mock Interview", "How do voice mock interviews work and what are the radar scores?");
        testQuestions.put("5. In-Scope: Placement Engine", "How does the placement prediction engine estimate my salary package?");

        // Short Questions & Greetings
        testQuestions.put("6. Short: Greeting", "Hi");
        testQuestions.put("7. Short: Help Inquiry", "Help");

        // Misspelled Questions (Typos)
        testQuestions.put("8. Typo: Resumee ATS", "How to increse my resumee ATS scor?");
        testQuestions.put("9. Typo: Tech Intrview", "Tips for my upcoming tech intrview drill");
        testQuestions.put("10. Typo: Binnary Serch", "How does binnary serch work?");

        // General Technical & CS Questions
        testQuestions.put("11. General: Linked List", "Can you explain how to reverse a linked list in Python?");
        testQuestions.put("12. General: REST vs GraphQL", "What is the difference between REST and GraphQL?");
        testQuestions.put("13. General: OOP Polymorphism", "What is polymorphism and how is it used in Java?");
        testQuestions.put("14. System Design: Redis Caching", "How does Redis cache-aside pattern work?");

        // Behavioral & Career Guidance
        testQuestions.put("15. Behavioral: STAR Method", "How should I structure my answer using the STAR method?");

        // Follow-Up Question
        testQuestions.put("16. Follow-Up: Code Example", "Can you give me a code example of that?");

        // Out-of-Scope / Casual Conversational
        testQuestions.put("17. Casual: Joke", "Tell me a programming joke");

        // Long Complex Multi-Topic Question
        testQuestions.put("18. Long: Placement Roadmap", 
            "I am a 3rd year computer science student preparing for campus recruitment drives. " +
            "What step-by-step roadmap should I follow across data structures, system design, " +
            "and resume optimization to get placed as a software engineer?");

        int passed = 0;
        System.out.println("================================================================================");
        System.out.println("RUNNING COMPREHENSIVE AI ASSISTANT TEST SUITE (18 QUESTIONS)");
        System.out.println("================================================================================");

        for (Map.Entry<String, String> entry : testQuestions.entrySet()) {
            String category = entry.getKey();
            String question = entry.getValue();

            List<LlmService.ChatMessage> messages = List.of(
                    new LlmService.ChatMessage("system", "You are SkillForge AI Assistant, an expert dual-role technical, study, and career mentor."),
                    new LlmService.ChatMessage("user", question)
            );

            // Execute via fallback generator (guaranteed offline & resilience path)
            String reply = llmService.generateFallbackResponse(messages);

            // Verifications
            assertNotNull(reply, "Reply must not be null for: " + category);
            assertFalse(reply.isBlank(), "Reply must not be blank for: " + category);
            assertTrue(reply.length() > 50, "Reply must be substantive (>50 chars) for: " + category);

            passed++;
            System.out.println("\n[PASSED " + passed + "/18] " + category);
            System.out.println("Question: " + question);
            System.out.println("Response Preview: " + (reply.length() > 150 ? reply.substring(0, 147) + "..." : reply));
        }

        System.out.println("\n================================================================================");
        System.out.println("ALL 18 COMPREHENSIVE AI ASSISTANT TESTS PASSED SUCCESSFULLY (" + passed + "/18)");
        System.out.println("================================================================================");
        assertEquals(18, passed);
    }
}
