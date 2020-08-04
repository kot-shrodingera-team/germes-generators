import { log, awaiter } from '@kot-shrodingera-team/germes-utils';

// eslint-disable-next-line import/prefer-default-export
export const clearCoupon = (options: {
  getStakeCount: () => number;
  clearSingleSelector: string;
  clearAllSelector: string;
  clearMode: 'all-only' | 'one-only' | 'one and all';
  maxUnload?: {
    getMaximumStake: () => number;
  };
}) => async (): Promise<boolean> => {
  const stakeCount = options.getStakeCount();
  if (stakeCount !== 0) {
    log('Купон не пуст. Очищаем', 'orange');
    if (options.clearMode === 'all-only') {
      const clearAllButton = document.querySelector(
        options.clearAllSelector
      ) as HTMLElement;
      if (!clearAllButton) {
        log('Не найдена кнопка очистки купона', 'crimson');
        return false;
      }
      clearAllButton.click();
    } else if (options.clearMode === 'one-only') {
      const clearSingleButton = [
        ...document.querySelectorAll(options.clearSingleSelector),
      ] as HTMLElement[];
      if (clearSingleButton.length === 0) {
        log('Не найдены кнопки удаления ставок из купона', 'crimson');
        return false;
      }
      clearSingleButton.forEach((button) => button.click());
    } else if (options.clearMode === 'one and all') {
      if (stakeCount === 1) {
        const clearSingleButton = document.querySelector(
          options.clearSingleSelector
        ) as HTMLElement;
        if (!clearSingleButton) {
          log('Не найдена кнопка удаления ставки из купона', 'crimson');
          return false;
        }
        clearSingleButton.click();
      } else {
        const clearAllButton = document.querySelector(
          options.clearAllSelector
        ) as HTMLElement;
        if (!clearAllButton) {
          log('Не найдена кнопка очистки купона', 'crimson');
          return false;
        }
        clearAllButton.click();
      }
    }
    const couponCleared = Boolean(
      await awaiter(() => options.getStakeCount() === 0)
    );
    if (couponCleared) {
      log('Купон очищен', 'steelblue');
      if (options.maxUnload) {
        const maxUnloaded = await awaiter(
          () => options.maxUnload.getMaximumStake() === 0
        );
        if (!maxUnloaded) {
          log('Максимум не исчез после очистки купона', 'crimson');
          return false;
        }
      }
      return true;
    }
    return false;
  }
  log('Купон пуст', 'steelblue');
  return true;
};
