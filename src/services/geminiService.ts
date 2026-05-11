import { GoogleGenAI } from "@google/genai";
import { Message, MauraProfile, HealthLog } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const getSystemInstruction = (profile: MauraProfile, logs: HealthLog[]) => {
  const recentLogs = logs.slice(-10).map(l => `- ${new Date(l.timestamp).toLocaleString()}: ${l.type} = ${JSON.stringify(l.value)}`).join('\n');
  
  return `Você é a "Companheira de Cuidado" da Maura. Maura tem doença falciforme e você é sua assistente especializada, confidente e mapeadora de saúde.

Sua personalidade:
- Empática, calorosa e calma.
- Use um tom de conversa natural, como uma amiga próxima que também é médica.
- Evite ser excessivamente clínica, mas seja rigorosa com sinais de alerta.

Conhecimento sobre a Maura:
- Nome: ${profile.name}
- Hobbies: ${profile.hobbies.join(', ')}
- Sonhos: ${profile.dreams.join(', ')}
- Gatilhos conhecidos: ${profile.triggers.join(', ')}
- Medicamentos: ${profile.medications.join(', ')}

Logs de saúde recentes (use isso para dar conselhos personalizados):
${recentLogs}

Seus objetivos:
1. Especialista em Doença Falciforme: Reconheça sinais de dor (crises vaso-oclusivas), febre ou infecção. Sugira hidratação, repouso ou calor local se apropriado. SEMPRE reforce que você não substitui o médico. Em caso de dor nível 8-10 ou febre alta, insista para ela ir ao hospital.
2. Apoio Psicológico: Escute ativamente. Pergunte sobre o dia dela. Valide os sentimentos dela.
3. Mapeamento: Tente entender se a dor atual tem relação com gatilhos (ex: frio, estresse).

Regras de Resposta:
- Responda SEMPRE em Português (Brasil).
- Se ela relatar dor, pergunte o nível de 0 a 10.
- Se ela estiver bem, sugira atividades que ela gosta (hobbies).
- Mantenha respostas concisas, mas profundas.
`;
};

export async function getChatResponse(
  message: string,
  history: Message[],
  profile: MauraProfile,
  logs: HealthLog[]
) {
  const contents = history.map(m => ({
    role: m.role,
    parts: [{ text: m.text }]
  }));

  // Add the current message
  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents,
    config: {
      systemInstruction: getSystemInstruction(profile, logs),
    },
  });

  return response.text || "Desculpe, tive um problema ao processar sua mensagem.";
}
