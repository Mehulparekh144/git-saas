"use server";
import { streamText } from "ai";
import { createStreamableValue } from 'ai/rsc'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { env } from "@/env";
import { db } from "@/server/db";
import { generateSummaryEmbeddings } from "@/lib/gemini";

const google = createGoogleGenerativeAI({
  apiKey: env.GEMINI_API_KEY,
});

export async function askQuestion(question: string, projectId: string) {
  const stream = createStreamableValue();

  const queryVector = await generateSummaryEmbeddings(question).then((res) => `[${res.join(",")}]`)

  const result = await db.$queryRaw`
  SELECT "fileName", "summary", "sourceCode",
  1 - ("summaryEmbedding" <=> ${queryVector}::vector) AS similarity
  FROM "source_code_embedding"
  -- WHERE 1 - ("summaryEmbedding" <=> ${queryVector}::vector) > 0.75
  WHERE "projectId" = ${projectId}
  ORDER BY similarity DESC
  LIMIT 10
  ` as {
    fileName: string;
    summary: string;
    sourceCode: string;
  }[];

  console.log("result", result);

  let context = '';

  for (const res of result) {
    context += `source file: ${res.fileName}\n code content : ${res.sourceCode}\n summary of file : ${res.summary}\n\n`
  }

  console.log("context", context);

  (
    async () => {
      const { textStream } = await streamText({
        model: google("gemini-1.5-flash"),
        prompt: `You are an experienced senior software engineer helping a junior engineer understand their codebase. Your role is to provide clear, accurate, and helpful technical guidance based on the provided context.

START OF CONTEXT
${context}
END OF CONTEXT

START OF QUESTION
${question}
END OF QUESTION

Guidelines for your response:
1. Only use information explicitly present in the provided context. Do not make assumptions or invent details.
2. If the context doesn't contain enough information to answer the question, respond with: "I apologize, but I don't have enough information in the provided context to answer this question accurately."
3. Structure your response in a clear, step-by-step manner when explaining complex concepts.
4. Use technical terms but explain them when they might be unfamiliar to a junior engineer.
5. Include relevant code examples from the context when applicable.
6. If explaining a process or workflow, break it down into clear steps.
7. Highlight important considerations or potential pitfalls that a junior engineer should be aware of.

Format your response using markdown syntax:
1. Use \`\`\` for code blocks with appropriate language tags
2. Use \` for inline code references
3. Use ## for section headers
4. Use - or * for bullet points
5. Use > for important notes or warnings
6. Use \`\` for emphasis on important terms

Response Structure:
## Direct Answer
[Provide a clear, concise answer to the question]

## Detailed Explanation
[Break down the explanation with steps or examples]

### Code Example
\`\`\`typescript
[Relevant code snippet from context]
\`\`\`

## Important Notes
> [Highlight key considerations or potential issues]

## Related Concepts
- [List related concepts or next steps to explore]

Remember: Your goal is to help the junior engineer understand the codebase better while maintaining technical accuracy and honesty about information limitations.`
      });

      for await (const chunk of textStream) {
        stream.update(chunk);
      }

      stream.done();
    }
  )();

  return {
    output: stream.value,
    filesReference: result
  };
}
