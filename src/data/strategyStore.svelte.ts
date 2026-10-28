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
  nameError = $state<string | null>(null);
  liveTargetOverride = $state<CourtPosition | null>(null);

  // Shared read-only link mode
  isSharedMode = $state<boolean>(false);
  sharedTitle = $state<string | null>(null);

  constructor() {
    this.strategies = loadAllStrategies();
    const savedActiveId = getActiveStrategyId();
    const exists = this.strategies.some(s => s.id === savedActiveId);
    this.activeStrategyId = exists ? savedActiveId : (this.strategies[0]?.id || '');
  }

  // Whether there is an active strategy or a draft being authored
  hasActiveOrDraft = $derived(this.strategies.length > 0 || this.draft !== null);

  // Active strategy in view mode (falls back to a default object for safe derived bindings when empty)
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
    const base = strategyToScenario(this.currentStrategy);
    if (!this.draft && this.liveTargetOverride) {
      return {
        ...base,
        targetX: this.liveTargetOverride.x,
        targetY: this.liveTargetOverride.y
      };
    }
    return base;
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
      this.liveTargetOverride = null;
      if (!this.isSharedMode) {
        setActiveStrategyId(id);
      }
    }
  }

  setVisiblePhase(phase: 'base' | 'defense') {
    this.visiblePhase = phase;
  }

  startNewStrategy() {
    if (this.isSharedMode) return;
    const initialRotation = this.strategies.length > 0 ? this.activeStrategy.rotation : 1;
    const newDraft = createDefaultStrategy(
      `strat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      '',
      initialRotation
    );
    this.nameError = null;
    this.liveTargetOverride = null;
    this.draft = newDraft;
  }

  startEdit(id?: string) {
    if (this.isSharedMode) return;
    const targetId = id || this.activeStrategyId;
    const target = this.strategies.find(s => s.id === targetId);
    if (!target) return;
    this.nameError = null;
    this.liveTargetOverride = null;
    this.draft = JSON.parse(JSON.stringify(target));
  }

  cancelEdit() {
    this.nameError = null;
    this.liveTargetOverride = null;
    this.draft = null;
  }

  saveDraft(): boolean {
    if (this.isSharedMode || !this.draft) return false;
    const trimmedName = this.draft.name.trim();
    if (!trimmedName) {
      this.nameError = 'Strategy name is required.';
      return false;
    }

    const isDuplicate = this.strategies.some(
      s => s.id !== this.draft!.id && s.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      this.nameError = 'This name is already in use by another strategy.';
      return false;
    }

    this.nameError = null;
    const saved: Strategy = {
      ...JSON.parse(JSON.stringify(this.draft)),
      name: trimmedName
    };
    this.strategies = saveStrategy(saved);
    this.activeStrategyId = saved.id;
    setActiveStrategyId(saved.id);
    this.draft = null;
    return true;
  }

  saveDraftAsNew(): boolean {
    if (this.isSharedMode || !this.draft) return false;
    const trimmedName = this.draft.name.trim();
    if (!trimmedName) {
      this.nameError = 'Strategy name is required.';
      return false;
    }

    const isDuplicate = this.strategies.some(
      s => s.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      this.nameError = 'This name is already in use by another strategy.';
      return false;
    }

    this.nameError = null;
    const newId = `strat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const cloned: Strategy = {
      ...JSON.parse(JSON.stringify(this.draft)),
      id: newId,
      name: trimmedName
    };
    this.strategies = saveStrategy(cloned);
    this.activeStrategyId = newId;
    setActiveStrategyId(newId);
    this.draft = null;
    return true;
  }

  deleteStrategy(id: string) {
    if (this.isSharedMode) return;
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
    if (this.isSharedMode || this.isEditing) return;
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
    if (updates.name !== undefined) {
      this.nameError = null;
    }
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
    if (!this.draft) {
      // In read mode (normal or shared), allow live target dragging
      if (updates.targetX !== undefined || updates.targetY !== undefined) {
        const currentTarget = this.liveTargetOverride || this.activeStrategy.target;
        this.liveTargetOverride = {
          x: updates.targetX ?? currentTarget.x,
          y: updates.targetY ?? currentTarget.y
        };
      }
      return;
    }
    if (updates.setterX !== undefined) this.draft.setter.x = updates.setterX;
    if (updates.setterY !== undefined) this.draft.setter.y = updates.setterY;
    if (updates.attackerX !== undefined) this.draft.attacker.x = updates.attackerX;
    if (updates.attackerY !== undefined) this.draft.attacker.y = updates.attackerY;
    if (updates.targetX !== undefined) this.draft.target.x = updates.targetX;
    if (updates.targetY !== undefined) this.draft.target.y = updates.targetY;
  }

  // Shared Link Isolation & Import Actions
  enterSharedMode(sharedStrategies: Strategy[], title?: string) {
    if (!sharedStrategies || sharedStrategies.length === 0) return;
    this.isSharedMode = true;
    this.sharedTitle = title || null;
    this.draft = null;
    this.strategies = sharedStrategies;
    this.activeStrategyId = sharedStrategies[0].id;
  }

  copySelectedSharedToMyBoard(selectedIds: string[]) {
    const selected = this.strategies.filter(s => selectedIds.includes(s.id));
    const withFreshIds: Strategy[] = selected.map(s => ({
      ...JSON.parse(JSON.stringify(s)),
      id: `strat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    }));

    const localStrategies = loadAllStrategies();
    const merged = [...localStrategies, ...withFreshIds];
    saveAllStrategies(merged);

    this.isSharedMode = false;
    this.sharedTitle = null;
    this.draft = null;
    this.strategies = merged;

    const nextActiveId = withFreshIds[0]?.id || merged[0]?.id || '';
    this.activeStrategyId = nextActiveId;
    setActiveStrategyId(nextActiveId);

    window.history.replaceState(null, '', window.location.pathname);
  }

  exitSharedModeToMyBoard() {
    const localStrategies = loadAllStrategies();
    const savedActiveId = getActiveStrategyId();
    const exists = localStrategies.some(s => s.id === savedActiveId);

    this.isSharedMode = false;
    this.sharedTitle = null;
    this.draft = null;
    this.strategies = localStrategies;
    this.activeStrategyId = exists ? savedActiveId : (localStrategies[0]?.id || '');

    window.history.replaceState(null, '', window.location.pathname);
  }
}

export const strategyStore = new StrategyStore();
