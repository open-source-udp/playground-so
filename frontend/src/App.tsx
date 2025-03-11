import "./App.css";
import CodeEditor from "./components/editor/Editor";
import Output from "./components/output/Output";
import CustomNodeFlow from "./components/Tree/CustomNodeFlow";
import useProcesos from "./hooks/useProcesos";
import useCode from "./hooks/useCode";
import { useState } from "react";

function App() {
  const code = useCode((state) => state.code);
  const [executedCode, setExecutedCode] = useState<{ [filename: string]: string } | null>(null);
  const { data: procesos } = useProcesos(executedCode);

  const handleRunClick = () => {
    setExecutedCode(code);
  };

  return (
    <div className="container">
      <div className="editor-section">
        <CodeEditor onRunClick={handleRunClick} />
        <Output procesos={procesos} />
      </div>
      <div className="display-section">
        {executedCode ? (
          procesos && !("error" in procesos) ? (
            <CustomNodeFlow procesos={procesos} />
          ) : (
            <p className="placeholder-empty">Error capa 8, no se pueden visulizar los procesos.</p>

          )
        ) : (
          <div>
            <p className="placeholder-empty">Ejecuta código para visualizar los procesos.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
