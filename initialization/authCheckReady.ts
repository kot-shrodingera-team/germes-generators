import { getElement } from '@kot-shrodingera-team/germes-utils';

const authCheckReadyGenerator = (options: {
  authFormSelector: string;
  accountSelector: string;
}) => async (timeout = 5000): Promise<void> => {
  await Promise.race([
    getElement(options.authFormSelector, timeout),
    getElement(options.accountSelector, timeout),
  ]);
};

export default authCheckReadyGenerator;
