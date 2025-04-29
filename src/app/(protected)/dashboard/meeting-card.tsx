"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { uploadFile } from "@/lib/firebase";
import { Presentation, Upload } from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Progress } from "@/components/ui/progress";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRefetch } from "@/hooks/use-refetch";

const MeetingCard = ({ projectId }: { projectId: string }) => {
	const refetch  = useRefetch();
	const [isUploading, setIsUploading] = useState<boolean>(false);
	const [progress, setProgress] = useState<number>(0);
	const uploadMeeting = api.project.uploadMeeting.useMutation();
	const { getRootProps, getInputProps } = useDropzone({
		accept: {
			"audio/*": [
				".mp3",
				".wav",
				".m4a",
				".ogg",
				".flac",
				".aac",
				".wma",
				".webm",
				".m4b",
				".m4p",
				".m4v",
				".mp4",
				".mov",
				".avi",
				".mkv",
			],
		},
		multiple: false,
		maxSize: 50_000_000, // 50MB
		onDrop: async (acceptedFiles) => {
			if (acceptedFiles.length > 0) {
				setIsUploading(true);
				const file = acceptedFiles[0];
				const url = await uploadFile(file as File, setProgress);
				uploadMeeting.mutate(
					{
						meetingUrl: url as string,
						projectId: projectId,
						name: file?.name || "Meeting",
					},
					{
						onSuccess: () => {
							toast.success("Meeting uploaded successfully");

							if (window.location.pathname !== "/meetings") {
								window.location.href = "/meetings";
							}

							refetch();
						},
						onError: () => {
							toast.error("Failed to upload meeting");
						},
					},
				);
				setIsUploading(false);
			}
		},
	});

	return (
		<Card className="col-span-2 w-full" {...getRootProps()}>
			{!isUploading ? (
				<CardContent className="flex w-full flex-col items-center justify-center gap-2">
					<Presentation className="h-10 w-10" />
					<h3 className="font-semibold text-lg">Upload Meeting</h3>
					<p className="text-muted-foreground text-sm">
						Upload your meeting audio file to get it analyzed by our AI.
					</p>
					<div className="mt-6">
						<Button disabled={isUploading}>
							<Upload className="mr-2 h-4 w-4" />
							Upload
							<input {...getInputProps()} />
						</Button>
					</div>
				</CardContent>
			) : (
				<CardContent className="flex h-full w-full flex-col items-center justify-center gap-2">
					<Progress value={progress} />
					<p className="text-muted-foreground text-sm">
						Uploading your meeting audio file... ({progress}%)
					</p>
				</CardContent>
			)}
		</Card>
	);
};

export default MeetingCard;
