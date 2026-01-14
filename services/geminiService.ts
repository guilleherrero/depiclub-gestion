
import { GoogleGenAI } from "@google/genai";
import { Sale, Expense } from '../types';

/**
 * Obtiene la API Key desde el entorno o desde la configuración guardada por el usuario.
 */
const getApiKey = () => {
  const savedConfig = localStorage.getItem('depiclub_v19_wa_config');
  if (savedConfig) {
    const config = JSON.parse(savedConfig);
    if (config.geminiApiKey) return config.geminiApiKey;
  }
  return process.env.API_KEY;
};

export const getBusinessStrategy = async (sales: Sale[], expenses: Expense[]) => {
  const apiKey = getApiKey();
  if (!apiKey) return "⚠️ API Key de Gemini no configurada. Ve a 'WhatsApp' para configurarla.";

  const ai = new GoogleGenAI({ apiKey });
  
  const salesSummary = sales.map(s => ({
    tipo: s.serviceType,
    monto: s.amount,
    comision: s.commissionAmount,
    depiladora: s.beauticianName
  }));

  const expensesSummary = expenses.map(e => ({
    categoria: e.category,
    monto: e.amount,
    desc: e.description
  }));

  const prompt = `Actúa como un Director Financiero (CFO) y Consultor de Marketing para un centro de estética.
  Analiza estos datos financieros del periodo y genera un informe estratégico:
  1. Salud Financiera: Compara Ingresos vs Egresos.
  2. Rendimiento: ¿Qué servicio es más rentable? (Cera vs Láser vs Estética).
  3. Estrategia de Crecimiento: ¿Qué promociones debería hacer? ¿Qué tratamientos debería impulsar?
  4. Consejos de Gestión: Sugerencias para reducir gastos o aumentar el ticket promedio.

  Datos de Ventas: ${JSON.stringify(salesSummary)}
  Datos de Gastos: ${JSON.stringify(expensesSummary)}

  Responde de forma profesional, estructurada y motivadora. Usa emojis para los puntos clave.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: "Eres un estratega de negocios especializado en la industria de la belleza y estética."
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error en AI Strategy:", error);
    return "Error al conectar con la Inteligencia Artificial.";
  }
};

export const getDailyInsights = async (sales: Sale[]) => {
  const apiKey = getApiKey();
  if (!apiKey) return "Configura la API Key para ver insights.";

  const ai = new GoogleGenAI({ apiKey });

  const summary = sales.map(s => ({
    tipo: s.serviceType,
    monto: s.amount,
    profesional: s.beauticianName
  }));

  const prompt = `Analiza estos datos de ventas del día y dame 3 insights rápidos y accionables:
  ${JSON.stringify(summary)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Eres un analista de datos ejecutivo para un centro de estética."
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error en Daily Insights:", error);
    return "No se pudieron obtener insights.";
  }
};
