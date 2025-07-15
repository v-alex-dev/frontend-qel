// Fonctions utilitaires simples

// Formater une date pour l'affichage
function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("fr-FR");
}

// Formater une heure
function formatTime(date) {
  if (!date) return "";
  return new Date(date).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Générer un ID unique simple
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Valider un email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Afficher un message de notification simple
function showNotification(message, type = "info") {
  // Créer un élément de notification simple
  const notification = document.createElement("div");
  notification.className = `fixed top-4 right-4 p-4 rounded shadow-lg z-50 ${
    type === "success"
      ? "bg-green-500 text-white"
      : type === "error"
      ? "bg-red-500 text-white"
      : "bg-blue-500 text-white"
  }`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Supprimer après 3 secondes
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

// Nettoyer les données d'un formulaire
function cleanFormData(formData) {
  const cleaned = {};
  for (const [key, value] of Object.entries(formData)) {
    cleaned[key] = typeof value === "string" ? value.trim() : value;
  }
  return cleaned;
}

// Export des fonctions
export {
  formatDate,
  formatTime,
  generateId,
  isValidEmail,
  showNotification,
  cleanFormData,
};
