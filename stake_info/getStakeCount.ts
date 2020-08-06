const getStakeCountGenerator = (options: {
  stakeElementSelector: string;
}) => (): number => {
  return document.querySelectorAll(options.stakeElementSelector).length;
};

export default getStakeCountGenerator;
