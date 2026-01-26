import type { CraftedItem, ItemBase, Rarity, RolledCorruptedImplicit, RolledModifier } from "@crafterix/data";

/**
 * Immutable crafting state representing an item at a point in the crafting process.
 */
export class CraftingState {
  constructor(public readonly item: CraftedItem) {}

  static fromBase(base: ItemBase): CraftingState {
    return new CraftingState({
      base,
      rarity: "normal",
      prefixes: [],
      suffixes: [],
      corrupted: false,
    });
  }

  get rarity(): Rarity {
    return this.item.rarity;
  }

  get prefixCount(): number {
    return this.item.prefixes.length;
  }

  get suffixCount(): number {
    return this.item.suffixes.length;
  }

  get maxPrefixes(): number {
    return this.item.base.affixSlots.maxPrefixes;
  }

  get maxSuffixes(): number {
    return this.item.base.affixSlots.maxSuffixes;
  }

  get canAddPrefix(): boolean {
    return this.prefixCount < this.maxPrefixes && !this.item.corrupted;
  }

  get canAddSuffix(): boolean {
    return this.suffixCount < this.maxSuffixes && !this.item.corrupted;
  }

  get isCorrupted(): boolean {
    return this.item.corrupted;
  }

  hasModifier(modifierId: string): boolean {
    return (
      this.item.prefixes.some((m) => m.modifierId === modifierId) ||
      this.item.suffixes.some((m) => m.modifierId === modifierId)
    );
  }

  withRarity(rarity: Rarity): CraftingState {
    return new CraftingState({ ...this.item, rarity });
  }

  withPrefix(mod: RolledModifier): CraftingState {
    if (!this.canAddPrefix) {
      throw new Error("Cannot add prefix: at max or corrupted");
    }
    return new CraftingState({
      ...this.item,
      prefixes: [...this.item.prefixes, mod],
    });
  }

  withSuffix(mod: RolledModifier): CraftingState {
    if (!this.canAddSuffix) {
      throw new Error("Cannot add suffix: at max or corrupted");
    }
    return new CraftingState({
      ...this.item,
      suffixes: [...this.item.suffixes, mod],
    });
  }

  withoutPrefix(index: number): CraftingState {
    const prefixes = this.item.prefixes.filter((_, i) => i !== index);
    return new CraftingState({ ...this.item, prefixes });
  }

  withoutSuffix(index: number): CraftingState {
    const suffixes = this.item.suffixes.filter((_, i) => i !== index);
    return new CraftingState({ ...this.item, suffixes });
  }

  withCorrupted(): CraftingState {
    return new CraftingState({ ...this.item, corrupted: true });
  }

  withCorruptedImplicit(implicit: RolledCorruptedImplicit): CraftingState {
    return new CraftingState({
      ...this.item,
      corrupted: true,
      corruptedImplicit: implicit,
    });
  }

  get corruptedImplicit(): RolledCorruptedImplicit | undefined {
    return this.item.corruptedImplicit;
  }

  clearAffixes(): CraftingState {
    return new CraftingState({
      ...this.item,
      prefixes: [],
      suffixes: [],
    });
  }

  toHash(): string {
    const prefixIds = this.item.prefixes.map((p) => `${p.modifierId}:${p.tier}`).sort();
    const suffixIds = this.item.suffixes.map((s) => `${s.modifierId}:${s.tier}`).sort();
    const implicitId = this.item.corruptedImplicit?.implicitId ?? "";
    return `${this.item.base.id}|${this.rarity}|P:${prefixIds.join(",")}|S:${suffixIds.join(",")}|C:${this.isCorrupted}|I:${implicitId}`;
  }
}
