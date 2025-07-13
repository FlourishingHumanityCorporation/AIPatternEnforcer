import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const extractionType = formData.get("type") as string;
    const preferLocal = formData.get("preferLocal") === "true";

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Validate file type
    const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp"];


    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ error: "Unsupported file type" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "File too large (max 10MB)" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    let extractedText = "";
    let summary = "";
    let entities: any[] = [];
    let tables: any[] = [];

    // Extract text based on file type
    if (file.type === "text/plain") {
      extractedText = await file.text();
    } else if (file.type === "application/pdf") {
      try {
        const pdfParse = (await import("pdf-parse")).default;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const data = await pdfParse(buffer);
        extractedText = data.text;
      } catch (error) {
        logger.error("PDF parsing error:", error);
        extractedText = `[Error extracting PDF: ${error instanceof Error ? error.message : "Unknown error"}]`;
      }
    } else if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    {
      try {
        const mammoth = await import("mammoth");
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } catch (error) {
        logger.error("DOCX parsing error:", error);
        extractedText = `[Error extracting DOCX: ${error instanceof Error ? error.message : "Unknown error"}]`;
      }
    } else if (file.type.startsWith("image/")) {
      try {
        const { createWorker } = await import("tesseract.js");
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const worker = await createWorker("eng");
        const {
          data: { text }
        } = await worker.recognize(buffer);
        await worker.terminate();

        extractedText = text.trim();
      } catch (error) {
        logger.error("OCR error:", error);
        extractedText = `[Error extracting text from image: ${error instanceof Error ? error.message : "Unknown error"}]`;
      }
    }

    // If we have text, generate summary and extract entities using AI
    if (
    extractedText &&
    extractedText.length > 0 &&
    !extractedText.startsWith("[Error") &&
    !extractedText.startsWith("[PDF") &&
    !extractedText.startsWith("[DOCX") &&
    !extractedText.startsWith("[Image"))
    {
      try {
        // Generate summary
        const summaryPrompt = `Please provide a concise summary of the following text:\n\n${extractedText}`;
        const summaryResponse = await generateAIResponse(
          summaryPrompt,
          preferLocal
        );
        summary = summaryResponse.content;

        // Extract entities
        const entitiesPrompt = `Extract key entities (people, organizations, locations, dates, etc.) from the following text. Return as JSON array with "type" and "value" fields:\n\n${extractedText}`;
        const entitiesResponse = await generateAIResponse(
          entitiesPrompt,
          preferLocal
        );

        try {
          entities = JSON.parse(entitiesResponse.content);
        } catch (e) {
          // If parsing fails, create simple entities from the response
          entities = [{ type: "extracted", value: entitiesResponse.content }];
        }

        // Extract tables (basic implementation)
        const tablePattern = /\|[^|]+\|/g;
        const tableMatches = extractedText.match(tablePattern);
        if (tableMatches && tableMatches.length > 2) {
          tables = [
          {
            rows: tableMatches.slice(0, 5).map((row) => ({
              cells: row.
              split("|").
              filter((cell) => cell.trim()).
              map((cell) => cell.trim())
            }))
          }];

        }
      } catch (error) {
        logger.error("AI processing error:", error);
        summary = "Summary generation failed";
        entities = [];
      }
    }

    return new Response(
      JSON.stringify({
        filename: file.name,
        fileType: file.type,
        fileSize: file.size,
        text: extractedText,
        summary,
        entities,
        tables,
        extractionType,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    logger.error("Extract API error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Extraction failed"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

// Helper function to generate AI response
async function generateAIResponse(prompt: string, preferLocal: boolean) {
  // Try local first if preferred
  if (preferLocal) {
    try {
      const response = await fetch(
        `${process.env.OLLAMA_BASE_URL || "http://localhost:11434"}/api/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama2",
            prompt,
            stream: false
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        return { content: data.response };
      }
    } catch (error) {
      logger.error("Local model error:", error);
    }
  }

  // Fallback to OpenAI
  if (process.env.OPENAI_API_KEY) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500
      })
    });

    if (response.ok) {
      const data = await response.json();
      return { content: data.choices[0].message.content };
    }
  }

  throw new Error("No AI provider available");
}