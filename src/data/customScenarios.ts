import type { AttackScenario } from '../types/volleyball';

const CUSTOM_SCENARIOS_STORAGE_KEY = 'volleyball_custom_adjustments_v1';

export function loadCustomScenarios(): AttackScenario[] {
  try {
    const raw = localStorage.getItem(CUSTOM_SCENARIOS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load custom attack scenarios from localStorage', err);
  }
  return [];
}

export function saveCustomScenario(scenario: AttackScenario): AttackScenario[] {
  try {
    const existing = loadCustomScenarios();
    const index = existing.findIndex(s => s.id === scenario.id);
    if (index >= 0) {
      existing[index] = scenario;
    } else {
      existing.push(scenario);
    }
    localStorage.setItem(CUSTOM_SCENARIOS_STORAGE_KEY, JSON.stringify(existing));
    return existing;
  } catch (err) {
    console.warn('Failed to save custom scenario to localStorage', err);
    return [];
  }
}

export function deleteCustomScenario(scenarioId: string): AttackScenario[] {
  try {
    const existing = loadCustomScenarios();
    const filtered = existing.filter(s => s.id !== scenarioId);
    localStorage.setItem(CUSTOM_SCENARIOS_STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (err) {
    console.warn('Failed to delete custom scenario from localStorage', err);
    return [];
  }
}
