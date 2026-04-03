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
  suggestedTags?: string[];
}

export interface RefactorResponse {
  code: string;
  explanation: string;
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const systemPrompt = `You are an expert code tutor that explains code line-by-line clearly and concisely. 
Your task is to analyze code and provide:
1. Detect the programming language
2. A brief summary of what the code does
3. Line-by-line explanations for EVERY SINGLE LINE OF CODE (include the actual code line)
4. Complexity assessment (Simple, Moderate, or Complex)
5. Suggestions for improvement
6. Provide a list of up to 5 suggested tags for this code (e.g. "authentication", "api-route", "react-hook").

CRITICAL: You MUST include explanations for ALL lines of code without exception. Empty lines should be included as well.

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
  "improvements": ["suggestion 1", "suggestion 2"],
  "suggestedTags": ["tag1", "tag2", "tag3"]
}`;

function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

export async function explainCode(
  code: string,
  language: string,
  explanationLanguage = "English"
): Promise<ExplanationResponse> {
  try {
    const responseLanguageInstruction =
      explanationLanguage === "Lazy Hindi (Romanized)"
        ? `Write all user-facing text fields in colloquial Hindi using only English letters (Roman script).`
        : explanationLanguage === "Lazy Marathi (Romanized)"
        ? `Write all user-facing text fields in colloquial Marathi using only English letters (Roman script).`
        : `Write all user-facing text fields in ${explanationLanguage}:`;

    const userPrompt = `Analyze this code, detect its programming language, and explain EVERY SINGLE LINE:
\`\`\`
${code}
\`\`\`
${responseLanguageInstruction}`;

    const message = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    const content = message.choices[0]?.message?.content;
    if (!content) throw new Error("No response from Groq API");

    const cleanedContent = cleanJsonString(content);
    const parsed = JSON.parse(cleanedContent) as ExplanationResponse;
    return parsed;
  } catch (error: any) {
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
}

export async function refactorCode(code: string, language: string, instruction: string): Promise<RefactorResponse> {
  const prompt = `You are an expert developer.
Please refactor the following ${language} code according to this instruction: "${instruction}".

Return ONLY valid JSON in this exact format.
IMPORTANT: You MUST properly escape all newlines as \\n and double quotes as \\" within the JSON string fields, otherwise the JSON will be invalid.
{
  "code": "the refactored code with \\n for newlines",
  "explanation": "a brief explanation of what was changed and why"
}

Code to refactor:
\`\`\`
${code}
\`\`\`
`;

  const message = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 4000,
    response_format: { type: "json_object" }
  });

  const content = message.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  const cleanedContent = cleanJsonString(content);
  return JSON.parse(cleanedContent) as RefactorResponse;
}

export async function chatWithCode(code: string, history: any[], newMessage: string) {
  const systemMsg = `You are a helpful AI assistant integrated into a code snippet manager.
The user is asking a question about the following code snippet:
\`\`\`
${code}
\`\`\`
Answer their question clearly and concisely. If they ask for code, provide it. Format your response with Markdown where appropriate.`;

  // Keep only the last 10 messages to prevent token limits
  const recentHistory = history.slice(-10);

  const messages = [
    { role: "system", content: systemMsg },
    ...recentHistory.map(m => ({ role: m.role, content: m.content })),
    { role: "user", content: newMessage }
  ];

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: messages as any,
    temperature: 0.5,
    max_tokens: 2048,
  });

  return response.choices[0]?.message?.content || "No response";
}
