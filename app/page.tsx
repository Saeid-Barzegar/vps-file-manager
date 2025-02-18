"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ContextMenuInterface, ContextMenuType, FileType } from "./types/types";
import { CONTEXT_MENU_ITEMS } from "./constants/context-menu-items";
import { directoryChangeHandler, getFileList } from "./helpers/fundtions";

const contextInitialValue = {
  show: false,
  position: { x: 0, y: 0 },
};

export default function Home() {

  const [files, setFiles] = useState<FileType[]>([]);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<string>("/");
  const [contextMenu, setContextMenu] = useState<ContextMenuInterface>(contextInitialValue);
  const [selectedItem, setSelectedItem] = useState<number>(-1);

  useEffect(() => {
    setIsPending(true)
    getFileList(currentPath)
      .then((data: FileType[] | undefined) => {
        setFiles(data || [])
      })
      .finally(() => {
        setIsPending(false)
      });
  }, [currentPath]);

  // Prevent right-click default behavior
  const handleContextMenu = (event: React.MouseEvent<HTMLButtonElement>, fileId: number) => {
    event.preventDefault();
    setSelectedItem(fileId)
    setContextMenu({
      show: true,
      position: {
        x: event.pageX,
        y: event.pageY,
      }
    });
  };

  const handleResetState = () => {
    setContextMenu(contextInitialValue)
    setSelectedItem(-1)
  }

  // Hide menu on click outside
  const handleClick = () => {
    if (contextMenu.show) {
      handleResetState();
    }
  };

  const onSelectFolderHandler = (pathName: string) => {
    const newPath = directoryChangeHandler({ pathName, currentPath });
    setCurrentPath(newPath)
  };

  const handleRename = (filePath: string) => {
    console.log("handleRename >>", { filePath, selectedItem })
    handleResetState();
  };

  const handleMove = (filePath: string) => {
    console.log("handleMove >>", { filePath, selectedItem })
    handleResetState();
  };

  const handleDelete = (filePath: string) => {
    console.log("handleDelete >>", { filePath, selectedItem })
    setContextMenu(contextInitialValue)
    setSelectedItem(-1)
  };

  const handleDownload = (filePath: string) => {
    console.log("handleDownload >>", { filePath, selectedItem })
    setContextMenu(contextInitialValue)
    setSelectedItem(-1)
  };

  return (
    <div className="p-5 z-0">
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
            <li key={item.id} className="text-sm z-50">
              <button
                className="py-1 px-3 w-full cursor-pointer text-left hover:bg-slate-200"
                onClick={() => {
                  switch (item.action) {
                    case "rename":
                      handleRename(currentPath)
                      break;
                    case "move":
                      handleMove(currentPath)
                      break;
                    case "delete":
                      handleDelete(currentPath)
                      break;
                    case "download":
                      handleDownload(currentPath)
                      break;
                    default:
                      break;
                  }
                }}
                onBlur={() => setContextMenu(contextInitialValue)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      {isPending
        ? <p>Loading...</p>
        : (
          <ul className="pl-5 list-none">
            {files.map((file: FileType) => (
              <li key={file.id} className=" pl-2">
                <button
                  className={`flex py-1 px-2 justify-start items-center rounded-md ${!file.isFile && 'cursor-pointer'} ${selectedItem === file.id && 'bg-slate-100'}`}
                  onClick={() => !file.isFile && onSelectFolderHandler(file.name)}
                  onContextMenu={(event: React.MouseEvent<HTMLButtonElement>) => handleContextMenu(event, file.id)}
                >
                  {file.isFile
                    ? <Image src="/file.svg" width={20} height={20} alt="file_icon" />
                    : <Image src="/flat_folder.svg" width={20} height={20} alt="folder_icon" />
                  }
                  <span className={'ml-2'}>{file.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
    </div>
  );
}
