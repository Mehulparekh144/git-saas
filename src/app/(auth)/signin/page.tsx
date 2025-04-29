"use client";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
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
import { authClient } from "@/lib/auth-client";

type FormInputType = {
	email: string;
	password: string;
};

const Signin = () => {
	const [formData, setFormData] = useState<FormInputType>({
		email: "",
		password: "",
	});

	const [isLoading, setIsLoading] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		await authClient.signIn.email(
			{
				email: formData.email,
				password: formData.password,
				callbackURL: "/dashboard",
			},
			{
				onError(context: { error: Error }) {
					toast.error("Something went wrong", {
						description: context.error.message,
					});
					setIsLoading(false);
				},
				onSuccess() {
					toast.success("Signed in successfully");
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
					<CardTitle className="font-bold text-2xl">Sign In</CardTitle>
					<CardDescription>Sign in to your account to continue</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={(e) => {
							handleSignup(e);
						}}
						className="space-y-4"
					>
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
						<Button disabled={isLoading} type="submit">
							{isLoading && <Loader2 className="animate-spin" />}
							Sign In
						</Button>
					</form>
				</CardContent>
				<CardFooter className="text-muted-foreground">
					Don't have an account? &nbsp;
					<Link className="text-primary underline" href="/signup">
						Sign Up
					</Link>
				</CardFooter>
			</Card>
		</div>
	);
};

export default Signin;
