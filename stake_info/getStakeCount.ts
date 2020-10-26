const getStakeCountGenerator = (options: {
  stakeElementSelector: string;
  context?: () => Document | Element;
}) => (): number => {
  const context = options.context ? options.context() : document;
  return context.querySelectorAll(options.stakeElementSelector).length;
};

export default getStakeCountGenerator;
