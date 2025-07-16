// Composant pour gérer la sortie des visiteurs
import {
  enregistrerSortie,
  getVisiteurByEmail,
  getVisiteurByBadgeId,
} from "../services/visiteurs.js";
import { showNotification, isValidEmail } from "../utils.js";
import {
  initQRScanner,
  stopQRScanner,
  isQRLibrariesLoaded,
} from "../utils/qrcode.js";

let visiteurCourant = null;
let currentQRScanner = null;

// Initialiser le composant de sortie
function initSortieComponent() {
  createSortieInterface();
  attachSortieEvents();
}

// Créer l'interface de sortie
function createSortieInterface() {
  const container = document.getElementById("sortie-container");
  if (!container) return;

  container.innerHTML = `
        <div class="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
            <h2 class="text-2xl font-bold text-center mb-6 text-red-600">Sortie Visiteur</h2>
            
            <!-- Boutons de choix de méthode -->
            <div class="flex mb-6 bg-gray-100 rounded-lg p-1">
                <button id="btn-search-manual-sortie" class="flex-1 px-4 py-2 rounded-md bg-red-600 text-white font-medium transition-colors">
                    📧 Recherche Email
                </button>
                <button id="btn-search-qr-sortie" class="flex-1 px-4 py-2 rounded-md bg-gray-300 text-gray-700 font-medium transition-colors">
                    📱 Scanner QR Code
                </button>
            </div>

            <!-- Section recherche manuelle -->
            <div id="section-search-manual-sortie" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Recherche par Email</label>
                    <input type="email" id="visiteur-email" placeholder="votre@email.com"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                </div>
                
                <button id="rechercher-email" 
                        class="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium">
                    Rechercher
                </button>
            </div>

            <!-- Section scanner QR -->
            <div id="section-search-qr-sortie" class="hidden">
                <div class="text-center">
                    <p class="text-sm text-gray-600 mb-4">Scannez votre QR code visiteur pour enregistrer votre sortie</p>
                    <div id="qr-scanner-sortie" class="max-w-md mx-auto"></div>
                    <button id="btn-stop-scanner-sortie" class="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 hidden">
                        ❌ Arrêter le scanner
                    </button>
                </div>
            </div>
            
            <div id="visiteur-info" class="hidden mt-6 p-4 border rounded-lg bg-gray-50">
                <h3 class="font-bold mb-2">Informations du visiteur</h3>
                <div id="visiteur-details"></div>
                <button id="confirmer-sortie" 
                        class="w-full mt-4 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium">
                    Confirmer la sortie
                </button>
            </div>
        </div>
    `;
}

// Attacher les événements
function attachSortieEvents() {
  document
    .getElementById("rechercher-email")
    .addEventListener("click", rechercherParEmail);

  // Permettre la recherche avec la touche Entrée
  document
    .getElementById("visiteur-email")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        rechercherParEmail();
      }
    });

  document
    .getElementById("btn-search-manual-sortie")
    .addEventListener("click", function () {
      switchToManualSearchSortie();
    });

  document
    .getElementById("btn-search-qr-sortie")
    .addEventListener("click", function () {
      switchToQRSearchSortie();
    });

  document
    .getElementById("btn-stop-scanner-sortie")
    .addEventListener("click", function () {
      stopCurrentScannerSortie();
    });
}

// Rechercher par email
async function rechercherParEmail() {
  const email = document.getElementById("visiteur-email").value.trim();

  if (!email) {
    showNotification("Veuillez saisir un email", "error");
    return;
  }

  if (!isValidEmail(email)) {
    showNotification("Veuillez saisir un email valide", "error");
    return;
  }

  try {
    const visiteur = await getVisiteurByEmail(email);

    // Vérifier si le visiteur est encore présent selon sa dernière visite
    if (visiteur.last_visit && visiteur.last_visit.exited_at) {
      showNotification("Ce visiteur est déjà sorti", "error");
      return;
    }

    // Vérifier si le visiteur a au moins une visite active
    if (!visiteur.last_visit || visiteur.last_visit.exited_at) {
      showNotification("Ce visiteur n'a pas de visite active", "error");
      return;
    }

    afficherInfoVisiteur(visiteur);
  } catch (error) {
    showNotification("Visiteur non trouvé ou erreur de recherche", "error");
    cacherInfoVisiteur();
  }
}

// Gérer le QR Code scanné
async function handleQRCodeScanned(decodedText) {
  // Arrêter le scanner
  if (currentQRScanner) {
    stopQRScanner(currentQRScanner);
    currentQRScanner = null;
    document.getElementById("btn-stop-scanner-sortie").classList.add("hidden");
  }

  // Le QR code contient le badge_id, pas l'email
  try {
    showNotification("QR Code détecté ! Recherche en cours...", "info");
    const visiteur = await getVisiteurByBadgeId(decodedText);

    // Vérifier si le visiteur est encore présent
    if (visiteur.last_visit && visiteur.last_visit.exited_at) {
      showNotification("Ce visiteur est déjà sorti", "error");
      return;
    }

    afficherInfoVisiteur(visiteur);
    showNotification("Visiteur trouvé via QR Code !", "success");
  } catch (error) {
    showNotification(
      `Badge ID scanné: ${decodedText} - Visiteur non trouvé`,
      "error"
    );
  }
}

