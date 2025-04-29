"use client";
import { useProjects } from "@/hooks/use-project";
import { api } from "@/trpc/react";
import MeetingCard from "../dashboard/meeting-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const MeetingsPage = () => {
	const { project } = useProjects();
	const { data: meetings, isPending } = api.project.getMeetings.useQuery(
		{
			projectId: project?.id ?? "",
		},
		{
			refetchInterval: 4000,
		},
	);

	return (
		<>
			{!project ? (
				<div className="my-4 flex h-full items-center justify-center">
					<div className="text-md text-muted-foreground">
						No project selected
					</div>
				</div>
			) : (
				<div>
					<MeetingCard projectId={project.id} />
					<h1 className="my-3 font-bold text-lg">Meetings</h1>
					<div className="space-y-3">
						{isPending
							? Array.from({ length: 3 }).map((_, i) => (
									<Skeleton key={i} className="h-24 w-full rounded-lg" />
								))
							: meetings?.map((meeting) => (
									<Card key={meeting.id}>
										<CardContent className="flex items-center justify-between">
											<div>
												<div className="min-w-0 text-start">
													<div className="flex items-center gap-2">
														<Link href={`/meetings/${meeting.id}`}>
															<h2 className="font-medium text-muted-foreground text-sm">
																{meeting.name}
															</h2>
														</Link>
														{meeting.status === "PROCESSING" && (
															<Badge className="bg-amber-300">Processing</Badge>
														)}
													</div>
												</div>
												<div className="flex items-center gap-x-2 text-muted-foreground text-xs">
													<p className="whitespace-nowrap">
														{meeting.createdAt.toLocaleString()}
													</p>
													<p className="truncate">
														{meeting.issues.length} issue/s
													</p>
												</div>
											</div>
											<Button size={"sm"} asChild variant="outline">
												<Link href={`/meetings/${meeting.id}`}>
													View Meeting
												</Link>
											</Button>
										</CardContent>
									</Card>
								))}
					</div>
				</div>
			)}
		</>
	);
};

export default MeetingsPage;
