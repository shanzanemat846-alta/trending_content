const ThrowMissingParamsError = (paramsArray) => {
  const hasEmptyParams = paramsArray.some((param) => param === undefined || param === null);
  if (hasEmptyParams) {
    const err = new Error();
    err.statusCode = 400;
    err.error = 'Query Params are missing!';
    throw err;
  }
};

module.exports = {
  ThrowMissingParamsError
};
