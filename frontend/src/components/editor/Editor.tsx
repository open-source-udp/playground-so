import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import useCode from "../../hooks/useCode";
import * as Tabs from "@radix-ui/react-tabs";
import "./Editor.css";
import { PlusIcon } from "@radix-ui/react-icons";

interface CodeEditorProps {
  onRunClick: () => void;
}

function CodeEditor({ onRunClick }: CodeEditorProps) {
  const { code, setCode, addFile, removeFile } = useCode();
  const [activeTab, setActiveTab] = useState("main.cpp");
  const [newFilename, setNewFilename] = useState("");

  const onChange = (val: string) => {
    setCode(activeTab, val);
  };

  const handleAddFile = () => {
    if (newFilename && !code[newFilename]) {
      addFile(newFilename, "");
      setActiveTab(newFilename);
      setNewFilename("");
    }
  };

  const handleRemoveFile = (filename: string) => {
    if (filename === "main.cpp") return;
    removeFile(filename);
    if (activeTab === filename) {
      setActiveTab("main.cpp");
    }
  };

  const isRunDisabled = !code["main.cpp"] || code["main.cpp"].trim() === "";

  return (
    <div className="custom-scrollbar">
      <Tabs.Root value={activeTab} onValueChange={(value) => setActiveTab(value)}>
        <Tabs.List className="tabs">
          {Object.keys(code).map((filename) => (
            <Tabs.Trigger
              key={filename}
              value={filename}
              className={`tab ${activeTab === filename ? "active" : ""}`}
            >
              {filename}
              {filename !== "main.cpp" && (
                <button
                  className="close-tab"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(filename);
                  }}
                >
                  x
                </button>
              )}
            </Tabs.Trigger>
          ))}
          <div className="add-tab">
            <input
              type="text"
              placeholder="Nombre del archivo"
              value={newFilename}
              onChange={(e) => setNewFilename(e.target.value)}
            />
            <button onClick={handleAddFile}><PlusIcon className="h-10 w-10"/></button>
          </div>
        </Tabs.List>
      </Tabs.Root>
      <CodeMirror
        value={code[activeTab] || ""}
        height="70vh"
        style={{
          fontSize: 14,
          position: "relative",
          top: 0,
          left: 0,
          width: "100%",
        }}
        extensions={[cpp()]}
        onChange={onChange}
        theme={vscodeDark}
      />
      <div className="button-container">
      <button
        onClick={onRunClick}
        disabled={isRunDisabled}
        className="run-button"
      >
        Run
      </button>
      </div>
    </div>
  );
}

export default CodeEditor;
