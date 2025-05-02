import { GoogleGenAI } from "@google/genai";

const ModelPrompt: string = `You are a backend-to-frontend transformer.

I will give you a Swagger/OpenAPI JSON file (v2.0 or v3.x). Your job is to:
1. Parse and normalize the file regardless of version.
2. For each endpoint and its HTTP method (e.g., GET /users, POST /login):
   - Extract summary and description if available.
   - For request bodies, parameters, and query/path/header params, create a structured schema:
     - Show all field \`name\`, \`in\` (e.g., path, query, header, body), \`type\`, \`required\`, \`description\`, and add a realistic example \`value\`.
     - For strings: include \`minLength\`, \`maxLength\`, \`pattern\`, and a realistic \`value\` (e.g., "john_doe", "P@ssw0rd123")
     - For numbers: include \`minimum\`, \`maximum\`, \`format\`, and a sample \`value\` (e.g., 99.99)
     - For booleans: indicate it's a true/false toggle, and assign a \`value\` (true or false)
     - For enums: list all allowed values and select one as \`value\`
     - For objects or arrays: recursively define child fields and assign sample \`value\` for each
3. Return the result grouped by endpoint and HTTP method, like:
\`\`\`json
{
  "/auth/login": {
    "POST": {
      "description": "User login",
      "fields": [
        {
          "name": "username",
          "type": "string",
          "required": true,
          "minLength": 3,
          "maxLength": 50,
          "value": "john_doe"
        },
        {
          "name": "password",
          "type": "string",
          "required": true,
          "value": "P@ssw0rd123"
        }
      ]
    }
  },
  "/products": {
    "GET": {
      "description": "Fetch product list",
      "queryParams": [
        {
          "name": "category",
          "type": "string",
          "enum": ["Fruits", "Electronics", "Books"],
          "required": false,
          "value": "Books"
        }
      ]
    },
    "POST": {
      "description": "Create a new product",
      "fields": [
        {
          "name": "title",
          "type": "string",
          "required": true,
          "value": "Wireless Headphones"
        },
        {
          "name": "price",
          "type": "number",
          "minimum": 0,
          "value": 59.99
        },
        {
          "name": "details",
          "type": "object",
          "fields": [
            {
              "name": "weight",
              "type": "number",
              "required": false,
              "value": 1.5
            },
            {
              "name": "availableColors",
              "type": "array",
              "items": {
                "type": "string"
              },
              "value": ["Red", "Black"]
            }
          ]
        }
      ]
    }
  }
}
\`\`\`
4. Do not return extra text — only clean JSON output as shown above.`;

function extractJsonFromCodeBlock(responseText: string): object {
  const cleaned = responseText
    .replace(/^```json\s*/, "") // remove starting ```json
    .replace(/```$/, "") // remove ending ```
    .trim(); // trim any whitespace

  return JSON.parse(cleaned); // convert string to JSON
}

const ai = new GoogleGenAI({
  apiKey: "AIzaSyDCHmKc0jtQfXnidzntgA-7BwAasMqKgQU",
});

export async function GenAIFunction({
  fileContent,
  userPrompt = "",
}: {
  fileContent: any; // Changed type to 'any' to accept parsed JSON/YAML
  userPrompt?: string;
}) {
  const combinedPrompt = JSON.stringify(fileContent) + " " + userPrompt; // Stringify the JSON
  const systemPrompt = ModelPrompt; // Your system-like prompt

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt} ${combinedPrompt}` }],
        },
      ],
    });
    const rawResponse = response?.candidates?.[0]?.content?.parts?.[0]?.text;
    const usableResponse = extractJsonFromCodeBlock(rawResponse || "");
    console.log(usableResponse);
    return usableResponse;
  } catch (e: any) {
    console.error(`An Error Occurred in GenAIFunction: ${e.message}`);
  }
}
