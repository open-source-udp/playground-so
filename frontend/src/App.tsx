import "./App.css";
import CodeEditor from "./components/editor/Editor";
import Output from "./components/output/Output";
import CustomNodeFlow from "./components/Tree/CustomNodeFlow";
import useProcesos from "./hooks/useProcesos";
import useCode from "./hooks/useCode";
import { useState } from "react";

function App() {
  const code = useCode((state) => state.code);
  const [runCode, setRunCode] = useState(false); // Estado para controlar cuándo ejecutar el código
  const { data: procesos } = useProcesos(runCode ? code : null); // Solo ejecuta cuando runCode es true

  const handleRunClick = () => {
    setRunCode(true);
  };

  return (
    <>
      <div className="container">
        <div className="editor-section">
          <CodeEditor onRunClick={handleRunClick} /> {/* Pasa la función de clic */}
          <Output procesos={procesos} />
        </div>
        <div className="display-section">
          <CustomNodeFlow procesos={procesos} />
        </div>
      </div>
    </>
  );
}

export default App;
