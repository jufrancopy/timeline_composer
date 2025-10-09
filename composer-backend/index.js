console.log('--- INICIANDO index.js - VERSION DEPURACION FINAL ---');
require('dotenv').config();
console.log('DATABASE_URL cargada:', process.env.DATABASE_URL);
const express = require('express');
const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const composerRoutes = require('./composerRoutes');
const rankingRoutes = require('./rankingRoutes'); // Nueva importación
const requireAdmin = require('./middlewares/requireAdmin');

// --- Función Auxiliar para Checklist de Completitud ---
const generarChecklistHTML = (composer) => {
  const campos = [
    { key: 'first_name', label: 'Nombre', value: composer.first_name },
    { key: 'last_name', label: 'Apellido', value: composer.last_name },
    { key: 'birth_year', label: 'Año de Nacimiento', value: composer.birth_year },
    { key: 'bio', label: 'Biografía', value: composer.bio },
    { key: 'notable_works', label: 'Obras Notables', value: composer.notable_works },
    { key: 'period', label: 'Período Musical', value: composer.period },
    { key: 'email', label: 'Email de Contacto', value: composer.email },
    { key: 'photo_url', label: 'Foto del Creador', value: composer.photo_url },
    { key: 'youtube_link', label: 'Video de YouTube', value: composer.youtube_link },
    { key: 'references', label: 'Referencias', value: composer.references },
  ];

  let score = 0;
  const checklistItems = campos.map(campo => {
    const isComplete = campo.value !== null && campo.value !== undefined && String(campo.value).trim() !== '';
    if (isComplete) score++;
    return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${isComplete ? '✅' : '❌'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${campo.label}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${isComplete ? '+1 pto' : '+0 ptos'}</td>
      </tr>
    `;
  }).join('');

  return `
    <h4 style="color: #333; margin-top: 20px; margin-bottom: 10px;">Detalle de tu Aporte:</h4>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      ${checklistItems}
      <tr style="background-color: #f8f8f8;">
        <td colspan="2" style="padding: 12px; font-weight: bold; text-align: right;">Puntaje Total:</td>
        <td style="padding: 12px; font-weight: bold; text-align: right;">${score} / 10</td>
      </tr>
    </table>
  `;
};

const prisma = new PrismaClient();
const app = express();

// --- Configuración de Nodemailer ---
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  tls: {
    rejectUnauthorized: false // Añadido para ignorar errores de certificado (solo para depuración/certificados autofirmados)
  },
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.use(express.json());

// --- Rutas ---
app.use('/api/composers', composerRoutes(prisma, transporter));
app.use('/api/ranking', rankingRoutes(prisma)); // Nueva ruta de ranking

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
});
