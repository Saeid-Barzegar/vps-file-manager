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

export type GetFileListType = (currentPath: string) => Promise<FileType[] | undefined>;
export type DirectoryChangeHandlerInputType = {
  pathName: string;
  currentPath: string;
};

export type DirectoryChangeHandlerType = (paths: DirectoryChangeHandlerInputType) => string;