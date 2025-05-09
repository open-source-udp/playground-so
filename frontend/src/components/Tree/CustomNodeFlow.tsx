/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useCallback, useRef } from "react";
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
  ReactFlowInstance,
} from "@xyflow/react"; import "@xyflow/react/dist/style.css";

import CustomProcessNode from "./CustomProcessNode";
import "./CustomProcessNode.css";
import { ListaProcesos } from "../../types/process";

interface CustomNodeData {
  pid: string;
  [key: string]: unknown;
}

type CustomNode = Node<CustomNodeData>;

interface CustomEdge extends Edge {
  animated?: boolean;
  style?: React.CSSProperties;
  sourceHandle?: string;
}

interface CustomNodeFlowProps {
  procesos: ListaProcesos;
}

const connectionLineStyle: React.CSSProperties = { stroke: "#fff" };
const snapGrid: [number, number] = [20, 20];
const nodeTypes = {
  customProcessNode: CustomProcessNode,
};
const defaultViewport = { x: 0, y: 0, zoom: 1.5 };





const CustomNodeFlow: React.FC<CustomNodeFlowProps> = ({ procesos }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge>([]);

  // Crear referencias
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance<CustomNode, CustomEdge> | null>(null);

  useEffect(() => {
    const generateFlow = (data: any[]) => {
      const newNodes: CustomNode[] = [];
      const newEdges: CustomEdge[] = [];
      const ySpacing = 150;
      const xSpacing = 150;
      let currentX = 0;

      const processNode = (
        node: any,
        parentId: string | null,
        depth: number
      ): number => {
        let subtreeWidth = 0;

        if (node.process && node.process.length > 0) {
          node.process.forEach((child: any) => {
            subtreeWidth += processNode(child, node.pid.toString(), depth + 1);
          });
        } else {
          subtreeWidth = 1;
        }

        const positionX = currentX * xSpacing;
        currentX += subtreeWidth;

        const nodeX =
          node.process && node.process.length > 0
            ? positionX -
              (subtreeWidth * xSpacing) / 2 +
              (subtreeWidth * xSpacing) / 2
            : positionX;

        const nodeId = node.pid.toString();
        const nodeLabel = node.pid.toString();

        newNodes.push({
          id: nodeId,
          type: "customProcessNode",
          data: { pid: nodeLabel },
          position: { x: nodeX, y: depth * ySpacing },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        });

        if (parentId) {
          newEdges.push({
            id: `e${parentId}-${nodeId}`,
            source: parentId,
            target: nodeId,
            animated: false,
            style: { stroke: "#666666" },
          });
        }

        return subtreeWidth;
      };

      data.forEach((rootNode) => {
        processNode(rootNode, null, 0);
      });

      return { newNodes, newEdges };
    };

    console.log(procesos)
    if (Array.isArray(procesos)) {
      const { newNodes, newEdges } = generateFlow(procesos);
      setNodes(newNodes);
      setEdges(newEdges);
    } else {
      console.log("LOS PROC", procesos)
      console.error("Error: procesos no es un arreglo", procesos);
    }

    if (reactFlowInstance.current) {
      reactFlowInstance.current.fitView({ padding: 0.2 });
    }
  }, [procesos, setNodes, setEdges]);

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
    <div ref={reactFlowWrapper} style={{ width: "100%", height: "100vh" }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          style={{ backgroundColor: "#262626", width: "100%", height: "100%" }}
          nodeTypes={nodeTypes}
          connectionLineStyle={connectionLineStyle}
          connectionLineType={ConnectionLineType.SmoothStep}
          snapToGrid={true}
          snapGrid={snapGrid}
          defaultViewport={defaultViewport}
          fitView
          attributionPosition="bottom-left"
          onInit={(instance) => {
            reactFlowInstance.current = instance;
            instance.fitView({ padding: 0.2 });
          }}
        >
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default CustomNodeFlow;