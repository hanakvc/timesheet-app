import { useState } from "react";
import Button from "@/components/shared/Button";
import { FolderIcon, PlusIcon, TaskIcon } from "@/components/shared/Icons";
import StatusBadge from "@/components/shared/StatusBadge";
import { Span } from "@/components/styled/Span";
import { useProjectTasks } from "@/hooks/queries/useProjectTasks";
import type { TaskSelection } from "@/interfaces/forms";
import type { Project } from "@/models/project";
import TreeBranch from "../TreeBranch";
import TreeNode from "../TreeNode";
import styles from "./styles.module.scss";

interface ProjectNodeProps {
  project: Project;
  onLogTime: (task: TaskSelection) => void;
}

const ProjectNode = ({ project, onLogTime }: ProjectNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const tasks = useProjectTasks(project.id, isExpanded);

  return (
    <TreeNode
      icon={<FolderIcon size={18} />}
      name={project.name}
      id={project.id}
      status={project.status}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded((current) => !current)}
    >
      <TreeBranch
        query={tasks}
        renderItem={(task) => (
          <li key={task.id} className={styles.task}>
            <div className={styles.taskSection}>
              <div className={styles.taskDetails}>
                <span className={styles.icon}>
                  <TaskIcon size={18} />
                </span>
                <Span className={styles.name}>{task.name}</Span>
                <Span size="xxSmall" textColor="muted">
                  #{task.id}
                </Span>
              </div>
              <span className={styles.logTime}>
                <Button
                  size="small"
                  aria-label={`Log time on ${task.name}`}
                  onClick={() =>
                    onLogTime({
                      clientId: project.clientId,
                      projectId: project.id,
                      taskId: task.id,
                    })
                  }
                >
                  <PlusIcon size={14} />
                  Log time
                </Button>
              </span>
            </div>
            <span className={styles.status}>
              <StatusBadge status={task.status} />
            </span>
          </li>
        )}
      />
    </TreeNode>
  );
};

export default ProjectNode;
