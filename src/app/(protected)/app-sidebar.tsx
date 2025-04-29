"use client";

import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects } from "@/hooks/use-project";
import { cn } from "@/lib/utils";
import {
	Bot,
	CreditCard,
	LayoutDashboard,
	Plus,
	Presentation,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SIDEBAR_ITEMS = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: LayoutDashboard,
	},
	{
		title: "Q&A",
		url: "/qa",
		icon: Bot,
	},
	{
		title: "Meetings",
		url: "/meetings",
		icon: Presentation,
	},
	{
		title: "Billing",
		url: "/billing",
		icon: CreditCard,
	},
];

const AppSidebar = () => {
	const { projects, isPending, selectedProjectId, setSelectedProjectId } =
		useProjects();
	const pathname = usePathname();
	const { open } = useSidebar();
	return (
		<Sidebar collapsible="icon" variant="floating">
			<SidebarHeader>
				<div className="flex items-center gap-2">
					<Image
						src="/logo.png"
						alt="logo"
						className="dark:invert"
						width={32}
						height={32}
					/>
					{open && <h1 className="w-fit font-semibold text-lg">GitAI</h1>}
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Application</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{SIDEBAR_ITEMS.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<Link
											href={item.url}
											className={cn(
												pathname === item.url &&
													"bg-primary text-primary-foreground",
												"list-none",
											)}
										>
											<item.icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>Projects</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{isPending && (
								<div className="flex flex-col gap-2">
									<Skeleton className="h-6 w-full rounded-sm" />
									<Skeleton className="h-6 w-full rounded-sm" />
									<Skeleton className="h-6 w-full rounded-sm" />
								</div>
							)}

							{projects?.map((project) => (
								<SidebarMenuItem key={project.name}>
									<SidebarMenuButton asChild>
										<div
											className="flex items-center gap-2"
											onClick={() => {
												setSelectedProjectId(project.id);
												window.location.href = "/dashboard";
											}}
											onKeyDown={(e) => {
												if (e.key === "Enter") setSelectedProjectId(project.id);
											}}
										>
											<div
												className={cn(
													"flex size-6 items-center justify-center rounded-sm border bg-secondary text-primary text-sm",
													selectedProjectId === project.id &&
														"bg-primary text-primary-foreground",
												)}
											>
												{project.name[0]}
											</div>
											{open && (
												<p className="truncate text-sm">{project.name}</p>
											)}
										</div>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
							<div className="h-2" />
							<SidebarMenuItem>
								<Button
									variant={pathname === "/create" ? "default" : "outline"}
									className="w-full"
									asChild
								>
									<Link href="/create">
										<Plus />
										{open && "Create Project"}
									</Link>
								</Button>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
};

export default AppSidebar;
