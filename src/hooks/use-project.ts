import { api } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";

export const useProjects = () => {
  const { data: projects, isPending } = api.project.getProjects.useQuery();
  const [selectedProjectId, setSelectedProjectId] = useLocalStorage<string | null>("projectId", null);

  const { data: project, isPending: isProjectPending } = api.project.getProjectById.useQuery({
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    id: selectedProjectId!
  }, {
    enabled: !!selectedProjectId
  });

  return {
    projects,
    isPending,
    isProjectPending,
    selectedProjectId,
    setSelectedProjectId,
    project
  }
}
