import { useCrafting } from "../state/crafting-context";

export function BasePicker() {
  const { items, state, selectBase } = useCrafting();

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-poe-normal/70 uppercase tracking-wide">
        Item Base
      </h3>
      <select
        className="w-full bg-poe-panel border border-poe-border rounded px-3 py-2 text-poe-normal focus:outline-none focus:border-poe-magic"
        value={state.base?.id ?? ""}
        onChange={(e) => {
          const item = items.find((i) => i.id === e.target.value);
          if (item) selectBase(item);
        }}
      >
        <option value="">Select a base...</option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name} (iLvl {item.itemLevel})
          </option>
        ))}
      </select>
    </div>
  );
}
