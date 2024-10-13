import "./App.css";
import CodeEditor from "./components/editor/Editor";
import Output from "./components/output/Output";
import CustomNodeFlow from "./components/Tree/CustomNodeFlow";

function App() {
  return (
    <div className="container">
      <div className="editor-section">
        <CodeEditor />
        <Output />
      </div>
      <div className="display-section">
        <CustomNodeFlow />
      </div>
    </div>
  );
}

export default App;
