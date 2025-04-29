"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type FormInputType = {
	email: string;
	password: string;
	name: string;
};

const Signup = () => {
	const [formData, setFormData] = useState<FormInputType>({
		email: "",
		password: "",
		name: "",
	});

	const [isLoading, setIsLoading] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		await authClient.signUp.email(
			{
				email: formData.email,
				password: formData.password,
				callbackURL: "/signin",
				name: formData.name,
			},
			{
				onError(context: { error: Error }) {
					toast.error("Something went wrong", {
						description: context.error.message,
					});
					setIsLoading(false);
				},
				onSuccess() {
					toast.success("Account created successfully");
					setIsLoading(false);
				},
				onRequest() {
					setIsLoading(true);
				},
			},
		);
	};

	return (
		<div className="flex h-screen w-full items-center justify-center bg-secondary">
			<Card className="w-full max-w-2xl px-3">
				<CardHeader>
					<CardTitle className="font-bold text-2xl">Sign Up</CardTitle>
					<CardDescription>Create an account to get started</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={(e) => {
							handleSignup(e);
						}}
						className="space-y-4"
					>
						<Input
							type="text"
							placeholder="Name"
							name="name"
							value={formData.name}
							onChange={handleChange}
						/>
						<Input
							type="email"
							placeholder="Email"
							name="email"
							value={formData.email}
							onChange={handleChange}
						/>
						<Input
							type="password"
							placeholder="Password"
							name="password"
							value={formData.password}
							onChange={handleChange}
						/>
						<Button type="submit" disabled={isLoading}>
							{isLoading && <Loader2 className="animate-spin" />}
							Signup
						</Button>
					</form>
				</CardContent>
				<CardFooter className="text-muted-foreground">
					Already have an account? &nbsp;
					<Link className="text-primary underline" href="/signin">
						Sign In
					</Link>
				</CardFooter>
			</Card>
		</div>
	);
};

export default Signup;
