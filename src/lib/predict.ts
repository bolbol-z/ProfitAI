export interface PredictionInput {
  rdSpend: number;
  administration: number;
  marketingSpend: number;
  state: string;
}

export interface PredictionResult {
  id: string;
  input: PredictionInput;
  profit: number;
  timestamp: Date;
}

/**
 * Remplacez l'URL ci-dessous par l'endpoint de votre propre modèle.
 * Le body envoyé est un JSON avec les champs de PredictionInput.
 * La réponse attendue doit contenir un champ "profit" (number).
 */
export async function predictProfit(input: PredictionInput): Promise<number> {
  try {
    // 1. On tente l'appel à l'API
    // Note : Vérifiez bien si c'est /predict ou /predict/ au lieu de /docs
    const res = await fetch("http://127.0.0.1:8000/predict", { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rd_spend: input.rdSpend,
        administration: input.administration,
        marketing_spend: input.marketingSpend,
        state: input.state
      }),
    });

    // 2. Si le serveur répond avec une erreur (ex: 404, 500)
    if (!res.ok) {
      console.warn(`API Error: ${res.status}. Returning 0.`);
      return 0;
    }

    const data = await res.json();
    
    // 3. On vérifie si data.predicted_profit existe, sinon on retourne 0
    return data.predicted_profit !== undefined ? data.predicted_profit : 0;

  } catch (error) {
    // 4. Si le serveur est éteint ou l'URL est mauvaise (Erreur réseau)
    console.error("Impossible de contacter l'API. Vérifiez si votre serveur Python est lancé.", error);
    return 0; 
  }
}
