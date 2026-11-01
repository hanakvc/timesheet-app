import { useId, type ReactNode } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@/components/shared/Icons";
import StatusBadge from "@/components/shared/StatusBadge";
import { Span } from "@/components/styled/Span";
import styles from "./styles.module.scss";

interface TreeNodeProps {
  icon: ReactNode;
  name: string;
  id: number;
  description?: string;
  status: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}

const TreeNode = ({
  icon,
  name,
  id,
  description,
  status,
  isExpanded,
  onToggle,
  children,
}: TreeNodeProps) => {
  const childrenId = useId();

  return (
    <li className={styles.node}>
      <button
        type="button"
        className={styles.row}
        aria-expanded={isExpanded}
        aria-controls={isExpanded ? childrenId : undefined}
        onClick={onToggle}
      >
        <span className={styles.chevron}>
          {isExpanded ? (
            <ChevronDownIcon size={16} />
          ) : (
            <ChevronRightIcon size={16} />
          )}
        </span>
        <span className={styles.icon}>{icon}</span>
        <Span weight="medium" className={styles.name}>
          {name}
        </Span>
        <Span size="xxSmall" textColor="muted" className={styles.id}>
          #{id}
        </Span>
        {description && (
          <span className={styles.description} title={description}>
            <Span size="xSmall" textColor="secondary">
              {description}
            </Span>
          </span>
        )}
        <span className={styles.status}>
          <StatusBadge status={status} />
        </span>
      </button>

      {isExpanded && (
        <ul id={childrenId} className={styles.children}>
          {children}
        </ul>
      )}
    </li>
  );
};

export default TreeNode;
