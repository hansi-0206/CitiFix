import "../config/env.js";
import Groq from "groq-sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize the Groq SDK client exactly once at the top level
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const analyzeIssueWithAI = async (description, fileBuffer = null, mimeType = null) => {
  try {
    // Define prompt template inline to optimize reasoning and enforce dynamic values
    const promptTemplate = `You are an expert AI civic technician assisting municipal corporations in prioritizing local complaints.
Analyze the user-reported civic issue described below and the attached photo (if available) to estimate prioritizing metrics dynamically.

User Description: 
"{description}"

CRITICAL INSTRUCTIONS FOR IMAGE INSPECTION:
1. Carefully inspect the uploaded image. Estimate the severity and priority from visible evidence.
2. Do not reuse previous outputs or default template values. Generate fresh, independent values for every image.
3. Estimate the following variables from the image:
   - Size of damage
   - Visible affected area
   - Safety risk
   - Danger to pedestrians
   - Danger to vehicles
   - Urgency of resolution
   - Public impact
4. Compute the Priority Score (0–100) dynamically using this scale:
   - 0–20: Cosmetic issues (e.g., paint peeling, minor debris, aesthetic wear)
   - 21–40: Minor issues (e.g., small cracks, minor bench wear)
   - 41–60: Moderate issues (e.g., medium pothole on a side road, single light out)
   - 61–80: Serious issues (e.g., large pothole on a main street, pile of trash blocking a sidewalk)
   - 81–100: Critical emergencies (e.g., active water main burst flooding street, snapped sparking high voltage wires hanging in walkways)
   Choose a precise, logical score within these ranges based on the visual evidence.
5. Compute the Confidence Level (50–100) based on image clarity:
   - Blurry, low-resolution, dark, or obstructed images should receive a lower score (e.g., 50–65).
   - Partially visible or cropped images should receive a moderate score (e.g., 66–80).
   - Clear, high-resolution, well-lit, and well-framed images showing the full scale of the issue should receive a high score (e.g., 81–100).
   Choose the value based entirely on image quality.

You must strictly output a valid JSON block and absolutely nothing else. Do not write explanations, markdown syntax wrapper tags (like \`\`\`json), or notes. The JSON must match the following schema:
{
  "category": "Road Damage" | "Waste Management" | "Streetlight Failures" | "Water Supply" | "Public Facilities" | "Utility Failures",
  "severity": "Low" | "Medium" | "High" | "Critical",
  "priorityScore": number,
  "confidence": number,
  "recommendedAction": "string representing the immediate remediation action",
  "summary": "string representing a professional, formal, single-sentence summary of the incident and immediate hazard threat"
}

Rule:
- If category matches road potholes/cracks, use "Road Damage".
- If category matches garbage/litter/clogged drains, use "Waste Management".
- If category matches dark streets/broken bulbs, use "Streetlight Failures".
- If category is water pipe burst/leak/flooding, use "Water Supply".
- If category is broken park benches/fences/playgrounds, use "Public Facilities".
- If category is snapped high-voltage cables/short circuits/transformers, use "Utility Failures".
- Severity must match: Low, Medium, High, or Critical.`;

    // Inject description variable
    const promptText = promptTemplate.replace("{description}", description);

    // 2. Build messages payload using OpenAI/Groq compatible structure
    const userContent = [];
    userContent.push({
      type: "text",
      text: promptText,
    });

    if (fileBuffer && mimeType) {
      const base64Data = fileBuffer.toString("base64");
      userContent.push({
        type: "image_url",
        image_url: {
          url: `data:${mimeType};base64,${base64Data}`,
        },
      });
    }

    // 3. Call Groq completions API with meta-llama/llama-4-scout-17b-16e-instruct
    console.log("Calling Groq completions API with meta-llama/llama-4-scout-17b-16e-instruct...");
    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: userContent,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const responseText = response.choices[0]?.message?.content;
    console.log("Raw Groq Response during development:", responseText);

    if (!responseText) {
      throw new Error("Empty response received from Groq API");
    }

    // Clean up potential markdown formatting (```json ... ```) just in case
    let cleanJsonString = responseText.trim();
    if (cleanJsonString.startsWith("```")) {
      cleanJsonString = cleanJsonString.replace(/^```(json)?/, "").replace(/```$/, "").trim();
    }

    // Parse AI output
    const parsedData = JSON.parse(cleanJsonString);

    // Validate schema attributes
    if (
      parsedData.category &&
      parsedData.severity &&
      typeof parsedData.priorityScore === "number" &&
      typeof parsedData.confidence === "number" &&
      parsedData.recommendedAction &&
      parsedData.summary
    ) {
      return parsedData;
    }

    throw new Error("Parsed AI JSON does not conform to the expected schema");
  } catch (error) {
    console.error("Complete Groq AI Service Error:", error);
    throw error;
  }
};

// Fallback logic in case of network/key failures
const getFallbackAnalysis = (description) => {
  const desc = description.toLowerCase();
  let category = "Road Damage";
  let severity = "Medium";
  let priorityScore = 55;
  let confidence = 85;
  let recommendedAction = "Standard Road Maintenance Dispatch";
  let summary = "Road damage reported; repair recommended to avoid local traffic hazards.";

  if (desc.includes("garbage") || desc.includes("waste") || desc.includes("dump") || desc.includes("trash")) {
    category = "Waste Management";
    severity = desc.includes("vile") || desc.includes("hazardous") || desc.includes("foul") ? "High" : "Medium";
    priorityScore = severity === "High" ? 75 : 60;
    confidence = 90;
    recommendedAction = "Sanitation Clearance Crew Dispatch";
    summary = "Solid waste overflow creating unhygienic conditions. Garbage clearance required.";
  } else if (desc.includes("light") || desc.includes("street-light") || desc.includes("dark") || desc.includes("bulb")) {
    category = "Streetlight Failures";
    severity = desc.includes("accident") || desc.includes("crime") ? "High" : "Medium";
    priorityScore = severity === "High" ? 80 : 65;
    confidence = 92;
    recommendedAction = "Utility Grid Team Bulb Replacement";
    summary = "Broken streetlight array leading to dark pedestrian walkways. Fix lighting cables.";
  } else if (desc.includes("water") || desc.includes("leak") || desc.includes("pipe") || desc.includes("burst")) {
    category = "Water Supply";
    severity = desc.includes("flood") || desc.includes("burst") ? "Critical" : "High";
    priorityScore = severity === "Critical" ? 95 : 80;
    confidence = 94;
    recommendedAction = "Emergency Valve Isolation & Plumbing Repair";
    summary = "Subsurface pipeline damage causing active water waste and minor flooding. Valves check requested.";
  } else if (desc.includes("wire") || desc.includes("spark") || desc.includes("transformer") || desc.includes("power")) {
    category = "Utility Failures";
    severity = desc.includes("dangling") || desc.includes("spark") ? "Critical" : "High";
    priorityScore = severity === "Critical" ? 99 : 85;
    confidence = 96;
    recommendedAction = "Immediate Electrical Grid Shutdown & Rewiring";
    summary = "Snapped or sparking overhead power cable posing electric shock hazard. Immediate line isolation required.";
  } else if (desc.includes("park") || desc.includes("bench") || desc.includes("playground") || desc.includes("fence")) {
    category = "Public Facilities";
    severity = "Low";
    priorityScore = 40;
    confidence = 88;
    recommendedAction = "Generic Maintenance Workorder";
    summary = "Minor public facility furniture damage. Scheduled for generic maintenance cycle.";
  }

  return {
    category,
    severity,
    priorityScore,
    confidence,
    recommendedAction,
    summary,
  };
};
