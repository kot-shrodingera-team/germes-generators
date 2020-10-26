import { log, awaiter } from '@kot-shrodingera-team/germes-utils';

const clearCouponGenerator = (options: {
  getStakeCount: () => number;
  apiClear?: () => void;
  clearSingleSelector: string;
  clearAllSelector: string;
  clearMode: 'all-only' | 'one-only' | 'one and all';
  maxUnload?: {
    getMaximumStake: () => number;
  };
  context?: () => Document | Element;
}) => async (): Promise<boolean> => {
  const context = options.context ? options.context() : document;
  const stakeCount = options.getStakeCount();
  if (stakeCount !== 0) {
    log('Купон не пуст. Очищаем', 'orange');
    if (options.apiClear) {
      options.apiClear();
    } else if (options.clearMode === 'all-only') {
      const clearAllButton = context.querySelector(
        options.clearAllSelector
      ) as HTMLElement;
      if (!clearAllButton) {
        log('Не найдена кнопка очистки купона', 'crimson');
        return false;
      }
      clearAllButton.click();
    } else if (options.clearMode === 'one-only') {
      const clearSingleButton = [
        ...context.querySelectorAll(options.clearSingleSelector),
      ] as HTMLElement[];
      if (clearSingleButton.length === 0) {
        log('Не найдены кнопки удаления ставок из купона', 'crimson');
        return false;
      }
      clearSingleButton.forEach((button) => button.click());
    } else if (options.clearMode === 'one and all') {
      if (stakeCount === 1) {
        const clearSingleButton = context.querySelector(
          options.clearSingleSelector
        ) as HTMLElement;
        if (!clearSingleButton) {
          log('Не найдена кнопка удаления ставки из купона', 'crimson');
          return false;
        }
        clearSingleButton.click();
      } else {
        const clearAllButton = context.querySelector(
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
    log('Не удалось очистить купон', 'crimson');
    return false;
  }
  log('Купон пуст', 'steelblue');
  return true;
};

export default clearCouponGenerator;
