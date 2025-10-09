const express = require('express');
const router = express.Router();

module.exports = (prisma) => {
  router.get('/', async (req, res) => {
    try {
      // Obtener todos los compositores que son contribuciones de estudiantes
      const studentContributions = await prisma.composer.findMany({
        where: {
          is_student_contribution: true,
          status: 'PUBLISHED',
        },
        select: {
          email: true,
          first_name: true,
          last_name: true,
          birth_year: true,
          bio: true,
          notable_works: true,
          period: true,
          photo_url: true,
          youtube_link: true,
          references: true,
          points: true, // Asumiendo que hay un campo 'points'
        },
      });

      // Obtener todos los EditSuggestion que han sido aplicados y son de estudiantes
      const studentEditSuggestions = await prisma.editSuggestion.findMany({
        where: {
          is_student_contribution: true,
          status: 'APPLIED',
        },
        select: {
          suggester_email: true,
          points: true, // Asumiendo que hay un campo 'points'
        },
      });

      // Calcular puntos por contribución de compositor
      const calculatePointsFromComposer = (composer) => {
        let score = 0;
        if (composer.first_name) score++;
        if (composer.last_name) score++;
        if (composer.birth_year) score++;
        if (composer.bio) score++;
        if (composer.notable_works) score++;
        if (composer.period) score++;
        if (composer.email) score++;
        if (composer.photo_url) score++;
        if (composer.youtube_link) score++;
        if (composer.references) score++;
        return score;
      };

      const rankingMap = new Map();

      // Procesar contribuciones de compositores
      for (const composer of studentContributions) {
        const email = composer.email;
        const currentPoints = rankingMap.has(email) ? rankingMap.get(email).points : 0;
        const newPoints = calculatePointsFromComposer(composer);
        rankingMap.set(email, {
          email,
          points: currentPoints + newPoints,
          type: 'composer_contribution',
          name: `${composer.first_name} ${composer.last_name}`,
        });
      }

      // Procesar sugerencias de edición
      for (const suggestion of studentEditSuggestions) {
        const email = suggestion.suggester_email;
        const currentPoints = rankingMap.has(email) ? rankingMap.get(email).points : 0;
        // Asumo que las sugerencias de edición también tienen un campo 'points'
        // Si no, podríamos asignar un valor fijo o calcularlo de otra manera.
        rankingMap.set(email, {
          email,
          points: currentPoints + (suggestion.points || 5), // Asignar 5 puntos si no hay campo 'points'
          type: 'edit_suggestion',
          // Nombre del alumno se podría obtener de la tabla Alumno si es necesario
        });
      }

      // Convertir el mapa a un array y ordenar por puntos
      const ranking = Array.from(rankingMap.values()).sort((a, b) => b.points - a.points);

      res.status(200).json(ranking);
    } catch (error) {
      console.error('Error al obtener el ranking:', error);
      res.status(500).json({ error: 'Error al obtener el ranking', details: error.message });
    }
  });

  return router;
};
