// middlewares/requireAdmin.js
const jwt = require('jsonwebtoken');

const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso denegado: No se proporcionó token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado: Requiere rol de administrador' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Acceso denegado: Token inválido' });
  }
};

module.exports = requireAdmin;