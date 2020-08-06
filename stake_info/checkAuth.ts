const checkAuthGenerator = (options: {
  accountSelector: string;
}) => (): boolean => {
  const accountMenu = document.querySelector(options.accountSelector);
  return Boolean(accountMenu);
};

export default checkAuthGenerator;
