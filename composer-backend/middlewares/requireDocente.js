const jwt = require('jsonwebtoken');

const requireDocente = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('[requireDocente] authHeader:', authHeader ? 'Present' : 'Missing');

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  console.log('[requireDocente] token:', token ? 'Present' : 'Missing');

  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[requireDocente] Decoded token structure:', JSON.stringify(decoded, null, 2)); // ← Esto muestra toda la estructura

    if (decoded.role !== 'docente') {
      console.log('[requireDocente] Access denied: Role is not docente. Role:', decoded.role);
      return res.status(403).json({ message: 'Access denied: Not a docente' });
    }
    
    req.docente = decoded;
    console.log('[requireDocente] req.docente set with keys:', Object.keys(req.docente));
    next();
  } catch (error) {
    console.error('[requireDocente] Docente authentication error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = requireDocente;
