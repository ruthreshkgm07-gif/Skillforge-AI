package com.skillforge.resume.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;

import static org.junit.jupiter.api.Assertions.*;

class DocumentParserServiceTest {

    private DocumentParserService documentParserService;

    @BeforeEach
    void setUp() {
        documentParserService = new DocumentParserService();
    }

    @Test
    @DisplayName("Should extract text from PDF document using Apache PDFBox")
    void extractTextFromPdf_Success() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);
            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 12);
                contentStream.newLineAtOffset(100, 700);
                contentStream.showText("Alex Johnson - Senior Full Stack Java Engineer");
                contentStream.endText();
            }
            document.save(baos);
        }

        MockMultipartFile pdfFile = new MockMultipartFile(
                "file",
                "resume.pdf",
                "application/pdf",
                baos.toByteArray()
        );

        String extractedText = documentParserService.extractText(pdfFile);

        assertNotNull(extractedText);
        assertTrue(extractedText.contains("Alex Johnson"));
        assertTrue(extractedText.contains("Full Stack Java Engineer"));
    }
}
