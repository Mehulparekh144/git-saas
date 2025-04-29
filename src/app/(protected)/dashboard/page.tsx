"use client";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/use-project";
import { ExternalLink, Github, Loader2 } from "lucide-react";
import Link from "next/link";
import CommitLog from "./commit-log";
import AskQuestionCard from "./ask-question-card";
import MeetingCard from "./meeting-card";

const DashboardPage = () => {
	const { project, isProjectPending } = useProjects();

	return (
		<div>
			{project ? (
				<>
					<div className="flex flex-wrap items-center justify-between gap-2 gap-y-4">
						<Button variant={"link"} asChild>
							{isProjectPending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Link
									href={project?.repoUrl ?? ""}
									target="_blank"
									className="flex items-center gap-1"
								>
									<Github className="h-4 w-4" />
									<div className="ml-2 flex items-center gap-1">
										{project?.name}
										<ExternalLink className="h-4 w-4" />
									</div>
								</Link>
							)}
						</Button>

						<div className="mt-4 flex items-center gap-4">
							TeamMembers Invite Archive
						</div>
					</div>
					<div className="mt-4">
						<div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
							<AskQuestionCard project={project} />
							<MeetingCard projectId={project.id} />
						</div>
					</div>
					<div className="mt-8">
						<CommitLog project={project} />
					</div>
				</>
			) : (
				<div className="my-4 flex h-full items-center justify-center">
					<div className="text-md text-muted-foreground">
						No project selected
					</div>
				</div>
			)}
		</div>
	);
};

export default DashboardPage;