// Afficher les informations du visiteur
function afficherInfoVisiteur(visiteur) {
  visiteurCourant = visiteur;

  // Récupérer les infos de la dernière visite pour l'heure d'entrée
  const lastVisit = visiteur.last_visit;
  let heureEntree = "Non disponible";
  if (lastVisit && lastVisit.entered_at) {
    heureEntree = new Date(lastVisit.entered_at).toLocaleString("fr-FR");
  }

  const details = document.getElementById("visiteur-details");
  details.innerHTML = `
        <div class="space-y-2">
            <p><strong>Nom:</strong> ${visiteur.last_name || "Non défini"}</p>
            <p><strong>Prénom:</strong> ${
              visiteur.first_name || "Non défini"
            }</p>
            <p><strong>Email:</strong> ${visiteur.email || "Non défini"}</p>
            <p><strong>Heure d'entrée:</strong> ${heureEntree}</p>
            <p><strong>Statut:</strong> <span class="text-green-600 font-medium">Présent</span></p>
        </div>
    `;

  document.getElementById("visiteur-info").classList.remove("hidden");

  // Attacher l'événement de confirmation
  document.getElementById("confirmer-sortie").onclick = confirmerSortie;
}

// Cacher les informations du visiteur
function cacherInfoVisiteur() {
  document.getElementById("visiteur-info").classList.add("hidden");
  visiteurCourant = null;
}

// Confirmer la sortie
async function confirmerSortie() {
  if (!visiteurCourant) {
    showNotification("Aucun visiteur sélectionné", "error");
    return;
  }

  // Vérifier qu'on a bien un badge_id (soit dans le visiteur, soit dans last_visit)
  let badgeId =
    visiteurCourant.badge_id || visiteurCourant.last_visit?.badge_id;

  if (!badgeId) {
    showNotification("Impossible de trouver le badge ID du visiteur", "error");
    return;
  }

  try {
    // Préparer les données pour la sortie selon la doc API Laravel
    const sortieData = {
      badge_id: badgeId,
    };

    await enregistrerSortie(sortieData);

    showNotification("Sortie enregistrée avec succès ! Au revoir !", "success");

    // Réinitialiser l'interface
    document.getElementById("visiteur-email").value = "";
    cacherInfoVisiteur();
  } catch (error) {
    showNotification("Erreur lors de l'enregistrement de la sortie", "error");
  }
}

// === NOUVELLES FONCTIONS QR CODE POUR SORTIE ===

// Basculer vers la recherche manuelle
function switchToManualSearchSortie() {
  // Mettre à jour l'interface
  document
    .getElementById("btn-search-manual-sortie")
    .classList.remove("bg-gray-300", "text-gray-700");
  document
    .getElementById("btn-search-manual-sortie")
    .classList.add("bg-red-600", "text-white");

  document
    .getElementById("btn-search-qr-sortie")
    .classList.remove("bg-red-600", "text-white");
  document
    .getElementById("btn-search-qr-sortie")
    .classList.add("bg-gray-300", "text-gray-700");

  // Afficher/cacher les sections
  document.getElementById("section-search-qr-sortie").classList.add("hidden");
  document
    .getElementById("section-search-manual-sortie")
    .classList.remove("hidden");

  // Arrêter le scanner s'il est actif
  stopCurrentScannerSortie();
}

// Basculer vers le scanner QR
function switchToQRSearchSortie() {
  // Vérifier que les librairies QR sont disponibles
  if (!isQRLibrariesLoaded()) {
    showNotification(
      "Les librairies QR code ne sont pas encore chargées. Veuillez réessayer.",
      "error"
    );
    return;
  }

  // Mettre à jour l'interface
  document
    .getElementById("btn-search-qr-sortie")
    .classList.remove("bg-gray-300", "text-gray-700");
  document
    .getElementById("btn-search-qr-sortie")
    .classList.add("bg-red-600", "text-white");

  document
    .getElementById("btn-search-manual-sortie")
    .classList.remove("bg-red-600", "text-white");
  document
    .getElementById("btn-search-manual-sortie")
    .classList.add("bg-gray-300", "text-gray-700");

  // Afficher/cacher les sections
  document
    .getElementById("section-search-manual-sortie")
    .classList.add("hidden");
  document
    .getElementById("section-search-qr-sortie")
    .classList.remove("hidden");

  // Démarrer le scanner QR
  startQRScannerSortie();
}

// Démarrer le scanner QR pour la sortie
function startQRScannerSortie() {
  // Arrêter le scanner précédent s'il existe
  stopCurrentScannerSortie();

  // Vider le conteneur du scanner
  document.getElementById("qr-scanner-sortie").innerHTML = "";

  // Démarrer le nouveau scanner
  currentQRScanner = initQRScanner(
    "qr-scanner-sortie",
    handleQRCodeScanned,
    onQRScanErrorSortie
  );

  // Afficher le bouton d'arrêt
  document.getElementById("btn-stop-scanner-sortie").classList.remove("hidden");
}

// Callback en cas d'erreur de scan pour la sortie
function onQRScanErrorSortie(error) {
  // Ne pas afficher les erreurs de scan en continu, juste les erreurs importantes
  if (error && !error.includes("NotFoundException")) {
    // Optionnel : log les erreurs importantes seulement
  }
}

// Arrêter le scanner QR actuel pour la sortie
function stopCurrentScannerSortie() {
  if (currentQRScanner) {
    stopQRScanner(currentQRScanner);
    currentQRScanner = null;
  }

  // Cacher le bouton d'arrêt
  const btnStop = document.getElementById("btn-stop-scanner-sortie");
  if (btnStop) {
    btnStop.classList.add("hidden");
  }

  // Vider le conteneur du scanner
  const scannerContainer = document.getElementById("qr-scanner-sortie");
  if (scannerContainer) {
    scannerContainer.innerHTML = '<p class="text-gray-500">Scanner arrêté</p>';
  }
}

export { initSortieComponent };
