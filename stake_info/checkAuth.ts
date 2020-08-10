import { getElement } from '@kot-shrodingera-team/germes-utils';

export const authCheckReadyGenerator = (options: {
  authFormSelector: string;
  accountSelector: string;
}) => async (timeout = 5000): Promise<void> => {
  await Promise.race([
    getElement(options.authFormSelector, timeout),
    getElement(options.accountSelector, timeout),
  ]);
};

const checkAuthGenerator = (options: {
  accountSelector: string;
}) => (): boolean => {
  const accountMenu = document.querySelector(options.accountSelector);
  return Boolean(accountMenu);
};

export default checkAuthGenerator;
