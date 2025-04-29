"use client";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface FileReferencesProps {
	filesReference:
		| {
				fileName: string;
				summary: string;
				sourceCode: string;
		  }[]
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		| any;
}

const FileReferences = ({ filesReference }: FileReferencesProps) => {
	const [selectedFile, setSelectedFile] = useState(filesReference[0]);
	if (filesReference.length === 0) {
		return null;
	}

	return (
		<div className="max-w-[70vw]">
			<Tabs defaultValue={selectedFile?.fileName}>
				<div className="flex w-full gap-2 overflow-x-scroll rounded bg-primary/5 p-2">
					{/* biome-ignore lint/suspicious/noExplicitAny: <explanation> */}
					{filesReference.map((file: any) => (
						<Button
							variant={
								selectedFile?.fileName === file.fileName ? "default" : "outline"
							}
							key={file.fileName}
							className="min-w-fit"
							onClick={() => setSelectedFile(file)}
						>
							{file.fileName}
						</Button>
					))}
				</div>
				<div className="max-h-[40vh] max-w-4xl overflow-y-scroll">
					<SyntaxHighlighter language="typescript" style={atomDark}>
						{selectedFile!.sourceCode}
					</SyntaxHighlighter>
				</div>
			</Tabs>
		</div>
	);
};

export default FileReferences;
