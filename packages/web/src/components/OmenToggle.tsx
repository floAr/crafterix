import type { Omen } from "@crafterix/data";

interface OmenToggleProps {
  omen: Omen;
  isActive: boolean;
  onToggle: () => void;
}

export function OmenToggle({ omen, isActive, onToggle }: OmenToggleProps) {
  const shortName = omen.name.replace("Omen of ", "");

  return (
    <button
      onClick={onToggle}
      className={`
        w-full text-left px-2 py-1.5 rounded border text-xs transition-colors
        ${
          isActive
            ? "bg-poe-unique/20 border-poe-unique text-poe-unique"
            : "bg-poe-panel border-poe-border/50 text-poe-normal/70 hover:border-poe-unique/50"
        }
      `}
      title={omen.description}
    >
      <div className="flex items-center gap-2">
        <span
          className={`w-3 h-3 rounded-sm border ${
            isActive
              ? "bg-poe-unique border-poe-unique"
              : "border-poe-normal/40"
          }`}
        />
        <span className="truncate">{shortName}</span>
      </div>
    </button>
  );
}
