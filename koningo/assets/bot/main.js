// ...existing code...
const natural = require('natural');
const readline = require('readline');

console.log('Iniciando el bot de clasificación de consultas sobre juegos de mesa...');

const tokenizer = new natural.WordTokenizer();
const classifier = new natural.BayesClassifier();

// Entrenamiento básico para clasificar la intención del usuario
classifier.addDocument('¿Cómo se juega?', 'rules');
classifier.addDocument('¿Cuáles son las reglas?', 'rules');
classifier.addDocument('reglas del juego', 'rules');
classifier.addDocument('¿qué pasos debo seguir para jugar?', 'rules');

classifier.addDocument('¿Qué incluye la edición deluxe?', 'editions');
classifier.addDocument('componentes de la caja', 'editions');
classifier.addDocument('¿cuáles son las diferencias entre ediciones?', 'editions');
classifier.addDocument('contenido de la edición limitada', 'editions');

classifier.addDocument('¿Dónde puedo comprar esto?', 'buy');
classifier.addDocument('quiero comprar el juego', 'buy');
classifier.addDocument('precio y compra', 'buy');
classifier.addDocument('¿hay tiendas donde lo vendan?', 'buy');

classifier.train();

// Helper para construir un JSON estructurado sobre la consulta
function buildStructuredRecord(input) {
  const classifications = classifier.getClassifications(input);
  const sorted = classifications.sort((a, b) => b.value - a.value);
  const top = sorted[0] || { label: 'unknown', value: 0 };
  const total = classifications.reduce((s, c) => s + c.value, 0) || 1;
  const confidence = +(top.value / total).toFixed(3);

  // Extracción simple de posible nombre de juego: frases entre comillas o Title Case
  const quoted = input.match(/"([^"]+)"|'([^']+)'|«([^»]+)»/);
  let possibleGame = quoted ? (quoted[1] || quoted[2] || quoted[3]) : null;
  if (!possibleGame) {
    const titleMatches = input.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g);
    if (titleMatches && titleMatches.length) possibleGame = titleMatches[0];
  }

  const tokens = tokenizer.tokenize(input);

  return {
    timestamp: new Date().toISOString(),
    raw: input,
    intent: top.label,
    confidence: confidence,
    tokens: tokens,
    possibleGame: possibleGame,
    classifications: classifications.map(c => ({ label: c.label, score: c.value }))
  };
}

// Chat simple por terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Hola. ¿Tienes preguntas sobre las reglas de un juego, sobre las ediciones y sus componentes, o te interesa comprar un juego? (responde: reglas / ediciones / comprar o escribe tu pregunta)');

rl.on('line', (input) => {
  const record = buildStructuredRecord(input.trim());
  console.log('Registro estructurado (JSON):');
  console.log(JSON.stringify(record, null, 2));

  // Respuesta básica según intención detectada
  switch (record.intent) {
    case 'rules':
      console.log('Parece que tu pregunta es sobre las reglas. ¿Sobre qué juego en concreto quieres saber?');
      break;
    case 'editions':
      console.log('Parece que te interesa la edición o componentes. ¿Quieres detalles de contenido o comparativas entre ediciones?');
      break;
    case 'buy':
      console.log('Parece que te interesa comprar. ¿Buscas tienda física, tienda online o comparar precios?');
      break;
    default:
      console.log('No he identificado claramente la intención. ¿Puedes dar más detalles o decir si es sobre reglas, ediciones o comprar?');
  }

  console.log('\nPuedes seguir preguntando o pulsa Ctrl+C para salir.');
});