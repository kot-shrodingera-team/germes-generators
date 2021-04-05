import { getWorkerParameter } from '@kot-shrodingera-team/germes-utils';

/**
 * Опции генератора функции получения количества ставок в купоне
 */
interface GetStakeCountGeneratorOptions {
  /**
   * Селектор ставки в купоне
   */
  stakeSelector: string;
  /**
   * Имя параметра воркера, который включает фейковое определение количества ставок в купоне
   */
  fakeStakeCountWorkerParameterName?: string;
  /**
   * Функция, возвращающая контекст для поиска элементов DOM, по умолчанию document
   */
  context?: () => Document | Element;
}

/**
 * Генератор функции получения количества ставок в купоне
 * @returns Функция, которая возвращает количество ставок в купоне
 */
const getStakeCountGenerator = (
  options: GetStakeCountGeneratorOptions
) => (): number => {
  if (
    options.fakeStakeCountWorkerParameterName &&
    getWorkerParameter(options.fakeStakeCountWorkerParameterName)
  ) {
    return 1;
  }
  const context = options.context ? options.context() : document;
  return context.querySelectorAll(options.stakeSelector).length;
};

export default getStakeCountGenerator;
