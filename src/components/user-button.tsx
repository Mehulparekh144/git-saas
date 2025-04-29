"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "better-auth";
import { authClient } from "@/lib/auth-client";
import { LogOutIcon } from "lucide-react";

const UserButton = ({ user }: { user: User }) => {
	return (
		<div>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="relative h-8 w-8 rounded-full">
						<Avatar>
							<AvatarImage src={user.image ?? undefined} />
							<AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
						</Avatar>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem>
						<Button
							variant="ghost"
							className="w-full"
							onClick={() => {
								authClient.signOut();
								window.location.href = "/signin";
							}}
						>
							<LogOutIcon className="mr-2 h-4 w-4" />
							<span>Log out</span>
						</Button>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

export default UserButton;
