import { env } from "@/env";
import { db } from "@/server/db";
import { Octokit } from "octokit";
import { getCommitSummary } from "./gemini";

const octokit = new Octokit({
  auth: env.GITHUB_TOKEN
})

type Response = {
  commitMessage: string;
  commitHash: string;
  commitAuthor: string;
  commitAuthorAvatar: string;
  commitDate: Date;
};

export const getCommits = async (repoUrl: string): Promise<Response[]> => {
  const [owner, repo] = repoUrl.split("/").slice(3);
  const { data } = await octokit.rest.repos.listCommits({
    owner: owner!,
    repo: repo!,
  });

  return data.sort((a, b) => new Date(b.commit.author?.date || "").getTime() - new Date(a.commit.author?.date || "").getTime()).slice(0, 10).map((commit) => ({
    commitMessage: commit.commit.message,
    commitHash: commit.sha,
    commitAuthor: commit.commit.author?.name || "",
    commitAuthorAvatar: commit.author?.avatar_url || "",
    commitDate: new Date(commit.commit.author?.date || ""),
  }));
};

export const pollCommits = async (projectId: string) => {
  const { githubUrl } = await fetchProjectFromGithub(projectId);
  const commits = await getCommits(githubUrl);
  const unprocessedCommits = await filterUnprocessedCommits(projectId, commits);

  const summaryResponses = await Promise.allSettled(unprocessedCommits.map(async (commit, index) => {
    // Add 2 second delay after every 2 commits
    if (index > 0 && index % 2 === 0) {
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
    return summarizeCommits(githubUrl, commit.commitHash);
  }));

  const summaries = summaryResponses.map((response) => {
    if (response.status === "fulfilled") {
      return response.value;
    }
    return "";
  });

  const createdCommits = await db.commit.createMany({
    data: summaries.map((summary, index) => ({
      projectId: projectId,
      commitHash: unprocessedCommits[index]!.commitHash,
      summary: summary,
      commitMessage: unprocessedCommits[index]!.commitMessage,
      commitAuthor: unprocessedCommits[index]!.commitAuthor,
      commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
      commitDate: unprocessedCommits[index]!.commitDate,
    }))
  })

  return createdCommits;
};


export const summarizeCommits = async (githubUrl: string, commitHash: string) => {
  const _diff = `${githubUrl}/commit/${commitHash}.diff`;
  const diff = await fetch(_diff, {
    headers: {
      Accept: 'application/vnd.github.v3.diff'
    }
  }).then(res => res.text());
  const summary = await getCommitSummary(diff);
  return summary ?? "";
};

const filterUnprocessedCommits = async (projectId: string, commits: Response[]) => {
  const processedCommits = await db.commit.findMany({
    where: {
      projectId: projectId,
    },
  });

  return commits.filter((commit) => !processedCommits.some((c) => c.commitHash === commit.commitHash))
};

export const fetchProjectFromGithub = async (projectId: string) => {
  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      repoUrl: true
    }
  });

  if (!project?.repoUrl) {
    throw new Error("Project not found");
  }

  return { project, githubUrl: project?.repoUrl }
};
