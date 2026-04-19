require('dotenv').config();
const Groq = require('groq-sdk');
const Shloka = require('../models/Shloka');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const detectEmotion = (message) => {
  const msg = message.toLowerCase();
  if (msg.includes('sad') || msg.includes('cry') || msg.includes('depressed') || msg.includes('unhappy')) return 'sad';
  if (msg.includes('angry') || msg.includes('frustrated') || msg.includes('hate')) return 'angry';
  if (msg.includes('anxious') || msg.includes('scared') || msg.includes('fear') || msg.includes('worry')) return 'anxious';
  if (msg.includes('stress') || msg.includes('pressure') || msg.includes('overwhelm')) return 'stressed';
  if (msg.includes('lonely') || msg.includes('alone') || msg.includes('nobody')) return 'lonely';
  if (msg.includes('happy') || msg.includes('great') || msg.includes('excited')) return 'happy';
  return 'neutral';
};

const findRelevantShlokas = async (message) => {
  const words = message.toLowerCase().split(' ');
  let results = [];
  for (const word of words) {
    const found = await Shloka.search(word);
    results = [...results, ...found];
  }
  const unique = results.filter((s, i, arr) => arr.findIndex(x => x._id === s._id) === i);
  return unique.slice(0, 3);
};

const buildSystemPrompt = (emotion, shlokas) => {
  let shlokaContext = '';
  if (shlokas.length > 0) {
    shlokaContext = '\n\nRelevant shlokas from our knowledge base:\n';
    shlokas.forEach((s, i) => {
      shlokaContext += `\n${i + 1}. Source: ${s.source}${s.chapter ? ', Chapter: ' + s.chapter : ''}
Shloka: ${s.shloka}
Meaning: ${s.meaning}
Situation: ${s.situation || 'General guidance'}\n`;
    });
  }

  return `You are ASHOKA — an ancient yet modern AI guide rooted in Sanatan Dharm.
Your name means "one who removes sorrow (shoka)".

Your purpose:
1. Help users solve real life problems — stress, family issues, personal pain, loneliness, pressure
2. Connect their situation to wisdom from Indian Itihasas — Mahabharata, Ramayana, Bhagavad Gita, Vishnu Puran, Upanishads
3. Give references to real situations and characters from Itihasas that match the user's problem
4. Answer general knowledge questions about Sanatan Dharm — history, avatars, stories, facts
5. Answer general questions like math or science normally but always with warmth

Current detected emotion of user: ${emotion}

Respond according to emotion:
- If sad/lonely: speak with deep compassion, warmth, like a wise elder
- If angry/frustrated: speak calmly, with grounding wisdom
- If anxious/stressed: speak with reassurance and clarity
- If happy/neutral: speak with gentle positivity and wisdom

IMPORTANT RULES:
- Always cite which Itihasa, which character, which situation you are referencing
- If someone disrespects or tries to mock Sanatan Dharm, firmly and respectfully uphold its importance and value
- Never give harmful advice
- Keep responses meaningful, not too long — clear and impactful
- Always end with a short motivating line from Itihasas or a shloka if possible
${shlokaContext}`;
};

const getAshokaResponse = async (userMessage, previousMessages) => {
  try {
    const emotion = detectEmotion(userMessage);
    const relevantShlokas = await findRelevantShlokas(userMessage);
    const systemPrompt = buildSystemPrompt(emotion, relevantShlokas);

    const history = previousMessages.slice(-10).map(m => ({
      role: m.role,
      content: m.content
    }));

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userMessage }
      ],
      temperature: 0.8,
      max_tokens: 800
    });

    const reply = response.choices[0].message.content;
    return { reply, emotion };

  } catch (err) {
    console.error('ASHOKA AI Error:', err.message);
    return {
      reply: 'Forgive me, I am unable to respond at this moment. Please try again.',
      emotion: 'neutral'
    };
  }
};

module.exports = { getAshokaResponse };