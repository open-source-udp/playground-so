/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import useCode from "../../hooks/useCode";
import "./Editor.css";

function CodeEditor({ onRunClick } : { onRunClick: () => void }) {
  const setCode = useCode((state) => state.setCode);
  const [value, setValue] = React.useState(``);

  const onChange = (val: any) => {
    setValue(val);
    setCode(val);
  };

  return (
    <div className="custom-scrollbar">
      <CodeMirror
        value={value}
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
      <button onClick={onRunClick} style={{ padding: "10px", width: '100%', borderRadius: '0px' }}>Run</button>
    </div>
  );
}

export default CodeEditor;
