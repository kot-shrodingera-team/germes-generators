import { getWorkerParameter, log } from '@kot-shrodingera-team/germes-utils';

/**
 * Опции генератора функции проверки доступности ставки
 */
interface CheckStakeEnabledGeneratorOptions {
  /**
   * Функция предварительно проверки
   *
   * Если вернёт false, ставка считается недоступной
   */
  preCheck?: () => boolean;
  /**
   * Функция получения количества ставок в купоне
   *
   * Если оно не 1, ставка считается недоступной
   */
  getStakeCount: () => number;
  /**
   * Опции проверки элемента ставки
   *
   * Проверяется наличие этого элемента и опционально наличие классов ошибок/недоступности
   */
  betCheck?: {
    /**
     * Селектор элемента ставки
     *
     * Если он не найден, ставка считается недоступной
     */
    selector: string;
    /**
     * Проверяемые классы ошибок/недоступности ставки
     *
     * Если у элемента ставки будет хотя бы одни такой класс, ставка считается недоступной
     */
    errorClasses?: {
      /**
       * Имя класса, которое указывает на ошибку/недоступность ставки
       */
      className: string;
      /**
       * Дополнительное пояснение для этой ошибки
       */
      message?: string;
    }[];
  };
  /**
   * Проверяемые элементы ошибок/недоступности ставки
   *
   * Используется, если ошибка определяется не наличием класса у элемента ставки, а отдельными элементами
   */
  errorsCheck?: {
    /**
     * Селектор элемента ошибки/недоступности ставки
     *
     * Если он найден, ставка считается недоступной
     */
    selector: string;
    /**
     * Дополнительное пояснение для этой ошибки
     */
    message?: string;
  }[];
  /**
   * Функция, возвращающая контекст для поиска элементов DOM, по умолчанию document
   */
  context?: () => Document | Element;
}

/**
 * Генератор функции проверки доступности ставки
 * @returns Функция, которая возвращает true, если ставка доступна, иначе false
 */
const checkStakeEnabledGenerator = (
  options: CheckStakeEnabledGeneratorOptions
) => (): boolean => {
  if (
    getWorkerParameter('fakeStakeEnabled') ||
    getWorkerParameter('fakeOpenStake')
  ) {
    return true;
  }
  if (window.germesData.stakeDisabled) {
    log('Ставка недоступна [forced]', 'crimson');
    return false;
  }
  const context = options.context ? options.context() : document;
  if (options.preCheck && !options.preCheck()) {
    return false;
  }
  const stakeCount = options.getStakeCount();
  if (stakeCount !== 1) {
    log(
      `Ошибка проверки доступности ставки: в купоне не 1 ставка (${stakeCount})`,
      'crimson'
    );
    return false;
  }
  if (options.betCheck) {
    const betElement = context.querySelector(options.betCheck.selector);
    if (!betElement) {
      log(
        'Ошибка проверки доступности ставки: не найдена ставка в купоне',
        'crimson'
      );
      return false;
    }
    if (options.betCheck.errorClasses) {
      const errorClass = options.betCheck.errorClasses.find(({ className }) => {
        return [...betElement.classList].includes(className);
      });
      if (errorClass) {
        log(
          `Ставка недоступна${
            errorClass.message ? ` (${errorClass.message})` : ''
          }`,
          'crimson'
        );
        return false;
      }
    }
  }
  if (options.errorsCheck) {
    const errorCheck = options.errorsCheck.find(({ selector }) => {
      return Boolean(context.querySelector(selector));
    });
    if (errorCheck) {
      log(
        `Ставка недоступна${
          errorCheck.message ? ` (${errorCheck.message})` : ''
        }`,
        'crimson'
      );
      return false;
    }
  }
  return true;
};

export default checkStakeEnabledGenerator;
