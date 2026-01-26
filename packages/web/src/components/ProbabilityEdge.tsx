import { useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type Position,
} from "@xyflow/react";
import type { CraftEdge } from "../state/crafting-context";
import { useCrafting } from "../state/crafting-context";
import { isPlaceholderMod } from "@crafterix/data";
import { formatModShort } from "../utils/mod-display";

interface ProbabilityEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  data: {
    edge: CraftEdge;
  };
  markerEnd?: string;
}

export function ProbabilityEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: ProbabilityEdgeProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { getCurrencyName } = useCrafting();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edge = data?.edge;
  if (!edge) return null;

  const probability = (edge.probability * 100).toFixed(1) + "%";
  const currencyName = getCurrencyName(edge.currencyId);

  let changeText = "";
  const isPlaceholder = edge.modAdded && isPlaceholderMod(edge.modAdded.modifierId);
  if (edge.modAdded) {
    changeText = formatModShort(edge.modAdded.modifierId, edge.modAdded.values);
  } else if (edge.modRemoved) {
    changeText = `- ${formatModShort(edge.modRemoved.modifierId, edge.modRemoved.values)}`;
  }

  const changeColor = isPlaceholder ? "text-purple-400 italic" : edge.modAdded ? "text-green-400" : "text-red-400";

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={{ stroke: "#4a4a4a" }} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          <button
            className="bg-poe-bg border border-poe-border rounded px-2 py-1 text-xs text-poe-currency hover:bg-poe-panel transition-colors"
            onClick={() => setShowDetails(!showDetails)}
          >
            {probability}
          </button>

          {/* Details popup */}
          {showDetails && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-10 bg-poe-bg border border-poe-border rounded px-3 py-2 shadow-lg whitespace-nowrap">
              <div className="text-xs text-poe-normal/60 mb-1">{currencyName}</div>
              {changeText && (
                <div className={`text-sm ${changeColor}`}>
                  {changeText}
                </div>
              )}
              <div className="text-xs text-poe-normal/40 mt-1">
                Probability: {probability}
              </div>
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
