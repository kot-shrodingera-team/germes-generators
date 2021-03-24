/**
 * Генератор функции получения количества ставок в купоне
 * @param options Опции:
 * - stakeSelector - Селектор ставки в купоне
 * - context - Функция, возвращающая контекст для поиска элементов DOM, по умолчанию document
 * @returns Функция, которая возвращает количество ставок в купоне
 */
const getStakeCountGenerator = (options: {
  stakeSelector: string;
  context?: () => Document | Element;
}) => (): number => {
  const context = options.context ? options.context() : document;
  return context.querySelectorAll(options.stakeSelector).length;
};

export default getStakeCountGenerator;
