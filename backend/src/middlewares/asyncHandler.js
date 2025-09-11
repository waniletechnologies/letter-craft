/**
 * Wrapper for async controller functions to automatically catch errors
 * and pass them to the global error handler
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler; 