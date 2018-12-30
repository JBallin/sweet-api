const formatErr = (err, res) => {
  if (res.body.error) return Error(`${err.message}\n     Error: ${res.body.error}`);
  return err;
};

module.exports = { formatErr };
