import "../config/env.js";
import Groq from "groq-sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to get or initialize Groq SDK client safely without crashing at module load
const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn("[WARN] GROQ_API_KEY environment variable is not defined. Falling back to heuristic analysis.");
    return null;
  }
  return new Groq({ apiKey });
};

export const analyzeIssueWithAI = async (description, fileBuffer = null, mimeType = null) => {
  try {
    // Define prompt template enforcing visual relevance check as step 1
    const promptTemplate = `You are an expert AI civic technician assisting municipal corporations in analyzing and prioritizing citizen reports.
Analyze the user-reported civic issue and the attached image (if provided) to classify the issue and evaluate its validity.

User Description: 
"{description}"

CRITICAL STEP 1 - VISUAL RELEVANCE & CIVIC VALIDITY ASSESSMENT:
Inspect the attached image carefully:
A. The image MUST show genuine, recognizable visual evidence of a public/civic infrastructure defect, municipal hazard, or community maintenance problem.
   VALID CIVIC ISSUES include visible evidence of:
   - Road & Sidewalk Damage: Potholes, broken asphalt, severe road cracks, damaged/collapsed pavement or sidewalks.
   - Waste Management: Overflowing trash bins, illegal garbage dumps, street litter accumulation, clogged roadside drains.
   - Streetlight Failures: Broken/dark streetlights, hanging lamps, damaged light poles.
   - Water Supply: Burst municipal water pipes, active gushing leaks, flooded roadways from pipe bursts.
   - Public Facilities: Damaged park benches, broken public playground equipment, broken fences/railings in public parks.
   - Utility Failures: Snapped/sparking overhead high-voltage power cables, dangling wires over walkways, damaged electrical transformers.
   *NOTE*: If a person or bystander is visible in the photo (e.g., pointing to or standing next to a pothole/damage), the report is STILL VALID as long as the civic defect is visible.

B. REJECT UNRELATED / INVALID IMAGES:
   If the image primarily shows any of the following with NO clear civic infrastructure defect:
   - Selfies, personal portraits, human faces, fashion/clothing shots
   - Memes, cartoon characters, digital art, software/app screenshots
   - Food, meals, beverages, restaurant dishes
   - Pets, domestic or wild animals
   - Home interiors, private room furniture, indoor appliances
   - Ordinary landscapes/nature without public municipal damage
   - Documents, text receipts, product photos, unrelated objects
   Then you MUST mark "isValidCivicIssue": false, "category": "Invalid", "severity": "N/A", "priorityScore": 0, "confidence": 90, "recommendedAction": "Upload a clear photo showing a civic infrastructure problem such as a pothole, garbage overflow, damaged streetlight, water leak, or blocked drain.", "summary": "The uploaded image does not appear to show a reportable civic infrastructure issue."

CRITICAL STEP 2 - STRICT RULES AGAINST FALSE CLASSIFICATION:
- NEVER classify an image as a civic category (such as "Road Damage" or "Waste Management") solely because the user text says "pothole" or "garbage". The image MUST provide visual evidence.
- If the image is unrelated (e.g., a selfie, face, pet, meme, food, or screenshot), you MUST set "isValidCivicIssue": false and "category": "Invalid", even if the user text claims there is a pothole.

CRITICAL STEP 3 - METRICS FOR VALID CIVIC ISSUES (when isValidCivicIssue is true):
1. Compute Priority Score (0–100):
   - 0–20: Cosmetic issues (e.g., paint peeling, minor debris)
   - 21–40: Minor issues (e.g., small cracks, minor bench wear)
   - 41–60: Moderate issues (e.g., medium pothole on a side road, single light out)
   - 61–80: Serious issues (e.g., large pothole on a main street, pile of trash blocking a sidewalk)
   - 81–100: Critical emergencies (e.g., active water main burst flooding street, snapped sparking high voltage wires hanging in walkways)
2. Compute Confidence Level (50–100) based on visual clarity and certainty.
3. Category must strictly be one of: "Road Damage", "Waste Management", "Streetlight Failures", "Water Supply", "Public Facilities", "Utility Failures".
4. Severity must strictly be one of: "Low", "Medium", "High", "Critical".

You must strictly output a valid JSON block and absolutely nothing else. Do not write markdown tags or extra explanations. The JSON must match the schema:
{
  "isValidCivicIssue": true | false,
  "category": "Road Damage" | "Waste Management" | "Streetlight Failures" | "Water Supply" | "Public Facilities" | "Utility Failures" | "Invalid",
  "severity": "Low" | "Medium" | "High" | "Critical" | "N/A",
  "priorityScore": number,
  "confidence": number,
  "recommendedAction": "string",
  "summary": "string"
}`;

    // 2. Build prompt content (multimodal if image buffer is provided)
    const userPrompt = description && description.trim().length > 0 
      ? description 
      : "Civic incident report with attached photographic evidence showing local infrastructure damage.";
    const promptText = promptTemplate.replace("{description}", userPrompt);

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

    // 3. Call Groq completions API with vision model (qwen/qwen3.6-27b) or fallback
    const groq = getGroqClient();
    if (!groq) {
      return getFallbackAnalysis(description || "");
    }

    const visionModel = process.env.GROQ_VISION_MODEL || "qwen/qwen3.6-27b";
    console.log(`Calling Groq completions API with vision model (${visionModel})...`);
    let responseText = null;

    try {
      const response = await groq.chat.completions.create({
        model: visionModel,
        messages: [
          {
            role: "user",
            content: userContent,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });
      responseText = response.choices[0]?.message?.content;
    } catch (visionError) {
      console.warn(`Vision model (${visionModel}) error: ${visionError.message}. Attempting text model fallback...`);
      try {
        const textFallbackResponse = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content: promptText,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
        });
        responseText = textFallbackResponse.choices[0]?.message?.content;
      } catch (textError) {
        console.warn("Text fallback (llama-3.3-70b-versatile) failed, attempting llama-3.1-8b-instant:", textError.message);
        const fastFallbackResponse = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "user",
              content: promptText,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
        });
        responseText = fastFallbackResponse.choices[0]?.message?.content;
      }
    }

    console.log("Raw Groq Response:", responseText);

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

    // If marked invalid by AI
    if (parsedData.isValidCivicIssue === false || parsedData.category?.toLowerCase() === "invalid") {
      return {
        isValidCivicIssue: false,
        category: "Invalid",
        severity: "N/A",
        priorityScore: 0,
        confidence: typeof parsedData.confidence === "number" ? Math.min(100, Math.max(0, Math.round(parsedData.confidence))) : 90,
        recommendedAction: "Upload a clear photo showing a civic infrastructure problem such as a pothole, garbage overflow, damaged streetlight, water leak, or blocked drain.",
        summary: parsedData.summary || "The uploaded image does not appear to show a reportable civic infrastructure issue."
      };
    }

    // Validate and sanitize valid schema attributes
    const validCategories = [
      "Road Damage",
      "Waste Management",
      "Streetlight Failures",
      "Water Supply",
      "Public Facilities",
      "Utility Failures"
    ];

    let finalCategory = parsedData.category;
    if (!validCategories.includes(finalCategory)) {
      finalCategory = validCategories.find(c => c.toLowerCase().includes(finalCategory?.toLowerCase() || "")) || "Road Damage";
    }

    return {
      isValidCivicIssue: true,
      category: finalCategory,
      severity: ["Low", "Medium", "High", "Critical"].includes(parsedData.severity) ? parsedData.severity : "Medium",
      priorityScore: typeof parsedData.priorityScore === "number" ? Math.min(100, Math.max(0, Math.round(parsedData.priorityScore))) : 65,
      confidence: typeof parsedData.confidence === "number" ? Math.min(100, Math.max(50, Math.round(parsedData.confidence))) : 88,
      recommendedAction: parsedData.recommendedAction || "Municipal inspection and repair dispatch requested.",
      summary: parsedData.summary || "Civic issue reported and queued for municipal resolution."
    };
  } catch (error) {
    console.error("Complete Groq AI Service Error (falling back to heuristic analysis):", error.message);
    return getFallbackAnalysis(description || "");
  }
};

