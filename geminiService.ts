
import { GoogleGenAI, Type } from "@google/genai";
import { Task, DayReview } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTimetable = async (
  userInput: string, 
  dayStart: string, 
  dayEnd: string,
  carryOverTasks: Task[] = []
): Promise<Task[]> => {
  const carryOverContext = carryOverTasks.length > 0 
    ? `IMPORTANT: The following tasks were not finished yesterday and MUST be included today: ${carryOverTasks.map(t => t.title).join(', ')}.`
    : "";

  const prompt = `Create a detailed daily timetable based on this input: "${userInput}". 
  The user wants to start their day at ${dayStart} and end at ${dayEnd}. 
  ${carryOverContext}
  Organize the tasks logically, ensuring reasonable breaks and realistic durations. 
  Assign categories and priorities to each task.
  Today is ${new Date().toLocaleDateString()}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
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
                startTime: { type: Type.STRING, description: "Time in HH:mm format" },
                endTime: { type: Type.STRING, description: "Time in HH:mm format" },
                category: { type: Type.STRING, enum: ['Work', 'Personal', 'Health', 'Leisure', 'Other'] },
                priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
              },
              required: ["title", "startTime", "endTime", "category", "priority"],
            }
          }
        },
        required: ["tasks"],
      },
    },
  });

  const data = JSON.parse(response.text);
  
  return data.tasks.map((task: any, index: number) => ({
    ...task,
    id: `task-${Date.now()}-${index}`,
    status: 'Pending',
    notified: false
  }));
};

export const generateDayReview = async (tasks: Task[]): Promise<DayReview> => {
  const taskSummary = tasks.map(t => `${t.title} (${t.category}): ${t.status}`).join('\n');
  const prompt = `Review the following day's tasks and provide a constructive summary:
  ${taskSummary}
  
  Format the response as JSON. Evaluate productivity, highlight key wins, and suggest improvements for tomorrow.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          accomplishments: { type: Type.ARRAY, items: { type: Type.STRING } },
          missedOpportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
          productivityScore: { type: Type.NUMBER, description: "Score from 0 to 100" },
          tipsForTomorrow: { type: Type.STRING },
        },
        required: ["summary", "accomplishments", "missedOpportunities", "productivityScore", "tipsForTomorrow"],
      },
    },
  });

  return JSON.parse(response.text);
};
