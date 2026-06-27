import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the .env file from the backend root directory (one level up from config)
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

console.log("Environment variables loaded. GROQ_API_KEY exists:", !!process.env.GROQ_API_KEY);
