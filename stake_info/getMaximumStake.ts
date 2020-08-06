import { log } from '@kot-shrodingera-team/germes-utils';

const getMaximumStakeGenerator = (options: {
  maximumStakeElementSelector: string;
}) => (): number => {
  const maximumStakeElement = document.querySelector(
    options.maximumStakeElementSelector
  );
  if (!maximumStakeElement) {
    log('Не найдена максимальная сумма ставки', 'crimson');
    return 0;
  }
  const maximumStakeText = maximumStakeElement.textContent.trim();
  const maximumStake = Number(maximumStakeText);
  if (Number.isNaN(maximumStake)) {
    log(
      `Непонятный формат максимальной ставки: "${maximumStakeText}"`,
      'crimson'
    );
    return 0;
  }
  return maximumStake;
};

export default getMaximumStakeGenerator;
