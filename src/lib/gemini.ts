import { env } from '@/env';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Document } from '@langchain/core/documents';

const genAi = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAi.getGenerativeModel({
  model: 'gemini-1.5-flash',
});

export const getCommitSummary = async (diff: string) => {
  const prompt = `You are a Git commit message expert. Analyze the following code changes and provide a clear, detailed commit summary that follows best practices.

Code changes:
${diff}

Please provide a commit summary that includes:
1. A clear title line (50-72 characters) that summarizes the main change
2. A detailed description explaining the changes and their impact
3. Any important technical details, breaking changes, or dependencies
4. The "what" and "why" of the changes
5. Use present tense imperative mood (e.g., "Add" instead of "Added")

Examples:

Input diff:
diff --git a/src/components/Button.tsx b/src/components/Button.tsx
index 1234567..89abcdef 100644
--- a/src/components/Button.tsx
+++ b/src/components/Button.tsx
@@ -1,5 +1,7 @@
 import React from 'react';
 
-export const Button = ({ children }) => {
+export const Button = ({ children, variant = 'primary' }) => {
   return (
-    <button className="bg-blue-500 text-white px-4 py-2 rounded">
+    <button className={\`bg-\${variant}-500 text-white px-4 py-2 rounded\`}>
       {children}
     </button>
   );
 };

Output:
feat(Button): add variant prop to support different button styles

This change adds a new 'variant' prop to the Button component, allowing for
different visual styles. The default variant remains 'primary', but now
developers can customize the button appearance by passing a different variant
value. This improves component reusability and maintains design consistency
across the application.

Input diff:
diff --git a/src/utils/auth.ts b/src/utils/auth.ts
index abcdef1..2345678 100644
--- a/src/utils/auth.ts
+++ b/src/utils/auth.ts
@@ -1,3 +1,5 @@
 export const login = async (email: string, password: string) => {
-  return fetch('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) });
+  const response = await fetch('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) });
+  if (!response.ok) throw new Error('Invalid credentials');
+  return response.json();
 };

Output:
fix(auth): add error handling for failed login attempts

This commit improves the login function by adding proper error handling for
failed authentication attempts. Previously, the function would silently fail
when receiving non-200 responses. Now it explicitly throws an error with a
clear message when credentials are invalid, making it easier to handle
authentication failures in the UI layer.

Format your response with a title line followed by a blank line and then the
detailed description. The description should be wrapped at 72 characters.`

  try {
    const response = await model.generateContent(prompt);
    return response.response.text()
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const summarizeCode = async (doc: Document) => {
  const content = doc.pageContent.slice(0, 1000);
  const metadata = doc.metadata;
  const filePath = metadata.source || 'unknown file';
  const prompt = `You are a senior software engineer specializing in technical documentation and knowledge transfer. Analyze the following code from ${filePath} and provide a clear, concise technical explanation that would help a junior engineer understand the codebase.

Code Document:
${content}

Provide a technical summary that:
1. Describes the code's core functionality and purpose
2. Explains key technical concepts and patterns used
3. Identifies important architectural decisions
4. Notes critical implementation details

Keep your response under 100 words. Focus on technical accuracy and clarity while ensuring it's accessible to junior engineers.

Example Output:
The \`auth.ts\` module implements JWT-based authentication with Redis session management. The \`authenticateUser\` function handles credential validation and token generation. We use Redis for distributed session storage with a 24-hour TTL. The implementation follows the OAuth 2.0 specification and includes rate limiting for security. Key functions: \`authenticateUser\`, \`validateToken\`, \`refreshToken\`.

Please provide a similar technical summary for the provided code.`

  try {
    const response = await model.generateContent(prompt);
    return response.response.text()
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const generateSummaryEmbeddings = async (summary: string) => {
  // Add a 1 second delay before each embedding generation
  await new Promise(resolve => setTimeout(resolve, 1000));

  const model = genAi.getGenerativeModel({
    model: 'text-embedding-004',
  });

  const response = await model.embedContent(summary);
  return response.embedding.values;
}
