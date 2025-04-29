import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github'
import type { Document } from '@langchain/core/documents'
import { summarizeCode, generateSummaryEmbeddings } from './gemini'
import { db } from '@/server/db'

export const loadGithubRepo = async (githubUrl: string, githubToken?: string) => {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || '',
    branch: 'main',
    ignoreFiles: [
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      'bun.lockb',
      'Gemfile.lock',
      'Gemfile',
      'package.json',
      'tsconfig.json',
      'tsconfig.node.json',
      'tsconfig.app.json',
      'tsconfig.base.json',
      'tsconfig.json',
      'tsconfig.node.json',
    ],
    recursive: true,
    unknown: 'warn',
    maxConcurrency: 5
  })
  const docs = await loader.load()
  return docs
}

export const indexGithubRepo = async (githubUrl: string, projectId: string, githubToken?: string,) => {
  const docs = await loadGithubRepo(githubUrl, githubToken)
  const embeddings = await generateEmbeddings(docs)

  // Process embeddings in batches of 5 with delays
  const batchSize = 5;
  for (let i = 0; i < embeddings.length; i += batchSize) {
    const batch = embeddings.slice(i, i + batchSize);

    await Promise.allSettled(batch.map(async (embedding, index) => {
      console.log(`Processing ${i + index} of ${embeddings.length}`)

      if (!embedding) return;

      const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
        data: {
          fileName: embedding.fileName,
          summary: embedding.summary ?? "",
          sourceCode: embedding.sourceCode,
          projectId,
        }
      })

      await db.$executeRaw`
      UPDATE "source_code_embedding"
      SET "summaryEmbedding" = ${embedding.embedding}::vector
      WHERE "id" = ${sourceCodeEmbedding.id}
      `
      return sourceCodeEmbedding
    }));

    // Add delay between batches
    if (i + batchSize < embeddings.length) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

const generateEmbeddings = async (docs: Document[]) => {
  return await Promise.all(docs.map(async (doc, index) => {
    if (index > 0 && index % 2 === 0) {
      await new Promise(resolve => setTimeout(resolve, 10000));
    }

    const summary = await summarizeCode(doc)
    const embedding = await generateSummaryEmbeddings(summary ?? "");

    return {
      summary,
      embedding,
      sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
      fileName: doc.metadata.source
    }
  }))
}
