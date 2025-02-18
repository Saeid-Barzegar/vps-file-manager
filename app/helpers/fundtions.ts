import isEmpty from "lodash/isEmpty";
import {
  DirectoryChangeHandlerInputType,
  DirectoryChangeHandlerType,
  FileType,
  GetFileListType
} from "../types/types";

const mapFileList = (fileList: string[]) => {
  const mainList = fileList.filter((file: string) => !isEmpty(file) && !file.includes('lrwxrwxrwx') && !file.includes('total'));
  const mappedFiles: FileType[] = mainList.map((file, index) => {
    const fileName = file.split(" ").pop() ?? "";
    return ({
      id: index + 1,
      name: fileName,
      isFile: file.includes("-rw-r--r--")
    })
  });
  const sorted = mappedFiles.toSorted((a, b) => a.name.localeCompare(b.name))
  const folders = sorted.filter((file: FileType) => !file.isFile);
  const files = sorted.filter((file: FileType) => file.isFile);
  const list = [...folders, ...files];
  return list;
};

export const getFileList: GetFileListType = async (currentPath: string) => {
  try {
    const response = await fetch(`/api/files?path=${encodeURIComponent(currentPath)}`);
    const data = await response.json();
    const rawList = data.files ?? [];
    const mappedList = mapFileList(rawList);
    return mappedList;
  } catch (error) {
    console.error(`Error: getFileList : ${error}`)
  }
};

export const directoryChangeHandler: DirectoryChangeHandlerType = ({ pathName, currentPath }: DirectoryChangeHandlerInputType) => {
  let newPath = `${currentPath}/${pathName}`;
  newPath = newPath.replace("//", "/");
  if (pathName === "." || pathName === "") {
    newPath = "/";
  }
  if (pathName === "..") {
    const pathParts = currentPath.split("/");
    pathParts.pop();
    console.log({ pathName, newPath, pathParts })
    const isRootRoute = pathParts.length === 1;
    newPath = isRootRoute ? "/" : pathParts.join("/");
  }
  return newPath;
};