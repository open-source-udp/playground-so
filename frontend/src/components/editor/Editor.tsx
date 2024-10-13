// CodeEditor.tsx
import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import "./Editor.css"; // Asegúrate de importar el CSS

function CodeEditor() {
  const placeholder = `#include <iostream>
using namespace std;

int main() {
  cout << "Hello, World!";
  return 0;
}`;

  const [value, setValue] = React.useState(placeholder);

  const onChange = React.useCallback((val: string) => {
    console.log("val:", val);
    setValue(val);
  }, []);

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
    </div>
  );
}

export default CodeEditor;
