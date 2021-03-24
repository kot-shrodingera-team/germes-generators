const getStakeCountGenerator = (options: {
  stakeSelector: string;
  context?: () => Document | Element;
}) => (): number => {
  const context = options.context ? options.context() : document;
  return context.querySelectorAll(options.stakeSelector).length;
};

export default getStakeCountGenerator;
