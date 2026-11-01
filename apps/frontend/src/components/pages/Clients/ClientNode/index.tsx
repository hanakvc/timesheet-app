import { useState } from "react";
import { BuildingIcon } from "@/components/shared/Icons";
import { useClientProjects } from "@/hooks/queries/useClientProjects";
import type { TaskSelection } from "@/interfaces/forms";
import type { Client } from "@/models/client";
import ProjectNode from "../ProjectNode";
import TreeBranch from "../TreeBranch";
import TreeNode from "../TreeNode";

interface ClientNodeProps {
  client: Client;
  onLogTime: (task: TaskSelection) => void;
}

const ClientNode = ({ client, onLogTime }: ClientNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const projects = useClientProjects(client.id, isExpanded);

  return (
    <TreeNode
      icon={<BuildingIcon size={18} />}
      name={client.name}
      id={client.id}
      description={client.description}
      status={client.status}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded((current) => !current)}
    >
      <TreeBranch
        query={projects}
        renderItem={(project) => (
          <ProjectNode
            key={project.id}
            project={project}
            onLogTime={onLogTime}
          />
        )}
      />
    </TreeNode>
  );
};

export default ClientNode;
