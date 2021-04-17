interface TextValue {
  /**
   * Функция, возвращающая исходный текст
   */
  getText: () => string;
  selector?: never;
  context?: never;
}

interface TextFromElement {
  /**
   * Селектор элемента
   */
  selector: string;
  /**
   * Функция, возвращающая контекст для поиска элемента, по умолчанию document
   */
  context?: () => Document | Element;
  getText?: never;
}

interface ExtractValueFromTextOptions {
  /**
   * Опции получения текста
   *
   * Определяет функцию, возвращую текст, или селектор элемента, текст которого будет использоваться
   */
  text: TextValue | TextFromElement;
  /**
   * Заменяемые подстроки в тексте
   *
   * Используется, например, если нужно заменить запятые на точки
   */
  replaceDataArray?: {
    /**
     * Искомый текст/регулярное выражение
     */
    searchValue: string | RegExp;
    /**
     * Текст, на который производится замена
     */
    replaceValue: string;
  }[];
  /**
   * Регулярное выражение для удаления символов из текста, по умолчанию /[\s,']/g;
   */
  removeRegex?: RegExp;
  /**
   * Регулярное выражение для получения значения из текста, по умолчанию /(\d+(?:\.\d+)?)/
   */
  matchRegex?: RegExp;
  /**
   * Возвращаемое значение при ошибке
   */
  errorValue: number;
}

interface StakeInfoValueBasicOptions {
  /**
   * Текстовое описание получаемого значения
   */
  name:
    | 'balance'
    | 'coefficient'
    | 'currentSum'
    | 'maximumStake'
    | 'minimumStake';
  /**
   * Функция возврата фейкового значения
   *
   * Если результат не null, используется не фейковое значение
   */
  fakeValue?: () => number;
  /**
   * Функция модификации результата
   *
   * @param value промежуточное значение
   * @param extractType метод, которым получено значение (фиксированное или из текста)
   */
  modifyValue?: (value: number, extractType: string) => number;
  /**
   * Флаг отключения вывода логов, по умолчанию false
   */
  disableLog?: boolean;
}

interface StakeInfoValueFixedOptions extends StakeInfoValueBasicOptions {
  /**
   * Фиксированное (постоянное) значение
   */
  fixedValue: () => number;
  valueFromText?: never;
}

interface StakeInfoValueTextOptions extends StakeInfoValueBasicOptions {
  /**
   * Получение значение из текста
   */
  valueFromText: ExtractValueFromTextOptions;
  fixedValue?: never;
}

// eslint-disable-next-line prettier/prettier
export type StakeInfoValueOptions = StakeInfoValueFixedOptions | StakeInfoValueTextOptions;
