const CheckUserRole = (req, res, next) => {
  const { user: { role } } = req;

  if (role !== 'admin') {
    req.error = 'Only admin is authorized';
  }

  next();
};

module.exports = {
  CheckUserRole
};
