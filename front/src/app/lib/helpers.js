const HandleCatchBlock = (err) => {
  if (typeof err === 'string') {
    return {
      error: err,
      status: 500,
    };
  }

  console.log('err here the value: ', err);

  if (err.response && err.response.data) {
    return {
      error: err.response.data.error,
      status: err.response.status
    };
  }

  return {
    error: err.error || 'Unknown error occurred',
    status: err.status || 500,
  };
};

export {
  HandleCatchBlock
};
