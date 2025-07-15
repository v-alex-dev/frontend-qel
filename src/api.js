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

    console.log("API Call - URL:", url); // Debug
    console.log("API Call - Config:", config); // Debug

    const response = await fetch(url, config);

    if (!response.ok) {
      // Essayer de récupérer le message d'erreur détaillé de l'API
      let errorMessage = `Erreur API: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error("Détails de l'erreur API:", errorData);
        if (errorData.message) {
          errorMessage += ` - ${errorData.message}`;
        }
        if (errorData.errors) {
          console.error("Erreurs de validation:", errorData.errors);
          errorMessage += ` - Erreurs: ${JSON.stringify(errorData.errors)}`;
        }
      } catch (e) {
        console.error("Impossible de parser le JSON d'erreur");
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur lors de l'appel API:", error);
    throw error;
  }
}

// Export des fonctions
export { API_CONFIG, apiCall };
