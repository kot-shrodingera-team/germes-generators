import { log, awaiter, fireEvent } from '@kot-shrodingera-team/germes-utils';

/**
 * Опции генератора функции очистки купона
 */
interface ClearCouponGeneratorOptions {
  /**
   * Функция проверки перед очисткой
   *
   * Если вернёт false, очистка считается не успешной
   */
  preCheck?: () => Promise<boolean>;
  /**
   * Функция получения количеста ставок в купоне
   */
  getStakeCount: () => number;
  /**
   * Функция очистки купона по Api
   */
  apiClear?: () => void;
  /**
   * Селектор элемента удаления одной ставки из купона
   */
  clearSingleSelector?: string;
  /**
   * Селектор элемента очистки всего купона
   */
  clearAllSelector?: string;
  /**
   * Функция проверки после очистки
   *
   * Если вернёт false, очистка считается не успешной
   */
  postCheck?: () => Promise<boolean>;
  /**
   * Функция, возвращающая контекст для поиска элементов DOM, по умолчанию document
   */
  context?: () => Document | Element;
}

/**
 * Генератор функции очистки купона
 *
 * Проверяет, что купон пуст, если нет, очищает купон
 * - Если есть apiClear, используется эта функция
 * - Если в купоне 1 ставка:
 * -- Используется clearSingleSelector, если определён, иначе clearAllSelector
 * - Если в купоне 1+ ставок:
 * -- Используется clearAllSelector, если определён, иначе clearSingleSelector (для каждой ставки)
 * @returns Асинхронная функция, которая возвращает true, если очистка купона успешна, иначе false
 */
const clearCouponGenerator = (
  options: ClearCouponGeneratorOptions
) => async (): Promise<boolean> => {
  if (
    !options.apiClear &&
    !options.clearSingleSelector &&
    !options.clearAllSelector
  ) {
    log('Ошибка функции очистки купона. Обратитесь в ТП', 'crimson');
    return false;
  }
  if (options.preCheck) {
    const result = await options.preCheck();
    if (!result) {
      return false;
    }
  }
  const context = options.context ? options.context() : document;
  const stakeCount = options.getStakeCount();
  if (stakeCount !== 0) {
    log('Купон не пуст. Очищаем', 'orange');
    if (options.apiClear) {
      options.apiClear();
    } else if (stakeCount === 1) {
      if (options.clearSingleSelector) {
        const clearSingleButton = context.querySelector<HTMLElement>(
          options.clearSingleSelector
        );
        if (!clearSingleButton) {
          log('Не найдена кнопка удаления ставки из купона', 'crimson');
          return false;
        }
        fireEvent(clearSingleButton, 'click');
      } else {
        const clearAllButton = context.querySelector<HTMLElement>(
          options.clearAllSelector
        );
        if (!clearAllButton) {
          log('Не найдена кнопка очистки купона', 'crimson');
          return false;
        }
        fireEvent(clearAllButton, 'click');
      }
    } else if (options.clearAllSelector) {
      const clearAllButton = context.querySelector<HTMLElement>(
        options.clearAllSelector
      );
      if (!clearAllButton) {
        log('Не найдена кнопка очистки купона', 'crimson');
        return false;
      }
      fireEvent(clearAllButton, 'click');
    } else {
      const clearSingleButtons = [
        ...context.querySelectorAll<HTMLElement>(options.clearSingleSelector),
      ];
      if (clearSingleButtons.length === 0) {
        log('Не найдены кнопки удаления ставок из купона', 'crimson');
        return false;
      }
      clearSingleButtons.forEach((button) => fireEvent(button, 'click'));
    }

    const couponCleared = Boolean(
      await awaiter(() => options.getStakeCount() === 0)
    );
    if (!couponCleared) {
      log('Не удалось очистить купон', 'crimson');
      return false;
    }
    log('Купон очищен', 'cadetblue', true);
    if (options.postCheck) {
      const result = await options.postCheck();
      if (!result) {
        return false;
      }
    }
  }
  log('Купон пуст', 'cadetblue', true);
  return true;
};

export default clearCouponGenerator;
