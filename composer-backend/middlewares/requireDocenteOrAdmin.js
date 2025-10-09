const jwt = require('jsonwebtoken');

const requireDocenteOrAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === 'docente' || decoded.role === 'ADMIN') {
      req.user = decoded;
      next();
    } else {
      return res.status(403).json({ message: 'Access denied: Invalid role' });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = requireDocenteOrAdmin;