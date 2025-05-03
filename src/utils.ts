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
   - Additionally, based on the response schema (200 or default success response), generate a dummy JSON response. Use realistic placeholder values for all fields and preserve nesting for objects or arrays.
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
      ],
      "response": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
          "id": 1,
          "username": "john_doe",
          "email": "john@example.com"
        }
      }
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
      ],
      "response": [
        {
          "id": 101,
          "title": "Wireless Headphones",
          "price": 59.99
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
      ],
      "response": {
        "id": 102,
        "title": "Wireless Headphones",
        "price": 59.99,
        "createdAt": "2024-01-01T10:00:00Z"
      }
    }
  }
}
\`\`\`
4. Do not return extra text — only clean JSON output as shown above.`;

const ChatPrompt: string = `You are a Swagger/OpenAPI assistant.

Your tasks:
1. Read and understand the Swagger/OpenAPI JSON (v2.0 or v3.x) that has been previously shared with you.
2. If the user asks questions about the API (e.g., endpoint purpose, field requirements, authentication, responses, etc.), answer them clearly in natural language using a helpful, technical tone. Use bullets or code blocks if needed to clarify.
3. If the user asks to **modify, add, or delete** anything in the Swagger:
   - Apply the change to the original Swagger spec correctly.
   - Update versioning and schema references where needed to maintain Swagger compliance.
   - Return the **entire updated Swagger** JSON.

Return ONLY a clean JSON object in this format (no markdown, no code block, no stringified object):

{
  "aiResponse": "Short explanation here",
  "updatedSwagger": {
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
        ],
        "response": {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          "user": {
            "id": 1,
            "username": "john_doe",
            "email": "john@example.com"
          }
        }
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
        ],
        "response": [
          {
            "id": 101,
            "title": "Wireless Headphones",
            "price": 59.99
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
        ],
        "response": {
          "id": 102,
          "title": "Wireless Headphones",
          "price": 59.99,
          "createdAt": "2024-01-01T10:00:00Z"
        }
      }
    }
  }
}

Important rules:
- If no update was requested, set "updatedSwagger" to an **empty object**: {}.
- For each update always return the full "updatedSwagger!
- Ensure the entire response is valid JSON — no comments, no markdown, no code fences, no escaping.
- Response must be directly parsable with JSON.parse(). Do not stringify or escape any values.
- Output must match the structure shown above exactly, including field/value styles for endpoints like /auth/login and /products.`;

function extractJsonFromCodeBlock(responseText: string): object {
  const cleaned = responseText
    .replace(/^```json\s*/, "") // remove starting ```json
    .replace(/```$/, "") // remove ending ```
    .trim(); // trim any whitespace

  return JSON.parse(cleaned); // convert string to JSON
}

const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY,
});

export async function GenAIFunction({
  fileContent,
}: {
  fileContent: any; // Changed type to 'any' to accept parsed JSON/YAML
}) {
  const combinedPrompt = JSON.stringify(fileContent); // Stringify the JSON
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

export async function TalkWithAIFunction({
  fileContent,
  userPrompt,
}: {
  fileContent: any;
  userPrompt: string;
}) {
  const combinedPrompt = JSON.stringify(fileContent) + " " + userPrompt;
  const systemPrompt = ChatPrompt;
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
    const structuredResponse = extractJsonFromCodeBlock(rawResponse || "");
    return structuredResponse;
  } catch (e: any) {
    console.error(`An Error Occurred in GenAIFunction: ${e.message}`);
  }
}
