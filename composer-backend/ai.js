const { GoogleGenerativeAI } = require('@google/generative-ai');
let genAI;

try {
  console.log('[DEBUG] GEMINI_API_KEY is set:', !!process.env.GEMINI_API_KEY);
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log('GoogleGenerativeAI inicializado correctamente.');
} catch (error) {
  console.error('Error al inicializar GoogleGenerativeAI:', error);
}

const generateQuestionsWithAI = async (topic, numberOfQuestions, numberOfOptions, unidadContent) => {
  console.log('[AI] generateQuestionsWithAI llamado con:');
  console.log('  Topic:', topic);
  console.log('  Number of Questions:', numberOfQuestions);
  console.log('  Number of Options:', numberOfOptions);
  console.log('  Unidad Content (length):', unidadContent ? unidadContent.length : 0);
  // Opcional: Para ver una parte del contenido si es muy largo
  console.log('  Unidad Content (first 200 chars):', unidadContent ? unidadContent.substring(0, 200) + (unidadContent.length > 200 ? '...' : '') : 'No content');
  if (!genAI) {
    console.error('GenAI client not initialized. Cannot generate questions.');
    throw new Error('GenAI client not initialized.');
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });





  const prompt = `Basándote en el siguiente contenido de unidades: """${unidadContent}""". Genera ${numberOfQuestions} preguntas de selección múltiple sobre el tema """${topic}""" para una evaluación. Cada pregunta debe tener ${numberOfOptions} opciones, y solo una debe ser correcta.\nEl formato de salida debe ser un array de objetos JSON, donde cada objeto de pregunta contiene:\n- """texto""": la pregunta.\n- """opciones""": un array de objetos, cada uno con """texto""" (la opción) y """es_correcta""" (booleano).\nEjemplo:\n[\n  {\n    """texto""": """¿Cuál es la capital de Francia?""",\n    """opciones""": [\n      {"""texto""": """Berlín""", """es_correcta""": false},\n      {"""texto""": """París""", """es_correcta""": true},\n      {"""texto""": """Madrid""", """es_correcta""": false}\n    ]\n  }\n]`;

  console.log('[DEBUG] Sending prompt to Gemini:', prompt);
  let text;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    text = response.text();
    console.log('[DEBUG] Raw AI response (first 500 chars):', text.substring(0, 500) + (text.length > 500 ? '...' : ''));
  } catch (apiError) {
    console.error('Error during Gemini API call:', apiError);
    throw new Error(`Error en la llamada a la API de Gemini: ${apiError.message || apiError}`);
  }

  // Eliminar cualquier texto antes y después del bloque JSON
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
  const cleanedText = jsonMatch ? jsonMatch[1].trim() : text.trim();
    console.log('[DEBUG] Cleaned AI response (for JSON parse, first 500 chars):', cleanedText.substring(0, 500) + (cleanedText.length > 500 ? '...' : ''));

  let parsedQuestions;
  try {
    parsedQuestions = JSON.parse(cleanedText);
    if (Array.isArray(parsedQuestions) && parsedQuestions.every(q => q.texto && Array.isArray(q.opciones))) {
      return parsedQuestions;
    }
 else {
      console.error('AI response is not in the expected format:', text);
      throw new Error('AI response is not in the expected format.');
    }
  } catch (parseError) {
    console.error('Error parsing AI response as JSON:', parseError);
    console.error('AI response that caused error:', text);
    console.error('Parsed questions before error (if any):', parsedQuestions);
    throw new Error('Error processing AI response.');
  }
};

module.exports = { generateQuestionsWithAI };
