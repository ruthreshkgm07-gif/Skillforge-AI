package com.skillforge.resume.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@Service
@Slf4j
public class DocumentParserService {

    private final Tika tika = new Tika();

    public String extractText(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded resume file cannot be empty");
        }

        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        String extractedText = "";

        try {
            if (filename.endsWith(".pdf")) {
                extractedText = extractPdfText(file.getInputStream());
            } else if (filename.endsWith(".docx") || filename.endsWith(".doc")) {
                extractedText = extractWordText(file.getInputStream());
            } else {
                log.info("Using Apache Tika fallback parser for file: {}", filename);
                extractedText = tika.parseToString(file.getInputStream());
            }
        } catch (Exception ex) {
            log.warn("Primary parser failed for file {}. Attempting Tika fallback. Error: {}", filename, ex.getMessage());
            try (InputStream is = file.getInputStream()) {
                extractedText = tika.parseToString(is);
            } catch (Exception fallbackEx) {
                log.error("Tika fallback parsing also failed for file {}: {}", filename, fallbackEx.getMessage());
                throw new RuntimeException("Could not extract text from uploaded resume file: " + fallbackEx.getMessage());
            }
        }

        if (extractedText == null || extractedText.trim().length() < 30) {
            log.warn("Primary text extraction produced fewer than 30 characters. Running Tika secondary fallback...");
            try (InputStream is = file.getInputStream()) {
                String tikaText = tika.parseToString(is);
                if (tikaText != null && tikaText.trim().length() >= 30) {
                    extractedText = tikaText;
                }
            } catch (Exception ignored) {}
        }

        String cleanText = extractedText != null ? extractedText.trim() : "";
        if (cleanText.length() < 30) {
            log.error("Extracted text for file {} failed validation. Character count: {}", filename, cleanText.length());
            throw new IllegalArgumentException(
                    "The uploaded document contains insufficient or unreadable text. Please upload a text-selectable PDF or Word document."
            );
        }

        log.info("Successfully extracted and validated {} characters from resume: {}", cleanText.length(), filename);
        return cleanText;
    }

    private String extractPdfText(InputStream inputStream) throws Exception {
        try (PDDocument document = org.apache.pdfbox.Loader.loadPDF(inputStream.readAllBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            log.info("Successfully extracted {} characters from PDF resume", text != null ? text.length() : 0);
            return text != null ? text : "";
        }
    }

    private String extractWordText(InputStream inputStream) throws Exception {
        try (XWPFDocument document = new XWPFDocument(inputStream);
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            String text = extractor.getText();
            log.info("Successfully extracted {} characters from Word resume", text != null ? text.length() : 0);
            return text != null ? text : "";
        }
    }
}
