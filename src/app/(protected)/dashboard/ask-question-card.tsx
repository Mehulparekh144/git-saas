"use client";
import MDEditor from "@uiw/react-md-editor";
import type React from "react";
import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Save, WandSparkles } from "lucide-react";
import type { Project } from "@prisma/client";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { askQuestion } from "./actions";
import { readStreamableValue } from "ai/rsc";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import FileReferences from "./file-references";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import { useRefetch } from "@/hooks/use-refetch";
import { useTheme } from "next-themes";
interface AskQuestionProps {
	project: Project;
}

interface FileReference {
	fileName: string;
	summary: string;
	sourceCode: string;
}

const AskQuestionCard = ({ project }: AskQuestionProps) => {
	const { theme } = useTheme();
	const [question, setQuestion] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [answer, setAnswer] = useState<string>("");
	const [filesReference, setFilesReference] = useState<FileReference[]>([]);
	const [error, setError] = useState<string>("");

	const refetch = useRefetch();

	const saveAnswer = api.project.saveAnswer.useMutation();

	const handleAskQuestion = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!project.id) {
			toast.error("Project not found");
			return;
		}

		if (answer.trim() !== "") {
			setAnswer("");
			setError("");
			setFilesReference([]);
		}

		try {
			setIsLoading(true);

			const { output, filesReference } = await askQuestion(
				question,
				project.id,
			);

			setIsDialogOpen(true);

			setIsLoading(false);
			setFilesReference(filesReference);

			for await (const chunk of readStreamableValue(output)) {
				if (chunk) {
					setAnswer((prev) => prev + chunk);
				}
			}
			setIsLoading(false);
		} catch {
			setError("An error occurred while asking the question");
		}
	};

	const handleSaveQuestion = async () => {
		if (!project.id) {
			toast.error("Project not found");
			return;
		}

		try {
			await saveAnswer.mutateAsync(
				{
					question,
					answer,
					projectId: project.id,
					fileReferences: filesReference,
				},
				{
					onSuccess: () => refetch(),
				},
			);
			toast.success("Question saved");
		} catch {
			toast.error("An error occurred while saving the question");
		}
	};

	return (
		<>
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="overflow-y-scroll sm:max-h-[80vh] sm:max-w-[80vw]">
					<DialogHeader>
						<div className="flex items-center justify-between">
							<DialogTitle>{question}</DialogTitle>
							<Button
								variant={"outline"}
								disabled={saveAnswer.isPending}
								onClick={handleSaveQuestion}
							>
								{saveAnswer.isPending && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								Save Answer <Save className="ml-2 h-4 w-4" />
							</Button>
						</div>
					</DialogHeader>
					{error && (
						<Alert variant={"destructive"}>
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}
					<div data-color-mode={theme === "dark" ? "dark" : "light"}>
						<MDEditor.Markdown
							source={answer}
							className="!h-full max-h-[70vh] overflow-y-scroll"
						/>
						<Separator className="my-4" />
						{filesReference.length > 0 && (
							<FileReferences filesReference={filesReference} />
						)}
					</div>
					<DialogFooter>
						<Button onClick={() => setIsDialogOpen(false)}>Close</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<Card className="col-span-3 w-full">
				<CardHeader>
					<CardTitle>Ask a question</CardTitle>
					<CardDescription>
						Ask a question about your project and get an answer from the AI.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="space-y-4" onSubmit={handleAskQuestion}>
						<Textarea
							placeholder="Ask a question about your project..."
							value={question}
							onChange={(e) => setQuestion(e.target.value)}
						/>
						<Button
							disabled={question.trim() === "" || isLoading}
							type="submit"
						>
							{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Ask <WandSparkles />
						</Button>
					</form>
				</CardContent>
			</Card>
		</>
	);
};

export default AskQuestionCard;
