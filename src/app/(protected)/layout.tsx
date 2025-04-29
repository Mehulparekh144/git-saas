import { SidebarProvider } from "@/components/ui/sidebar";
import UserButton from "@/components/user-button";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type React from "react";
import AppSidebar from "./app-sidebar";
import { ThemeButton } from "@/components/theme-button";

type SidebarLayoutProps = {
	children: React.ReactNode;
};

const SidebarLayout = async ({ children }: SidebarLayoutProps) => {
	const session = await getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/signin");
	}

	return (
		<SidebarProvider>
			<AppSidebar />
			<main className="m-2 w-full">
				<div className="flex items-center gap-2 rounded-md border border-sidebar-border bg-sidebar p-2 px-4 shadow">
					<div className="ml-auto flex items-center gap-2">
						<ThemeButton />
						<UserButton user={session?.user} />
					</div>
				</div>
				<div className="h-4" />
				{/* main content */}
				<div className="h-[calc(100vh-6rem)] overflow-y-scroll rounded-md border border-sidebar-border bg-sidebar p-2 shadow">
					{children}
				</div>
			</main>
		</SidebarProvider>
	);
};

export default SidebarLayout;
