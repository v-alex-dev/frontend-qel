// Service pour gérer le personnel
import { apiCall } from "../api.js";

// Récupérer tout le personnel
async function getPersonnel() {
  try {
    const result = await apiCall("/v1/staff-members");

    // Vérifier si la réponse est un tableau ou contient un tableau
    if (Array.isArray(result)) {
      return result;
    } else if (result && Array.isArray(result.staff_members)) {
      return result.staff_members; // Selon la doc API
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
}

export { getPersonnel };
