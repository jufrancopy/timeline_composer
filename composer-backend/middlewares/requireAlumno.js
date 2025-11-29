const jwt = require('jsonwebtoken');

const requireAlumno = (req, res, next) => {
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

    if (decoded.role !== 'alumno') {
      return res.status(403).json({ message: 'Access denied: Not an alumno' });
    }
    
    req.alumno = decoded;
    next();
  } catch (error) {
    console.error('Alumno authentication error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = requireAlumno;
