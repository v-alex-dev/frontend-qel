// Service pour gérer les formations
import { apiCall } from "../api.js";

// Récupérer les formations du jour
async function getFormationsDuJour() {
  try {

    const result = await apiCall("/v1/trainings/today");


    // Vérifier si la réponse est un tableau ou contient un tableau
    if (Array.isArray(result)) {
      return result;
    } else if (result && Array.isArray(result.trainings)) {
      return result.trainings; // Selon la doc API
    } else {
      console.error("Service formations: Format de réponse inattendu:", result);
      return [];
    }
  } catch (error) {
    console.error("Service formations: Erreur lors de l'appel API:", error);
    return [];
  }
}

export { getFormationsDuJour };