// Fallback logic in case of network/key failures
const getFallbackAnalysis = (description) => {
  const desc = (description || "").toLowerCase().trim();

  if (!desc) {
    return {
      isValidCivicIssue: false,
      category: "Invalid",
      severity: "N/A",
      priorityScore: 0,
      confidence: 0,
      recommendedAction: "Upload a clear photo of a civic infrastructure issue.",
      summary: "AI analysis unavailable. Please provide a clear description and photo of the civic issue."
    };
  }

  let isValidCivicIssue = true;
  let category = "Road Damage";
  let severity = "Medium";
  let priorityScore = 55;
  let confidence = 80;
  let recommendedAction = "Standard Road Maintenance Dispatch";
  let summary = "Road damage reported; repair recommended to avoid local traffic hazards.";

  if (desc.includes("garbage") || desc.includes("waste") || desc.includes("dump") || desc.includes("trash")) {
    category = "Waste Management";
    severity = desc.includes("vile") || desc.includes("hazardous") || desc.includes("foul") ? "High" : "Medium";
    priorityScore = severity === "High" ? 75 : 60;
    confidence = 85;
    recommendedAction = "Sanitation Clearance Crew Dispatch";
    summary = "Solid waste overflow creating unhygienic conditions. Garbage clearance required.";
  } else if (desc.includes("light") || desc.includes("street-light") || desc.includes("dark") || desc.includes("bulb")) {
    category = "Streetlight Failures";
    severity = desc.includes("accident") || desc.includes("crime") ? "High" : "Medium";
    priorityScore = severity === "High" ? 80 : 65;
    confidence = 85;
    recommendedAction = "Utility Grid Team Bulb Replacement";
    summary = "Broken streetlight array leading to dark pedestrian walkways. Fix lighting cables.";
  } else if (desc.includes("water") || desc.includes("leak") || desc.includes("pipe") || desc.includes("burst")) {
    category = "Water Supply";
    severity = desc.includes("flood") || desc.includes("burst") ? "Critical" : "High";
    priorityScore = severity === "Critical" ? 95 : 80;
    confidence = 88;
    recommendedAction = "Emergency Valve Isolation & Plumbing Repair";
    summary = "Subsurface pipeline damage causing active water waste and minor flooding. Valves check requested.";
  } else if (desc.includes("wire") || desc.includes("spark") || desc.includes("transformer") || desc.includes("power")) {
    category = "Utility Failures";
    severity = desc.includes("dangling") || desc.includes("spark") ? "Critical" : "High";
    priorityScore = severity === "Critical" ? 99 : 85;
    confidence = 90;
    recommendedAction = "Immediate Electrical Grid Shutdown & Rewiring";
    summary = "Snapped or sparking overhead power cable posing electric shock hazard. Immediate line isolation required.";
  } else if (desc.includes("park") || desc.includes("bench") || desc.includes("playground") || desc.includes("fence")) {
    category = "Public Facilities";
    severity = "Low";
    priorityScore = 40;
    confidence = 80;
    recommendedAction = "Generic Maintenance Workorder";
    summary = "Minor public facility furniture damage. Scheduled for generic maintenance cycle.";
  } else if (!desc.includes("pothole") && !desc.includes("road") && !desc.includes("crack")) {
    // If not matching any civic keyword, safe invalid state
    isValidCivicIssue = false;
    category = "Invalid";
    severity = "N/A";
    priorityScore = 0;
    confidence = 0;
    recommendedAction = "Upload a clear photo of a civic infrastructure issue.";
    summary: "The reported description does not clearly match a recognized civic infrastructure problem.";
  }

  return {
    isValidCivicIssue,
    category,
    severity,
    priorityScore,
    confidence,
    recommendedAction,
    summary,
  };
};
