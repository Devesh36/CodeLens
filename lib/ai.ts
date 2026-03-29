import Groq from "groq-sdk";

export interface ExplanationResponse {
  summary: string;
  lineExplanations: Array<{
    line: number;
    code: string;
    explanation: string;
  }>;
  complexity: string;
  improvements: string[];
  detectedLanguage?: string;
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const systemPrompt = `You are an expert code tutor that explains code line-by-line clearly and concisely. 
Your task is to analyze code and provide:
1. Detect the programming language
2. A brief summary of what the code does
3. Line-by-line explanations for each significant line (include the actual code line)
4. Complexity assessment (Simple, Moderate, or Complex)
5. Suggestions for improvement

IMPORTANT: You MUST respond with ONLY valid JSON, no markdown, no extra text.
Do not include code blocks with triple backticks.
The JSON structure must be exactly:
{
  "detectedLanguage": "javascript|python|java|cpp|go|rust|typescript|ruby|php|swift|csharp|etc",
  "summary": "brief description of what the code does",
  "lineExplanations": [
    {"line": 1, "code": "the actual code from line 1", "explanation": "what this line does"},
    {"line": 2, "code": "the actual code from line 2", "explanation": "what this line does"}
  ],
  "complexity": "Simple|Moderate|Complex",
  "improvements": ["suggestion 1", "suggestion 2"]
}`;

export async function explainCode(
  code: string,
  language: string,
  explanationLanguage = "English"
): Promise<ExplanationResponse> {
  try {
    const responseLanguageInstruction =
      explanationLanguage === "Lazy Hindi (Romanized)"
        ? `
Write all user-facing text fields in colloquial Hindi using only English letters (Roman script).
Tone: natural and friendly, like everyday spoken Hinglish.
Example style: "kya ho raha hai", "ye line array ko sort karti hai".
- summary
- lineExplanations[].explanation
- improvements[]
Keep code snippets unchanged and keep complexity value strictly one of: Simple, Moderate, Complex.`
        : explanationLanguage === "Lazy Marathi (Romanized)"
        ? `
Write all user-facing text fields in colloquial Marathi using only English letters (Roman script).
Tone: natural and friendly, like everyday spoken Marathi.
Example style: "kai zhala re", "hi line list filter karte".
- summary
- lineExplanations[].explanation
- improvements[]
Keep code snippets unchanged and keep complexity value strictly one of: Simple, Moderate, Complex.`
        : `
Write all user-facing text fields in ${explanationLanguage}:
- summary
- lineExplanations[].explanation
- improvements[]
Keep code snippets unchanged and keep complexity value strictly one of: Simple, Moderate, Complex.`;

    const userPrompt = language === "auto" 
      ? `Analyze this code, detect its programming language, and explain it:

\`\`\`
${code}
\`\`\`

${responseLanguageInstruction}

Provide the explanation in the exact JSON format specified, with line numbers corresponding to the code.`
      : `Analyze and explain this ${language} code:

\`\`\`${language}
${code}
\`\`\`

${responseLanguageInstruction}

Provide the explanation in the exact JSON format specified, with line numbers corresponding to the code.`;

    const message = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = message.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from Groq API");
    }

    // Parse the JSON response
    const parsed = JSON.parse(content) as ExplanationResponse;

    // Validate the response structure
    if (
      !parsed.summary ||
      !Array.isArray(parsed.lineExplanations) ||
      !parsed.complexity ||
      !Array.isArray(parsed.improvements)
    ) {
      throw new Error("Invalid response structure from AI");
    }

    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
    throw error;
  }
}
