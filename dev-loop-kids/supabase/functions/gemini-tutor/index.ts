import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Validación de seguridad principal
    if (!GEMINI_API_KEY) {
       throw new Error("API Key de Gemini no configurada en las variables de entorno de Supabase.");
    }

    const { message, history, context, userName } = await req.json()

    const systemPrompt = `Eres DevLoopBot, un tutor experto de DevLoop Academy.
      Saluda siempre con entusiasmo a ${userName}. 
      CONTEXTO DE LA CLASE ACTUAL:
      """
      ${context || 'Cargando misión...'}
      """
      REGLAS DE ORO:
      1. Explica conceptos técnicos (Blender, Unity, Web) con analogías de videojuegos.
      2. Usa emojis y mantén un tono motivador.
      3. Si el estudiante pregunta algo fuera del contexto, intenta guiarlo de vuelta a la misión.
      4. Tus respuestas deben ser cortas y fáciles de leer.`

    // 2. Formateo estricto del historial
    // Gemini exige estrictamente que la conversación (contents) inicie con 'user'.
    let formattedHistory = history.map((h: any) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }]
    }));

    // Como el chatbot empieza saludando (assistant -> model), inyectamos un mensaje inicial de usuario
    // para cumplir con las reglas de estructura de la API.
    if (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
        formattedHistory.unshift({
            role: "user",
            parts: [{ text: "¡Hola! Estoy listo para empezar esta misión." }]
        });
    }

    // 3. Estructura optimizada para Gemini 1.5
    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        ...formattedHistory,
        { role: "user", parts: [{ text: message }] }
      ]
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

    const result = await response.json()

    // 4. Manejo de errores nativos de Gemini (¡Esto es vital para depurar!)
    if (!response.ok) {
        console.error("❌ Error de Gemini API:", JSON.stringify(result, null, 2));
        throw new Error(`Error de Gemini: ${result.error?.message || "Revisar logs"}`);
    }

    const reply = result.candidates[0].content.parts[0].text

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("❌ Edge Function Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})