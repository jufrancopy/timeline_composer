const jwt = require('jsonwebtoken');

module.exports = (prisma) => {
  return async (req, res, next) => {
    console.log('[requireAlumnoInCatedra] Iniciando verificación de alumno en cátedra...');
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[requireAlumnoInCatedra] No hay token o el formato es incorrecto.');
      return res.status(401).json({ error: 'No autorizado. Se requiere autenticación.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('[requireAlumnoInCatedra] Token decodificado:', decoded);
    } catch (error) {
      console.error('[requireAlumnoInCatedra] Error al verificar token:', error);
      return res.status(403).json({ error: 'Acceso denegado: Token inválido o expirado.' });
    }

    if (decoded.role !== 'alumno') {
      console.log(`[requireAlumnoInCatedra] Rol denegado: ${decoded.role}. Solo alumnos permitidos.`);
      return res.status(403).json({ error: 'Acceso denegado: Solo alumnos pueden acceder a esta ruta.' });
    }

    const alumnoId = decoded.alumnoId;
    const catedraId = parseInt(req.params.catedraId);

    if (!alumnoId || isNaN(catedraId)) {
      console.log('[requireAlumnoInCatedra] Falta alumnoId en token o catedraId no es un número.', { alumnoId, catedraId });
      return res.status(400).json({ error: 'Parámetros de usuario o cátedra inválidos.' });
    }

    try {
      console.log('[requireAlumnoInCatedra] Prisma dentro del handler:', prisma ? 'DEFINED' : 'UNDEFINED');
      const alumnoCatedra = await prisma.catedraAlumno.findUnique({
        where: {
          catedraId_alumnoId: {
            alumnoId: alumnoId,
            catedraId: catedraId,
          },
        },
      });

      if (!alumnoCatedra) {
        console.log(`[requireAlumnoInCatedra] Alumno ${alumnoId} no inscrito en cátedra ${catedraId}.`);
        return res.status(403).json({ error: 'Acceso denegado: El alumno no está inscrito en esta cátedra.' });
      }

      req.userType = 'alumno';
      req.userId = alumnoId;
      next();
    } catch (error) {
      console.error('[requireAlumnoInCatedra] Error al verificar inscripción del alumno en cátedra:', error);
      res.status(500).json({ error: 'Error interno del servidor al verificar permisos.' });
    }
  };
};
