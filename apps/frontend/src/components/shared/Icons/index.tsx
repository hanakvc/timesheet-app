import type { ComponentType, SVGProps } from "react";
import AlertSvg from "@/assets/icons/alert.svg";
import ArrowDownSvg from "@/assets/icons/arrow-down.svg";
import ArrowUpSvg from "@/assets/icons/arrow-up.svg";
import BuildingSvg from "@/assets/icons/building.svg";
import CheckCircleSvg from "@/assets/icons/check-circle.svg";
import ChevronDownSvg from "@/assets/icons/chevron-down.svg";
import ChevronLeftSvg from "@/assets/icons/chevron-left.svg";
import ChevronRightSvg from "@/assets/icons/chevron-right.svg";
import ClockSvg from "@/assets/icons/clock.svg";
import CloseSvg from "@/assets/icons/close.svg";
import FolderSvg from "@/assets/icons/folder.svg";
import PencilSvg from "@/assets/icons/pencil.svg";
import PlusSvg from "@/assets/icons/plus.svg";
import SpinnerSvg from "@/assets/icons/spinner.svg";
import TaskSvg from "@/assets/icons/task.svg";
import TrashSvg from "@/assets/icons/trash.svg";

type SvgComponent = ComponentType<SVGProps<SVGSVGElement>>;
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function createIcon(Svg: SvgComponent) {
  return function Icon({ size = 18, ...props }: IconProps) {
    return <Svg aria-hidden="true" width={size} height={size} {...props} />;
  };
}

export const AlertIcon = createIcon(AlertSvg);
export const ArrowDownIcon = createIcon(ArrowDownSvg);
export const ArrowUpIcon = createIcon(ArrowUpSvg);
export const BuildingIcon = createIcon(BuildingSvg);
export const CheckCircleIcon = createIcon(CheckCircleSvg);
export const ChevronDownIcon = createIcon(ChevronDownSvg);
export const ChevronLeftIcon = createIcon(ChevronLeftSvg);
export const ChevronRightIcon = createIcon(ChevronRightSvg);
export const ClockIcon = createIcon(ClockSvg);
export const CloseIcon = createIcon(CloseSvg);
export const FolderIcon = createIcon(FolderSvg);
export const PencilIcon = createIcon(PencilSvg);
export const PlusIcon = createIcon(PlusSvg);
export const SpinnerIcon = createIcon(SpinnerSvg);
export const TaskIcon = createIcon(TaskSvg);
export const TrashIcon = createIcon(TrashSvg);
