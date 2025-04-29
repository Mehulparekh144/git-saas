"use client";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { useProjects } from "@/hooks/use-project";
import { api } from "@/trpc/react";
import AskQuestionCard from "../dashboard/ask-question-card";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MDEditor from "@uiw/react-md-editor";
import FileReferences from "../dashboard/file-references";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";
import { Separator } from "@/components/ui/separator";
const QAPage = () => {
	const { project } = useProjects();

	const { data: questionsAndAnswers, isPending } =
		api.project.getQuestionsAndAnswers.useQuery({
			projectId: project?.id ?? "",
		});

	const [questionIdx, setQuestionIdx] = useState<number>(0);
	const { theme } = useTheme();
	const question = questionsAndAnswers?.[questionIdx];

	return (
		<Sheet>
			{!project ? (
				<div className="my-4 flex h-full items-center justify-center">
					<div className="text-md text-muted-foreground">
						No project selected
					</div>
				</div>
			) : (
				<>
					<AskQuestionCard project={project} />
					<h1 className="my-3 font-bold text-lg">Saved Questions</h1>
					<div className="space-y-3">
						{isPending
							? Array.from({ length: 3 }).map((_, idx) => (
									<Skeleton key={idx} className="h-24 w-full" />
								))
							: questionsAndAnswers?.map((question, idx) => (
									<React.Fragment key={question.id}>
										<SheetTrigger onClick={() => setQuestionIdx(idx)} asChild>
											<Card className="w-full cursor-pointer">
												<CardContent className="flex items-center gap-4">
													<Avatar className="h-10 w-10">
														<AvatarImage src={question.user.image ?? ""} />
														<AvatarFallback>
															{question.user.name?.charAt(0)}
														</AvatarFallback>
													</Avatar>
													<div className="flex flex-col text-left">
														<div className="flex items-center gap-2">
															<p className="line-clamp-1 font-semibold text-lg">
																{question.question}
															</p>
															<span className="text-muted-foreground text-xs">
																{question.createdAt.toLocaleDateString()}
															</span>
														</div>
														<p className="line-clamp-1 text-muted-foreground text-sm">
															{question.answer}
														</p>
													</div>
												</CardContent>
											</Card>
										</SheetTrigger>
									</React.Fragment>
								))}
					</div>
					{question && (
						<SheetContent className="overflow-y-auto p-3 sm:max-w-[80vw]">
							<SheetHeader>
								<SheetTitle>{question.question}</SheetTitle>
							</SheetHeader>
							<div data-color-mode={theme === "dark" ? "dark" : "light"}>
								<MDEditor.Markdown source={question.answer} />
								<Separator className="my-2" />
								<FileReferences
									// biome-ignore lint/suspicious/noExplicitAny: <explanation>
									filesReference={(question.fileReferences ?? []) as any}
								/>
							</div>
						</SheetContent>
					)}
				</>
			)}
		</Sheet>
	);
};

export default QAPage;
