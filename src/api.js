// Configuration de l'API
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest", // Header pour Laravel
  },
};

// Fonction simple pour faire des requêtes API
async function apiCall(endpoint, options = {}) {
  try {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    const config = {
      headers: API_CONFIG.headers,
      ...options,
    };

    const response = await fetch(url, config);

    // Cloner immédiatement la réponse pour éviter les problèmes
    const responseClone = response.clone();

    if (!response.ok) {
      // Utiliser le clone pour lire l'erreur
      let errorMessage = `Erreur API: ${response.status}`;
      try {
        const errorData = await responseClone.json();

        if (errorData.message) {
          errorMessage += ` - ${errorData.message}`;
        }
        if (errorData.errors) {
          errorMessage += ` - Erreurs: ${JSON.stringify(errorData.errors)}`;
        }
      } catch (e) {
        // Erreur lors du parsing JSON d'erreur
      }
      throw new Error(errorMessage);
    }

    // Utiliser le clone pour lire les données de succès
    const result = await responseClone.json();
    return result;
  } catch (error) {
    throw error;
  }
}

// Export des fonctions
export { API_CONFIG, apiCall };
