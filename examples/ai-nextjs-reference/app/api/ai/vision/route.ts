import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const formData = await req.formData();
    const image = formData.get("image") as File;
    const imageUrl = formData.get("imageUrl") as string;
    const prompt = formData.get("prompt") as string;
    const preferLocal = formData.get("preferLocal") === "true";

    if (!image && !imageUrl) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!prompt) {
      return new Response(JSON.stringify({ error: "No prompt provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    let imageData: string | null = null;
    let imageType: string | null = null;

    // Process image file if provided
    if (image) {
      // Validate image type
      const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/webp"];

      if (!allowedTypes.includes(image.type)) {
        return new Response(
          JSON.stringify({ error: "Unsupported image type" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" }
          }
        );
      }

      // Validate file size (5MB limit for images)
      if (image.size > 5 * 1024 * 1024) {
        return new Response(
          JSON.stringify({ error: "Image too large (max 5MB)" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" }
          }
        );
      }

      // Convert to base64
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      imageData = buffer.toString("base64");
      imageType = image.type;
    }

    let analysisResult = "";
    let provider = "LOCAL";

    // Try local vision model first if preferred (using llava or similar)
    if (preferLocal && imageData) {
      try {
        const response = await fetch(
          `${process.env.OLLAMA_BASE_URL || "http://localhost:11434"}/api/generate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "llava", // Vision model in Ollama
              prompt,
              images: [imageData],
              stream: false
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          analysisResult = data.response;
          provider = "LOCAL";
        } else {
          throw new Error("Local vision model not available");
        }
      } catch (error) {
        logger.error("Local vision model error:", error);

        // Fallback to OpenAI Vision
        if (process.env.OPENAI_API_KEY && imageData) {
          try {
            const openaiResponse = await fetch(
              "https://api.openai.com/v1/chat/completions",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                  model: "gpt-4-vision-preview",
                  messages: [
                  {
                    role: "user",
                    content: [
                    { type: "text", text: prompt },
                    {
                      type: "image_url",
                      image_url: {
                        url:
                        imageUrl ||
                        `data:${imageType};base64,${imageData}`
                      }
                    }]

                  }],

                  max_tokens: 500
                })
              }
            );

            if (openaiResponse.ok) {
              const data = await openaiResponse.json();
              analysisResult = data.choices[0].message.content;
              provider = "OPENAI";
            } else {
              throw new Error("OpenAI Vision API failed");
            }
          } catch (openaiError) {
            logger.error("OpenAI Vision error:", openaiError);
            throw new Error("Vision analysis failed");
          }
        } else {
          throw new Error("No vision API available");
        }
      }
    } else {
      // Use OpenAI Vision directly
      if (process.env.OPENAI_API_KEY) {
        try {
          const openaiResponse = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
              },
              body: JSON.stringify({
                model: "gpt-4-vision-preview",
                messages: [
                {
                  role: "user",
                  content: [
                  { type: "text", text: prompt },
                  {
                    type: "image_url",
                    image_url: {
                      url:
                      imageUrl || `data:${imageType};base64,${imageData}`
                    }
                  }]

                }],

                max_tokens: 500
              })
            }
          );

          if (openaiResponse.ok) {
            const data = await openaiResponse.json();
            analysisResult = data.choices[0].message.content;
            provider = "OPENAI";
          } else {
            throw new Error("OpenAI Vision API failed");
          }
        } catch (error) {
          logger.error("OpenAI Vision error:", error);
          throw new Error("Vision analysis failed");
        }
      } else {
        throw new Error("No OpenAI API key configured");
      }
    }

    return new Response(
      JSON.stringify({
        analysis: analysisResult,
        prompt,
        provider,
        imageInfo: image ?
        {
          filename: image.name,
          size: image.size,
          type: image.type
        } :
        { url: imageUrl },
        timestamp: new Date().toISOString()
      }),
      {
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    logger.error("Vision API error:", error);
    return new Response(
      JSON.stringify({
        error:
        error instanceof Error ? error.message : "Vision analysis failed"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}