exports = function ({ error_message, error_metadata }) {
  const error = new Error(error_message);
  error.metadata = error_metadata;
  return error;
};
