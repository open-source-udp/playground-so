import React, { useEffect, useCallback, ChangeEvent } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  Controls,
  Connection,
  Edge,
  Node,
  Position,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
} from "@xyflow/react"; // Asegúrate de que '@xyflow/react' exporta estos tipos
import "@xyflow/react/dist/style.css";

import ColorSelectorNode from "./ColorSelectorNode";

import "./SelectorNode.css";

interface SelectorNodeData {
  color: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  [key: string]: unknown;
}

interface LabelNodeData {
  label: string;
  [key: string]: unknown;
}

type CustomNodeData = SelectorNodeData | LabelNodeData;
type CustomNode = Node<CustomNodeData>;
interface CustomEdge extends Edge {
  animated?: boolean;
  style?: React.CSSProperties;
  sourceHandle?: string;
}

const connectionLineStyle: React.CSSProperties = { stroke: "#fff" };
const snapGrid: [number, number] = [20, 20];
const nodeTypes = {
  selectorNode: ColorSelectorNode,
};
const defaultViewport = { x: 0, y: 0, zoom: 1.5 };

const CustomNodeFlow: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge>([]);
  useEffect(() => {
    const initialNodes: CustomNode[] = [
      {
        id: "1",
        type: "input",
        data: { label: "A" },
        position: { x: 0, y: 50 },
        sourcePosition: Position.Bottom,
      },
      {
        id: "3",
        type: "output",
        data: { label: "B" },
        position: { x: 650, y: 25 },
        targetPosition: Position.Top,
      },
      {
        id: "4",
        type: "output",
        data: { label: "C" },
        position: { x: 650, y: 100 },
        targetPosition: Position.Top,
      },
    ];

    const initialEdges: CustomEdge[] = [
      {
        id: "e1-3",
        source: "1",
        target: "3",
        animated: true,
        style: { stroke: "#fff" },
      },
      {
        id: "e1-4",
        source: "1",
        target: "4",
        animated: true,
        style: { stroke: "#fff" },
      },
    ];

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: "#fff" },
          },
          eds
        )
      ),
    [setEdges]
  );

  return (
    <ReactFlowProvider>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        style={{ backgroundColor: "#262626", width: "100%", height: "100vh" }}
        nodeTypes={nodeTypes}
        connectionLineStyle={connectionLineStyle}
        connectionLineType={ConnectionLineType.SmoothStep}
        snapToGrid={true}
        snapGrid={snapGrid}
        defaultViewport={defaultViewport}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
      </ReactFlow>
    </ReactFlowProvider>
  );
};

export default CustomNodeFlow;
