import React from "react";
import { Handle, Position } from "@xyflow/react"; 

interface CustomProcessNodeProps {
  data: {
    pid: string;
  };
}

const CustomProcessNode: React.FC<CustomProcessNodeProps> = ({ data }) => {
  return (
    <div className="custom-process-node">
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#555" }}
      />
      <div className="node-content">{data.pid}</div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#555" }}
      />
    </div>
  );
};

export default CustomProcessNode;
