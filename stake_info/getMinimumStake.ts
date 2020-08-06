import { log } from '@kot-shrodingera-team/germes-utils';

const getMinimumStakeGenerator = (options: {
  minimumStakeElementSelector: string;
}) => (): number => {
  const minimumStakeElement = document.querySelector(
    options.minimumStakeElementSelector
  );
  if (!minimumStakeElement) {
    log('Не найдена минимальная сумма ставки', 'crimson');
    return 0;
  }
  const minimumStakeText = minimumStakeElement.textContent.trim();
  const minimumStake = Number(minimumStakeText);
  if (Number.isNaN(minimumStake)) {
    log(
      `Непонятный формат минимальной ставки: "${minimumStakeText}"`,
      'crimson'
    );
    return 0;
  }
  return minimumStake;
};

export default getMinimumStakeGenerator;
