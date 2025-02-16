export type ContextMenuType = {
  id: number;
  label: string;
  action: string;
}

export type FileType = {
  id: number;
  name: string;
  isFile: boolean;
}

type PositionType = {
  x: number;
  y: number;
}

export interface ContextMenuInterface {
  show: boolean;
  position: PositionType;
}