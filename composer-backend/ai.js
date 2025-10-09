const { GoogleGenerativeAI } = require('@google/generative-ai');
let genAI;

try {
  console.log('[DEBUG] GEMINI_API_KEY is set:', !!process.env.GEMINI_API_KEY);
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log('GoogleGenerativeAI inicializado correctamente.');
} catch (error) {
  console.error('Error al inicializar GoogleGenerativeAI:', error);
}

const generateQuestionsWithAI = async (topic, numberOfQuestions, numberOfOptions) => {
  if (!genAI) {
    console.error('GenAI client not initialized. Cannot generate questions.');
    throw new Error('GenAI client not initialized.');
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Genera ${numberOfQuestions} preguntas de selección múltiple sobre el tema \"${topic}\" para una evaluación.
Cada pregunta debe tener ${numberOfOptions} opciones, y solo una debe ser correcta.
El formato de salida debe ser un array de objetos JSON, donde cada objeto de pregunta contiene:
- \"texto\": la pregunta.
- \"opciones\": un array de objetos, cada uno con \"texto\" (la opción) y \"es_correcta\" (booleano).
Ejemplo:
[
  {
    \"texto\": \"¿Cuál es la capital de Francia?\",
    \"opciones\": [
      {\"texto\": \"Berlín\", \"es_correcta\": false},
      {\"texto\": \"París\", \"es_correcta\": true},
      {\"texto\": \"Madrid\", \"es_correcta\": false}
    ]
  }
]`;

  console.log('[DEBUG] Sending prompt to Gemini:', prompt);
  let text;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    text = response.text();
    console.log('[DEBUG] Raw AI response:', text);
  } catch (apiError) {
    console.error('Error during Gemini API call:', apiError);
    throw new Error(`Error en la llamada a la API de Gemini: ${apiError.message || apiError}`);
  }

  const cleanedText = text.replace(/```json\n?|```/g, '').trim();
  console.log('[DEBUG] Cleaned AI response (for JSON parse):', cleanedText);

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
