import { createTRPCRouter, protectedProcedure } from "../trpc";
import z from 'zod';
import { pollCommits } from "@/lib/git";
import { indexGithubRepo } from "@/lib/github-loader";
export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure.input(z.object({
    name: z.string(),
    repoUrl: z.string(),
    githubToken: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    const { name, repoUrl, githubToken } = input;

    const project = await ctx.db.project.create({
      data: {
        name,
        repoUrl,
        userToProject: {
          create: {
            userId: ctx.session.user.id
          }
        },
        deletedAt: null
      }
    })
    await indexGithubRepo(repoUrl, project.id, githubToken);
    await pollCommits(project.id);
    return project;
  })

  ,
  getProjects: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.db.project.findMany({
      where: {
        userToProject: { some: { userId: ctx.session.user.id } }
      }
    })

    return projects;
  })
  ,

  getProjectById: protectedProcedure.input(z.object({
    id: z.string()
  })).query(async ({ ctx, input }) => {
    const { id } = input;
    const project = await ctx.db.project.findUnique({ where: { id } })
    return project;
  }),

  getProjectCommits: protectedProcedure.input(z.object({
    id: z.string()
  })).query(async ({ ctx, input }) => {
    const { id } = input;
    await pollCommits(id).catch((error) => {
      console.error(error);
    });
    const commits = await ctx.db.commit.findMany({ where: { projectId: id } })
    return commits;
  }),

  saveAnswer: protectedProcedure.input(z.object({
    question: z.string(),
    answer: z.string(),
    projectId: z.string(),
    fileReferences: z.any(),
  })).mutation(async ({ ctx, input }) => {
    const { question, answer, projectId, fileReferences } = input;

    return ctx.db.question.create({
      data: {
        question,
        answer,
        projectId,
        fileReferences,
        userId: ctx.session.user.id,
      },
    });
  }),

  getQuestionsAndAnswers: protectedProcedure.input(z.object({
    projectId: z.string(),
  })).query(async ({ ctx, input }) => {
    const { projectId } = input;
    const questions = await ctx.db.question.findMany({
      where: { projectId }, orderBy: { createdAt: 'desc' }, include: {
        user: true
      }
    });
    return questions;
  }),

  uploadMeeting: protectedProcedure.input(z.object({
    meetingUrl: z.string(),
    projectId: z.string(),
    name: z.string(),
  })).mutation(async ({ ctx, input }) => {
    const { meetingUrl, projectId, name } = input;
    const meeting = await ctx.db.meeting.create({
      data: {
        meetingUrl,
        projectId,
        name,
      }
    })
    return meeting;
  }),

  getMeetings: protectedProcedure.input(z.object({
    projectId: z.string(),
  })).query(async ({ ctx, input }) => {
    const { projectId } = input;
    const meetings = await ctx.db.meeting.findMany({ where: { projectId }, include: { issues: true } })
    return meetings;
  })
});