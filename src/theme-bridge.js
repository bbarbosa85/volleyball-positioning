// @ts-check
import themes from 'daisyui/theme/object.js';

/**
 * @typedef {Object} ThemeBridgeOptions
 * @property {string} [light]
 * @property {string} [dark]
 */

/**
 * @param {ThemeBridgeOptions} [options]
 */
export default function themeBridge(options = {}) {
  const lightTheme = options.light || 'bumblebee';
  const darkTheme = options.dark || 'business';

  /**
   * @param {{ addBase: (rules: Record<string, any>) => void }} api
   */
  return ({ addBase }) => {
    /** @type {Record<string, any>} */
    const allThemes = themes;
    if (allThemes[lightTheme]) {
      addBase({
        '[data-theme="light"]': allThemes[lightTheme],
      });
    }
    if (allThemes[darkTheme]) {
      addBase({
        ':root, [data-theme="dark"]': allThemes[darkTheme],
      });
    }
  };
}

themeBridge.__isOptionsFunction = true;
