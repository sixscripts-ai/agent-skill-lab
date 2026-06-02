import { GoogleGenAI, Type } from '@google/genai';
import { SYSTEM_PROMPT } from '../constants';
import { ExecutionResult, Skill } from '../types';

// Initialize the Gemini API client
// The API key is expected to be provided by the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

export const executeSkillSimulated = async (skill: Skill, args: string = ""): Promise<ExecutionResult> => {
  try {
    const prompt = `
      Execute the following skill:
      Name: ${skill.name}
      Type: ${skill.type}
      Description: ${skill.description}
      Allowed Tools: ${skill.allowedTools.join(', ')}
      Arguments provided by user: ${args || "None"}
      
      Simulate the terminal output or structured data result of this execution.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ui_component: {
              type: Type.STRING,
              description: "Must be exactly 'terminal_text' or 'json_table'"
            },
            data: {
              type: Type.STRING,
              description: "The output data. If json_table, a valid stringified JSON object. If terminal_text, raw text logs."
            }
          },
          required: ["ui_component", "data"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response from agent.");
    }

    const parsedResponse = JSON.parse(response.text);
    
    return {
      ui_component: parsedResponse.ui_component as 'terminal_text' | 'json_table',
      data: parsedResponse.data,
      skillName: skill.name,
      timestamp: new Date().toLocaleTimeString()
    };

  } catch (error: any) {
    console.error("Execution Error:", error);
    return {
      ui_component: 'error',
      data: `Execution failed: ${error.message || "Unknown error"}`,
      skillName: skill.name,
      timestamp: new Date().toLocaleTimeString()
    };
  }
};
