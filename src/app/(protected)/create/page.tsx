"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRefetch } from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type FormInput = {
	repoUrl: string;
	projectName: string;
	githubToken?: string;
};

type GitHubURL = string & { __brand: "GitHubURL" };
function isGitHubURL(url: string): url is GitHubURL {
	const githubRegex =
		/^https:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+(\/[A-Za-z0-9_.-]+)?(\/)?$/;
	return githubRegex.test(url);
}

const CreateProjectPage = () => {
	const { register, handleSubmit, reset } = useForm<FormInput>();
	const refetch = useRefetch();
	const [validGitHubURL, setValidGitHubURL] = useState<boolean>(true);

	const createProject = api.project.createProject.useMutation();

	function onSubmit(data: FormInput) {
		createProject.mutate(
			{
				name: data.projectName,
				repoUrl: data.repoUrl,
				githubToken: data.githubToken,
			},
			{
				onSuccess: () => {
					toast.success("Project Linked Successfully ! ");
					refetch();
				},
				onError: () => toast.error("Failed to link project"),
				onSettled: () => {
					reset();
				},
			},
		);
	}

	return (
		<div className="mx-auto flex h-full max-w-4xl items-center justify-center px-3">
			<div className="w-full">
				<h1 className="font-semibold text-xl">Link your repository</h1>
				<p className="text-muted-foreground text-sm">
					Enter the URL of the repository you want to link to your project.
				</p>
				<div className="h-4" />

				<div>
					<form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
						<Input
							{...register("projectName")}
							placeholder="My Project"
							required
						/>
						<div className="space-y-2">
							<Input
								{...register("repoUrl")}
								placeholder="https://github.com/username/repo"
								required
								onChange={(e) => {
									if (
										isGitHubURL(e.target.value) ||
										e.target.value.trim() === ""
									) {
										setValidGitHubURL(true);
									} else {
										setValidGitHubURL(false);
									}
								}}
							/>
							{!validGitHubURL && (
								<p className="text-red-500 text-sm">Invalid GitHub URL</p>
							)}
						</div>
						<Input
							{...register("githubToken")}
							placeholder="GitHub Token (Optional)"
						/>
						<Button disabled={createProject.isPending} type="submit">
							{createProject.isPending && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							Link Project
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default CreateProjectPage;
