import "./App.css";
import CodeEditor from "./components/Editor";
import CustomNodeFlow from "./components/Tree/CustomNodeFlow";

function App() {
  return (
    <div className="container">
      <div className="editor-section">
        <CodeEditor />
      </div>
      <div className="display-section">
        <div className="display" />
        <CustomNodeFlow />
      </div>
    </div>
  );
}

export default App;
