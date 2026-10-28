import type { Strategy, Zone, CourtPosition } from '../types/volleyball';
import {
  loadAllStrategies,
  saveStrategy,
  deleteStrategy as deleteStrategyFromRegistry,
  duplicateStrategy as duplicateStrategyFromRegistry,
  getActiveStrategyId,
  setActiveStrategyId,
  saveAllStrategies
} from './strategyRegistry';
import { createDefaultStrategy, DEFAULT_DEFENDERS } from './defaultLayout';
import { strategyToMovements, strategyToScenario, getRosterForRotation } from './strategyAdapter';

class StrategyStore {
  strategies = $state<Strategy[]>([]);
  activeStrategyId = $state<string>('');
  visiblePhase = $state<'base' | 'defense'>('base');
  draft = $state<Strategy | null>(null);

  constructor() {
    this.strategies = loadAllStrategies();
    const savedActiveId = getActiveStrategyId();
    const exists = this.strategies.some(s => s.id === savedActiveId);
    this.activeStrategyId = exists ? savedActiveId : (this.strategies[0]?.id || '');
  }

  // Active strategy in view mode
  activeStrategy = $derived.by(() => {
    return this.strategies.find(s => s.id === this.activeStrategyId) || this.strategies[0] || createDefaultStrategy();
  });

  // Current strategy being viewed or authored
  currentStrategy = $derived.by(() => {
    return this.draft || this.activeStrategy;
  });

  isEditing = $derived(this.draft !== null);

  // Dirty tracking for edit mode
  isDirty = $derived.by(() => {
    if (!this.draft) return false;
    const original = this.strategies.find(s => s.id === this.draft!.id);
    if (!original) {
      // New strategy draft: dirty if name provided or positions changed
      return (
        this.draft.name.trim() !== '' ||
        (this.draft.description || '').trim() !== ''
      );
    }
    return JSON.stringify(this.draft) !== JSON.stringify(original);
  });

  // Derived court movements and opponent scenario
  movements = $derived.by(() => {
    return strategyToMovements(this.currentStrategy);
  });

  scenario = $derived.by(() => {
    return strategyToScenario(this.currentStrategy);
  });

  roster = $derived.by(() => {
    return getRosterForRotation(this.currentStrategy.rotation);
  });

  // Actions
  selectStrategy(id: string) {
    if (this.isEditing) return;
    const exists = this.strategies.find(s => s.id === id);
    if (exists) {
      this.activeStrategyId = id;
      setActiveStrategyId(id);
    }
  }

  setVisiblePhase(phase: 'base' | 'defense') {
    this.visiblePhase = phase;
  }

  startNewStrategy() {
    const newDraft = createDefaultStrategy(
      `strat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      '',
      this.activeStrategy.rotation
    );
    this.draft = newDraft;
  }

  startEdit(id?: string) {
    const targetId = id || this.activeStrategyId;
    const target = this.strategies.find(s => s.id === targetId) || this.activeStrategy;
    // Deep clone into draft
    this.draft = JSON.parse(JSON.stringify(target));
  }

  cancelEdit() {
    this.draft = null;
  }

  saveDraft(): boolean {
    if (!this.draft || !this.draft.name.trim()) return false;
    const saved = JSON.parse(JSON.stringify(this.draft));
    this.strategies = saveStrategy(saved);
    this.activeStrategyId = saved.id;
    setActiveStrategyId(saved.id);
    this.draft = null;
    return true;
  }

  saveDraftAsNew(): boolean {
    if (!this.draft || !this.draft.name.trim()) return false;
    const newId = `strat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const cloned: Strategy = {
      ...JSON.parse(JSON.stringify(this.draft)),
      id: newId
    };
    this.strategies = saveStrategy(cloned);
    this.activeStrategyId = newId;
    setActiveStrategyId(newId);
    this.draft = null;
    return true;
  }

  deleteStrategy(id: string) {
    if (this.isEditing && this.draft?.id === id) {
      this.cancelEdit();
    }
    this.strategies = deleteStrategyFromRegistry(id);
    if (!this.strategies.some(s => s.id === this.activeStrategyId)) {
      const nextId = this.strategies[0]?.id || '';
      this.activeStrategyId = nextId;
      setActiveStrategyId(nextId);
    }
  }

  duplicateStrategy(id: string) {
    if (this.isEditing) return;
    const res = duplicateStrategyFromRegistry(id);
    this.strategies = res.strategies;
    if (res.cloned) {
      this.activeStrategyId = res.cloned.id;
      setActiveStrategyId(res.cloned.id);
    }
  }

  resetPhaseToDefault(phase: 'base' | 'defense') {
    if (!this.draft) return;
    if (phase === 'base') {
      this.draft.base.defenders = { ...DEFAULT_DEFENDERS };
    } else {
      this.draft.defense.defenders = { ...DEFAULT_DEFENDERS };
    }
  }

  updateDraft(updates: Partial<Strategy>) {
    if (!this.draft) return;
    Object.assign(this.draft, updates);
  }

  updateDefenderPosition(zone: Zone, pos: CourtPosition, isDefense: boolean) {
    if (!this.draft) return;
    if (isDefense) {
      this.draft.defense.defenders[zone] = { ...pos };
    } else {
      this.draft.base.defenders[zone] = { ...pos };
    }
  }

  updateOpponentScenario(updates: {
    setterX?: number;
    setterY?: number;
    attackerX?: number;
    attackerY?: number;
    targetX?: number;
    targetY?: number;
  }) {
    if (!this.draft) return;
    if (updates.setterX !== undefined) this.draft.setter.x = updates.setterX;
    if (updates.setterY !== undefined) this.draft.setter.y = updates.setterY;
    if (updates.attackerX !== undefined) this.draft.attacker.x = updates.attackerX;
    if (updates.attackerY !== undefined) this.draft.attacker.y = updates.attackerY;
    if (updates.targetX !== undefined) this.draft.target.x = updates.targetX;
    if (updates.targetY !== undefined) this.draft.target.y = updates.targetY;
  }

  importSharedStrategies(imported: Strategy[]) {
    if (!imported || imported.length === 0) return;
    const withFreshIds = imported.map(s => ({
      ...JSON.parse(JSON.stringify(s)),
      id: `strat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    }));
    this.strategies = [...this.strategies, ...withFreshIds];
    saveAllStrategies(this.strategies);
    if (withFreshIds[0]) {
      this.activeStrategyId = withFreshIds[0].id;
      setActiveStrategyId(withFreshIds[0].id);
    }
  }
}

export const strategyStore = new StrategyStore();
