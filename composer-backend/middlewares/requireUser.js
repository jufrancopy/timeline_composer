const jwt = require('jsonwebtoken');


const requireUser = (prismaClient) => {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Acceso denegado: No se proporcionó token' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = req.user || {}; // Ensure req.user is an object
      req.user = { ...decoded, ...req.user };

      const userEmail = decoded.email;

      if (decoded.role.toLowerCase() === 'alumno' && userEmail) {
        let alumno = await prismaClient.alumno.findUnique({ where: { email: userEmail } });
        if (!alumno) {
          return res.status(403).json({ error: 'Acceso denegado: El correo electrónico no está registrado como alumno.' });
        }
        req.user.alumnoId = alumno.id; // Asegura que alumnoId esté en req.user

        const composer = await prismaClient.composer.findFirst({
          where: { email: userEmail, is_student_contribution: true },
          orderBy: { created_at: 'desc' },
        });
        if (composer) {
          req.user.composerId = composer.id; // Para alumnos que son compositores (timeline)
        }
      } else if (decoded.role === 'docente' && decoded.docenteId) { // Maneja el rol 'docente'
        req.user.docenteId = decoded.docenteId; // Asegura que docenteId esté en req.user
      } else if (decoded.role === 'ADMIN') {
        // Admin roles might not have an associated alumnoId or composerId
        // No special handling needed here, req.user already has role 'ADMIN'
      }
      next();
    } catch (error) {
      console.error('[requireUser] Error al verificar token:', error);
      return res.status(403).json({ error: 'Acceso denegado: Token inválido o expirado' });
    }
  };
};

module.exports = { requireUser };
