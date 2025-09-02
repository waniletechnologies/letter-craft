/**
 * Assumes an upstream authentication middleware attaches `req.user.id`.
 */
const requireAuth = (req, res, next) => {
  let userId = req.user?.id;
  // Fallback: read from header if upstream middleware didn't set req.user
  if (!userId) {
    const headerId = req.header('x-user-id');
    if (headerId) {
      req.user = { id: String(headerId) };
      userId = req.user.id;
    }
  }
  if (!userId || typeof userId !== 'string') {
    return res.status(401).json({
      status: false,
      message: 'Unauthorized: user not authenticated'
    });
  }
  next();
};

export default requireAuth;

