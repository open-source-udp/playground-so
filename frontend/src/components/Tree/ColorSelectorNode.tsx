import React, { memo, ChangeEvent } from "react";
import { Handle, Position } from "@xyflow/react";

// Definimos la interfaz para las propiedades del componente
interface CustomColorPickerNodeProps {
  data: {
    color: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  };
  isConnectable: boolean;
}

// Definimos el componente utilizando React.FC y la interfaz de propiedades
const CustomColorPickerNode: React.FC<CustomColorPickerNodeProps> = ({
  data,
  isConnectable,
}) => {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#555" }}
        onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      />
      <div>
        Custom Color Picker Node: <strong>{data.color}</strong>
      </div>
      <input
        className="nodrag"
        type="color"
        onChange={data.onChange}
        defaultValue={data.color}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="a"
        style={{ top: 10, background: "#555" }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="b"
        style={{ bottom: 10, top: "auto", background: "#555" }}
        isConnectable={isConnectable}
      />
    </>
  );
};

// Exportamos el componente memoizado para optimizar el rendimiento
export default memo(CustomColorPickerNode);
