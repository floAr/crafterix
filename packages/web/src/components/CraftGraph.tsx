import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  type OnNodesChange,
  applyNodeChanges,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCrafting } from "../state/crafting-context";
import { CraftItemNode } from "./CraftItemNode";
import { ProbabilityEdge } from "./ProbabilityEdge";

const nodeTypes: NodeTypes = {
  craftItem: CraftItemNode as any,
};

const edgeTypes: EdgeTypes = {
  probability: ProbabilityEdge as any,
};

export function CraftGraph() {
  const { state, updateNodePosition } = useCrafting();

  // Convert state items to React Flow nodes
  const nodes: Node[] = useMemo(() => {
    return state.items.map((item) => ({
      id: item.id,
      type: "craftItem",
      position: item.position,
      data: { node: item },
    }));
  }, [state.items]);

  // Convert state edges to React Flow edges
  const edges: Edge[] = useMemo(() => {
    return state.edges.map((edge) => ({
      id: edge.id,
      source: edge.sourceId,
      target: edge.targetId,
      type: "probability",
      data: { edge },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "#4a4a4a",
      },
    }));
  }, [state.edges]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      // Apply changes locally and update positions
      const updatedNodes = applyNodeChanges(changes, nodes);

      for (const change of changes) {
        if (change.type === "position" && change.position) {
          updateNodePosition(change.id, change.position);
        }
      }

      return updatedNodes;
    },
    [nodes, updateNodePosition]
  );

  if (!state.base) {
    return (
      <div className="h-full flex items-center justify-center text-poe-normal/50 border border-poe-border rounded bg-poe-panel/30">
        <p>Select an item base to start crafting</p>
      </div>
    );
  }

  return (
    <div className="h-full border border-poe-border rounded bg-poe-panel/10">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2}
        defaultEdgeOptions={{
          animated: false,
        }}
      >
        <Background color="#2a2a2a" gap={20} />
        <Controls className="[&>button]:bg-poe-panel [&>button]:border-poe-border [&>button]:text-poe-normal" />
      </ReactFlow>
    </div>
  );
}
