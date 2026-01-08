import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const { userInput, dayStart, dayEnd, carryOverTasks } = await req.json();

  const carryOverContext =
    carryOverTasks?.length > 0
      ? `IMPORTANT: These unfinished tasks MUST be included today: ${carryOverTasks
          .map((t: any) => t.title)
          .join(", ")}.`
      : "";

  const prompt = `
Create a structured daily timetable.
User input: "${userInput}"
Day starts at ${dayStart}, ends at ${dayEnd}.
${carryOverContext}

Return JSON only.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                startTime: { type: Type.STRING },
                endTime: { type: Type.STRING },
                category: {
                  type: Type.STRING,
                  enum: ["Work", "Personal", "Health", "Leisure", "Other"],
                },
                priority: {
                  type: Type.STRING,
                  enum: ["High", "Medium", "Low"],
                },
              },
              required: ["title", "startTime", "endTime", "category", "priority"],
            },
          },
        },
        required: ["tasks"],
      },
    },
  });

  return new Response(response.text, {
    headers: { "Content-Type": "application/json" },
  });
};
