/**
 * Опции генератора функции получения количества ставок в купоне
 */
interface GetStakeCountGeneratorOptions {
  /**
   * Селектор ставки в купоне
   */
  stakeSelector: string;
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
  const context = options.context ? options.context() : document;
  return context.querySelectorAll(options.stakeSelector).length;
};

export default getStakeCountGenerator;
