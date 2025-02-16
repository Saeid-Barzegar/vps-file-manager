"use client";

import { isEmpty } from "lodash";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ContextMenuInterface, ContextMenuType, FileType } from "./types/types";
import { CONTEXT_MENU_ITEMS } from "./constants/context-menu-items";


export default function Home() {

  const contextInitialValue = {
    show: false,
    position: {
      x: 0,
      y: 0
    }
  };

  const [files, setFiles] = useState<FileType[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("/");
  const [contextMenu, setContextMenu] = useState<ContextMenuInterface>(contextInitialValue);

  const getFileList = (currentPath: string) => {
    fetch(`/api/files?path=${encodeURIComponent(currentPath)}`)
      .then((res) => res.json())
      .then((data) => {
        const { files } = data
        console.log({ files })
        const mainList = files.filter((file: string) => !isEmpty(file) && !file.includes('lrwxrwxrwx') && !file.includes('total'));
        const mappedFiles = mainList.map((file, index) => {
          const fileName = file.split(" ").pop();
          return ({
            id: index + 1,
            name: fileName,
            isFile: file.includes("-rw-r--r--")
          })
        })
        const sorted = mappedFiles.sort((a, b) => a.name > b.name)
        const folders = sorted.filter(file => !file.isFile);
        const _files = sorted.filter(file => file.isFile);
        const finalList = [...folders, ..._files]
        setFiles(finalList ?? [])
      })
      .catch((err) => console.error({ err }));
  }
  useEffect(() => {
    getFileList(currentPath);
  }, [currentPath]);

  // Prevent right-click default behavior
  const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      show: true,
      position: {
        x: event.layerX,
        y: event.layerY
      }
    });
  };

  // Hide menu on click outside
  const handleClick = () => setContextMenu(contextInitialValue);

  useEffect(() => {
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("click", handleClick);
    };
  }, []);

  const onSelectFolderHandler = (pathName: string) => {
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
    setCurrentPath(newPath)
  };

  return (
    <div className="p-5">
      <h1 className="text-xl font-bold">Linux File Manager</h1>
      <input
        type="text"
        value={currentPath}
        onChange={(e) => setCurrentPath(e.target.value)}
        className="border p-2 w-full my-3"
      />
      {contextMenu.show && (
        <ul
          className={`absolute list-none w-48 bg-slate-100 top-4 left-4 rounded-lg py-2`}
          style={{ transform: `translate(${contextMenu.position.x}px, ${contextMenu.position.y}px)` }}
        >
          {CONTEXT_MENU_ITEMS.map((item: ContextMenuType) => (
            <li key={item.id} className="text-sm">
              <button
                className="py-1 px-3 w-full cursor-pointer text-left hover:bg-slate-200"
                onClick={() => console.log(item, "")}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      <ul className="pl-5 list-none">
        {files.map((file: FileType) => (
          <li key={file.id} className="mb-2 pl-2">
            <button
              className={`flex ${!file.isFile && 'cursor-pointer'}`}
              onClick={() => !file.isFile && onSelectFolderHandler(file.name)}>
              {file.isFile
                ? <Image src="/file.svg" width={20} height={20} alt="file_icon" />
                : <Image src="/flat_folder.svg" width={20} height={20} alt="folder_icon" />
              }
              <span className={'ml-2'}>{file.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
