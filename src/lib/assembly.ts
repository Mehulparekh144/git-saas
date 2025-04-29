import { env } from "@/env";
import { AssemblyAI } from "assemblyai";

const assembly = new AssemblyAI({
  apiKey: env.ASSEMBLY_API_KEY,
});

const msToTime = (ms: number) => {
  const seconds = Math.floor((ms / 1000) % 60).toString();
  const minutes = Math.floor((ms / (1000 * 60)) % 60).toString();
  return `${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
};

export const transcribeAudio = async (audioUrl: string) => {
  const transcript = await assembly.transcripts.transcribe({
    audio_url: audioUrl,
    auto_chapters: true,
  });

  const summaries = transcript.chapters?.map(chapter => (
    {
      start: msToTime(chapter.start),
      end: msToTime(chapter.end),
      summary: chapter.summary,
      gist: chapter.gist,
    }
  )) || []

  if (!transcript.text) {
    throw new Error("No transcription text found");
  }

  return {
    transcription: transcript,
    summaries,
  };
};





