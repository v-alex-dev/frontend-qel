// Utilitaires pour la gestion des QR codes

/**
 * Générer un QR code avec l'ID du badge
 * @param {string} badgeId - L'ID du badge visiteur
 * @param {string} containerId - L'ID du conteneur HTML où afficher le QR code
 * @returns {Object} Instance du QR code pour manipulation future
 */
export function generateQRCode(badgeId, containerId) {
  // Vider le conteneur
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Conteneur ${containerId} non trouvé`);
    return null;
  }

  container.innerHTML = "";

  // Créer le QR code avec les options selon la doc
  const qrcode = new QRCode(container, {
    text: badgeId,
    width: 128,
    height: 128,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });

  return qrcode;
}

/**
 * Initialiser le scanner QR code
 * @param {string} containerId - L'ID du conteneur HTML pour le scanner
 * @param {Function} onSuccess - Callback appelé quand un QR code est scanné avec succès
 * @param {Function} onError - Callback appelé en cas d'erreur (optionnel)
 * @returns {Object} Instance du scanner pour manipulation future
 */
export function initQRScanner(containerId, onSuccess, onError = null) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Conteneur ${containerId} non trouvé`);
    return null;
  }

  // Configuration du scanner selon la doc html5-qrcode
  const scanner = new Html5QrcodeScanner(
    containerId,
    {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    },
    false // verbose
  );

  // Fonction de succès par défaut
  function defaultOnSuccess(decodedText, decodedResult) {
    // QR Code scanné avec succès

    // Arrêter le scanner
    scanner.clear();

    // Appeler le callback utilisateur
    if (onSuccess) {
      onSuccess(decodedText, decodedResult);
    }
  }

  // Fonction d'erreur par défaut
  function defaultOnError(error) {
    // Ne pas afficher les erreurs de scan en continu
    if (onError) {
      onError(error);
    }
  }

  // Démarrer le scanner
  scanner.render(defaultOnSuccess, defaultOnError);

  return scanner;
}

/**
 * Arrêter un scanner QR code
 * @param {Object} scanner - Instance du scanner à arrêter
 */
export function stopQRScanner(scanner) {
  if (scanner) {
    scanner
      .clear()
      .then(() => {
        // Scanner QR arrêté
      })
      .catch((err) => {
        console.error("Erreur lors de l'arrêt du scanner:", err);
      });
  }
}

/**
 * Créer un QR code standalone dans un nouveau conteneur
 * @param {string} badgeId - L'ID du badge pour lequel générer le QR code
 * @param {Object} options - Options de personnalisation (optionnel)
 * @returns {HTMLElement} L'élément HTML contenant le QR code
 */
export function createStandaloneQRCode(badgeId, options = {}) {
  const defaultOptions = {
    width: 150,
    height: 150,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  };

  // Fusionner les options
  const qrOptions = { ...defaultOptions, ...options, text: badgeId };

  // Créer un conteneur temporaire
  const tempDiv = document.createElement("div");
  tempDiv.style.display = "inline-block";

  // Générer le QR code
  const qrcode = new QRCode(tempDiv, qrOptions);

  return tempDiv;
}

/**
 * Afficher un QR code dans une popup/modal
 * @param {string} badgeId - L'ID du badge
 * @param {string} visitorName - Nom du visiteur (optionnel)
 */
export function showQRCodeModal(badgeId, visitorName = "") {
  // Créer la modal
  const modal = document.createElement("div");
  modal.className =
    "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-sm mx-4">
      <div class="text-center">
        <h3 class="text-lg font-bold mb-2">QR Code Visiteur</h3>
        ${visitorName ? `<p class="text-gray-600 mb-4">${visitorName}</p>` : ""}
        <div id="modal-qrcode" class="flex justify-center mb-4"></div>
        <p class="text-sm text-gray-500 mb-4">Badge ID: ${badgeId}</p>
        <button id="close-qr-modal" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Fermer
        </button>
      </div>
    </div>
  `;

  // Ajouter au DOM
  document.body.appendChild(modal);

  // Générer le QR code dans la modal
  setTimeout(() => {
    if (isQRLibrariesLoaded()) {
      generateQRCode(badgeId, "modal-qrcode");
    }
  }, 100);

  // Gérer la fermeture
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.id === "close-qr-modal") {
      document.body.removeChild(modal);
    }
  });

  return modal;
}

/**
 * Vérifier si les librairies QR code sont chargées
 * @returns {boolean} true si les librairies sont disponibles
 */
export function isQRLibrariesLoaded() {
  return (
    typeof QRCode !== "undefined" && typeof Html5QrcodeScanner !== "undefined"
  );
}
