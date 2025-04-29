import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import type { Project } from "@prisma/client";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

type CommitLogProps = {
	project: Project;
};

const CommitLog = ({ project }: CommitLogProps) => {
	const { data: commits, isLoading } = api.project.getProjectCommits.useQuery({
		id: project.id,
	});

	return (
		<>
			<ul className="space-y-4">
				{isLoading &&
					Array.from({ length: 5 }).map((_, idx) => (
						<li key={idx} className="relative flex gap-x-4">
							<div
								className={cn(
									idx === 4 ? "h-6" : "-bottom-6",
									"absolute top-0 left-0 flex w-6 justify-center",
								)}
							>
								<div className="w-px translate-x-1 bg-secondary" />
							</div>

							<>
								<Skeleton className="relative mt-6 size-8 flex-none rounded-full" />
								<Skeleton className="h-16 flex-auto rounded-md p-4 ring-1 ring-secondary ring-inset" />
							</>
						</li>
					))}
				{commits?.map((commit, idx) => (
					<li key={commit.id} className="relative flex gap-x-4">
						<div
							className={cn(
								idx === commits.length - 1 ? "h-6" : "-bottom-6",
								"absolute top-0 left-0 flex w-6 justify-center",
							)}
						>
							<div className="w-px translate-x-1 bg-secondary" />
						</div>

						<>
							<img
								src={commit.commitAuthorAvatar}
								alt={commit.commitAuthor}
								className="relative mt-6 size-8 flex-none rounded-full bg-secondary"
							/>
							<div className="flex-auto rounded-md bg-muted p-4 shadow-lg ring-1 ring-secondary ring-inset">
								<div className="flex justify-between gap-x-4">
									<Link
										href={`${project.repoUrl}/commit/${commit.commitHash}`}
										className="py-0.5 text-muted-foreground text-xs leading-6"
									>
										<span className="font-medium">{commit.commitAuthor}</span>{" "}
										<span className="inline-flex items-center">
											commited
											<ExternalLink className="ml-1 size-4" />
										</span>
									</Link>
								</div>
								<span className="line-clamp-4 font-semibold">
									{commit.commitMessage}
								</span>
								<div className="mt-2 text-muted-foreground text-xs leading-6">
									{commit.summary}
								</div>
							</div>
						</>
					</li>
				))}
			</ul>
		</>
	);
};

export default CommitLog;
