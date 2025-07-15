// Service pour gérer les visiteurs
import { apiCall } from "../api.js";

// Récupérer un visiteur par email
async function getVisiteurByEmail(email) {
  try {
    const result = await apiCall(`/v1/visitor/search?email=${email}`);

    // Selon la doc API, la réponse contient { visitor: {...}, last_visit: {...} }
    if (result && result.visitor) {
      // Ajouter les infos de la dernière visite si disponibles
      const visiteur = {
        ...result.visitor,
        last_visit: result.last_visit,
      };
      return visiteur;
    } else {
      throw new Error("Format de réponse inattendu");
    }
  } catch (error) {
    throw error;
  }
}

// Enregistrer une entrée
async function enregistrerEntree(visiteurData) {
  return await apiCall("/v1/enter", {
    method: "POST",
    body: JSON.stringify(visiteurData),
  });
}

// Enregistrer une sortie
async function enregistrerSortie(visiteurData) {
  return await apiCall("/v1/exit", {
    method: "POST",
    body: JSON.stringify(visiteurData),
  });
}

// Enregistrer un retour
async function enregistrerRetour(visiteurData) {
  return await apiCall("/v1/return", {
    method: "POST",
    body: JSON.stringify(visiteurData),
  });
}

export {
  getVisiteurByEmail,
  enregistrerEntree,
  enregistrerSortie,
  enregistrerRetour,
};
