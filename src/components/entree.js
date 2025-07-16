// Composant pour gérer l'entrée des visiteurs
import { enregistrerEntree } from "../services/visiteurs.js";
import { getPersonnel } from "../services/personnel.js";
import { getFormationsDuJour } from "../services/formations.js";
import {
  getVisiteurByEmail,
  getVisiteurByBadgeId,
} from "../services/visiteurs.js";
import { isValidEmail, showNotification, cleanFormData } from "../utils.js";
import {
  generateQRCode,
  initQRScanner,
  stopQRScanner,
  isQRLibrariesLoaded,
} from "../utils/qrcode.js";
import {
  printVisitorBadge,
  formatBadgeDataForPrint,
} from "../utils/printBadge.js";

// Variables globales pour stocker les données
let personnel = [];
let formations = [];
let currentQRScanner = null; // Pour gérer le scanner QR actuel

// Initialiser le composant d'entrée
async function initEntreeComponent() {
  try {
    // Charger les données nécessaires

    personnel = await getPersonnel();

    formations = await getFormationsDuJour();

    // Vérifier que les données sont des tableaux
    if (!Array.isArray(personnel)) {
      console.error("personnel n'est pas un tableau:", personnel);
      personnel = []; // Initialiser comme tableau vide
    }

    if (!Array.isArray(formations)) {
      console.error("formations n'est pas un tableau:", formations);
      formations = []; // Initialiser comme tableau vide
    }

    // Créer l'interface
    createEntreeInterface();

    // Attacher les événements
    attachEntreeEvents();
  } catch (error) {
    console.error("Erreur lors de l'initialisation:", error);

    // Initialiser avec des tableaux vides en cas d'erreur
    personnel = [];
    formations = [];

    // Créer l'interface quand même
    createEntreeInterface();
    attachEntreeEvents();

    showNotification(
      "Erreur lors du chargement des données. Certaines fonctionnalités peuvent être limitées.",
      "error"
    );
  }
}

// Créer l'interface d'entrée
function createEntreeInterface() {
  const container = document.getElementById("entree-container");
  if (!container) return;

  container.innerHTML = `
        <div class="max-w-4xl mx-auto space-y-6">
            <!-- Section recherche visiteur existant -->
            <div class="bg-white p-6 rounded-lg shadow-lg">
                <h2 class="text-xl font-bold text-center mb-4 text-green-600">Visiteur de retour ?</h2>
                
                <!-- Switch entre méthodes de recherche -->
                <div class="flex justify-center mb-4">
                    <div class="flex bg-gray-100 rounded-lg p-1">
                        <button id="btn-search-manual" class="px-4 py-2 rounded-md bg-green-600 text-white font-medium transition-colors">
                            🔍 Recherche manuelle
                        </button>
                        <button id="btn-search-qr" class="px-4 py-2 rounded-md bg-gray-300 text-gray-700 font-medium transition-colors">
                            📱 Scanner QR Code
                        </button>
                    </div>
                </div>

                <!-- Section recherche manuelle -->
                <div id="section-search-manual" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Recherche par badge ID -->
                    <div class="max-w-md mx-auto">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Badge id</label>
                        <div class="flex gap-2">
                            <input type="text" id="search-badgeId" placeholder="Votre badge ID"
                                   class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                            <button type="button" id="search-by-badgeId" 
                                    class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                                Rechercher
                            </button>
                        </div>
                    </div>
                    
                    <!-- Recherche par email -->
                    <div class="max-w-md mx-auto">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div class="flex gap-2">
                            <input type="email" id="search-email" placeholder="votre@email.com"
                                   class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                            <button type="button" id="search-by-email" 
                                    class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                                Rechercher
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Section scanner QR -->
                <div id="section-search-qr" class="hidden">
                    <div class="text-center">
                        <p class="text-sm text-gray-600 mb-4">Scannez votre QR code visiteur pour retrouver vos informations</p>
                        <div id="qr-scanner" class="max-w-md mx-auto"></div>
                        <button id="btn-stop-scanner" class="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 hidden">
                            ❌ Arrêter le scanner
                        </button>
                    </div>
                </div>
                
                <!-- Résultat de recherche -->
                <div id="search-result" class="hidden mt-4 p-4 border rounded-lg bg-blue-50">
                    <h3 class="font-bold text-blue-800 mb-2">Visiteur trouvé !</h3>
                    <div id="search-details"></div>
                    <div class="mt-4 flex gap-2">
                        <button id="use-existing" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                            Utiliser ces informations
                        </button>
                        <button id="cancel-search" class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
                            Annuler
                        </button>
                    </div>
                </div>
            </div>



            <!-- Formulaire d'entrée -->
            <div class="bg-white p-6 rounded-lg shadow-lg">
                <h2 class="text-2xl font-bold text-center mb-6 text-blue-600">Nouvelle Entrée</h2>
                
                <form id="entree-form" class="space-y-4">
                    <!-- Informations personnelles -->
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                            <input type="text" id="nom" name="nom" required 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                            <input type="text" id="prenom" name="prenom" required 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input type="email" id="email" name="email" required 
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    
                    <!-- Type de visite -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Objet de la visite *</label>
                        <div class="space-y-2">
                            <label class="flex items-center">
                                <input type="radio" name="type-visite" value="personnel" 
                                       class="mr-2 text-blue-600 focus:ring-blue-500">
                                <span>Visiter un membre du personnel</span>
                            </label>
                            <label class="flex items-center">
                                <input type="radio" name="type-visite" value="formation" 
                                       class="mr-2 text-blue-600 focus:ring-blue-500">
                                <span>Participer à une formation</span>
                            </label>
                        </div>
                    </div>
                    
                    <!-- Menu personnel (caché par défaut) -->
                    <div id="div-personnel" class="hidden">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Membre du personnel *</label>
                        <select id="personnel-select" name="personnel" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Choisir un membre du personnel</option>
                        </select>
                    </div>
                    
                    <!-- Menu formations (caché par défaut) -->
                    <div id="div-formations" class="hidden">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Formation *</label>
                        <select id="formations-select" name="formation" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Choisir une formation</option>
                        </select>
                    </div>
                    
                    <button type="submit" 
                            class="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-lg">
                        ✓ Enregistrer l'entrée
                    </button>
                </form>
            </div>
            
            <!-- Badge visiteur (caché par défaut) -->
            <div id="badge-visiteur" class="hidden">
            </div>
        </div>
    `;

  // Remplir les menus déroulants
  remplirMenuPersonnel();
  remplirMenuFormations();
}

// Remplir le menu du personnel
function remplirMenuPersonnel() {
  const selectPersonnel = document.getElementById("personnel-select");
  if (!selectPersonnel) return;

  selectPersonnel.innerHTML =
    '<option value="">Choisir un membre du personnel</option>';

  // Vérifier que personnel est un tableau
  if (!Array.isArray(personnel)) {
    console.error(
      "personnel n'est pas un tableau dans remplirMenuPersonnel:",
      personnel
    );
    selectPersonnel.innerHTML +=
      '<option value="" disabled>Erreur de chargement du personnel</option>';
    return;
  }

  if (personnel.length === 0) {
    selectPersonnel.innerHTML +=
      '<option value="" disabled>Aucun membre du personnel disponible</option>';
    return;
  }

  personnel.forEach((personne) => {
    const option = document.createElement("option");
    option.value = personne.id || personne.Id || "";

    // Utiliser les noms de propriétés selon la doc API
    const nom = personne.last_name || "Nom inconnu";
    const prenom = personne.first_name || "Prénom inconnu";
    const fonction = personne.function || "Fonction inconnue";
    const local = personne.room || "Local inconnu";

    option.textContent = `${nom} ${prenom} - ${fonction} (${local})`;

    // Debug: afficher la structure de l'objet si undefined
    if (nom.includes("inconnu") || prenom.includes("inconnu")) {
    }

    selectPersonnel.appendChild(option);
  });
}

// Remplir le menu des formations
function remplirMenuFormations() {
  const selectFormations = document.getElementById("formations-select");
  if (!selectFormations) return;

  selectFormations.innerHTML =
    '<option value="">Choisir une formation</option>';

  // Vérifier que formations est un tableau
  if (!Array.isArray(formations)) {
    console.error(
      "formations n'est pas un tableau dans remplirMenuFormations:",
      formations
    );
    selectFormations.innerHTML +=
      '<option value="" disabled>Erreur de chargement des formations</option>';
    return;
  }

  if (formations.length === 0) {
    selectFormations.innerHTML +=
      '<option value="" disabled>Aucune formation disponible aujourd\'hui</option>';
    return;
  }

  formations.forEach((formation) => {
    const option = document.createElement("option");
    option.value = formation.id || formation.Id || "";

    // Utiliser les noms de propriétés selon la doc API
    const intitule = formation.title || "Formation inconnue";
    const local = formation.room || "Local inconnu";

    option.textContent = `${intitule} - ${local}`;

    // Debug: afficher la structure de l'objet si undefined
    if (intitule.includes("inconnu") || local.includes("inconnu")) {
      console.log("Structure de l'objet formation:", formation);
    }

    selectFormations.appendChild(option);
  });
}

// Attacher les événements
function attachEntreeEvents() {
  const typeVisiteRadios = document.querySelectorAll(
    'input[name="type-visite"]'
  );
  const formulaireEntree = document.getElementById("entree-form");
  const searchByEmail = document.getElementById("search-by-email");
  const searchByBadgeId = document.getElementById("search-by-badgeId");

  // Nouveaux boutons pour le switch QR/Manuel
  const btnSearchManual = document.getElementById("btn-search-manual");
  const btnSearchQR = document.getElementById("btn-search-qr");
  const btnStopScanner = document.getElementById("btn-stop-scanner");

  console.log(
    "attachEntreeEvents: Nombre de boutons radio trouvés:",
    typeVisiteRadios.length
  ); // Debug

  // Gérer l'affichage conditionnel des menus
  typeVisiteRadios.forEach((radio, index) => {
    radio.addEventListener("change", gererAffichageMenus);
  });

  // Gérer la soumission du formulaire
  if (formulaireEntree) {
    formulaireEntree.addEventListener("submit", gererSoumissionEntree);
  }

  // Gérer la recherche par email
  if (searchByEmail) {
    searchByEmail.addEventListener("click", rechercherParEmail);
  }

  if (searchByBadgeId) {
    searchByBadgeId.addEventListener("click", rechercherParBadgeId);
  }

  // Gérer le switch entre recherche manuelle et QR
  if (btnSearchManual) {
    btnSearchManual.addEventListener("click", switchToManualSearch);
  }

  if (btnSearchQR) {
    btnSearchQR.addEventListener("click", switchToQRSearch);
  }

  if (btnStopScanner) {
    btnStopScanner.addEventListener("click", stopCurrentScanner);
  }
}

// Gérer l'affichage des menus selon le type de visite
function gererAffichageMenus() {
  const typeVisite = document.querySelector(
    'input[name="type-visite"]:checked'
  )?.value;
  const divPersonnel = document.getElementById("div-personnel");
  const divFormations = document.getElementById("div-formations");

  if (typeVisite === "personnel") {
    divPersonnel?.classList.remove("hidden");
    divFormations?.classList.add("hidden");
  } else if (typeVisite === "formation") {
    divPersonnel?.classList.add("hidden");
    divFormations?.classList.remove("hidden");
  } else {
    divPersonnel?.classList.add("hidden");
    divFormations?.classList.add("hidden");
  }
}

// Rechercher par email
async function rechercherParEmail() {
  const email = document.getElementById("search-email").value.trim();
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
    afficherResultatRecherche(visiteur);
  } catch (error) {
    showNotification("Visiteur non trouvé avec cet email", "error");
    cacherResultatRecherche();
  }
}

async function rechercherParBadgeId() {
  const badgeId = document.getElementById("search-badgeId").value.trim();
  console.log("Recherche par badge ID:", badgeId); // Debug

  if (!badgeId) {
    showNotification("Veuillez saisir un badge ID", "error");
    return;
  }

  try {
    showNotification("Recherche en cours...", "info");
    const visiteur = await getVisiteurByBadgeId(badgeId);
    afficherResultatRecherche(visiteur);
  } catch (error) {
    console.error("Erreur lors de la recherche par badge ID:", error);

    // Vérifier si c'est une erreur réseau/CORS
    if (error.message && error.message.includes("fetch")) {
      showNotification(
        "Erreur de connexion au serveur. Veuillez réessayer.",
        "error"
      );
    } else {
      showNotification("Visiteur non trouvé avec ce badge ID", "error");
    }
    cacherResultatRecherche();
  }
}

// Afficher le résultat de recherche
function afficherResultatRecherche(visiteur) {
  const searchResult = document.getElementById("search-result");
  const searchDetails = document.getElementById("search-details");

  // Déterminer le statut selon la dernière visite
  let statut = "Jamais venu";
  if (visiteur.last_visit) {
    statut = visiteur.last_visit.exited_at ? "Sorti" : "Présent";
  }

  searchDetails.innerHTML = `
        <p><strong>Nom:</strong> ${visiteur.last_name || "Non défini"}</p>
        <p><strong>Prénom:</strong> ${visiteur.first_name || "Non défini"}</p>
        <p><strong>Email:</strong> ${visiteur.email || "Non défini"}</p>
        <p><strong>Statut:</strong> ${statut}</p>
    `;

  searchResult.classList.remove("hidden");

  // Attacher les événements aux boutons
  document.getElementById("use-existing").onclick = () =>
    utiliserVisiteurExistant(visiteur);
  document.getElementById("cancel-search").onclick = cacherResultatRecherche;
}

// Cacher le résultat de recherche
function cacherResultatRecherche() {
  document.getElementById("search-result").classList.add("hidden");
}

// Utiliser un visiteur existant
function utiliserVisiteurExistant(visiteur) {
  document.getElementById("nom").value = visiteur.last_name || "";
  document.getElementById("prenom").value = visiteur.first_name || "";
  document.getElementById("email").value = visiteur.email || "";

  cacherResultatRecherche();
  showNotification("Informations récupérées !", "success");
}

// Gérer la soumission du formulaire d'entrée
async function gererSoumissionEntree(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData.entries());

  // Validation simple
  if (!data.nom || !data.prenom || !data.email) {
    showNotification("Veuillez remplir tous les champs obligatoires", "error");
    return;
  }

  if (!isValidEmail(data.email)) {
    showNotification("Veuillez saisir un email valide", "error");
    return;
  }

  if (!data["type-visite"]) {
    showNotification("Veuillez choisir le type de visite", "error");
    return;
  }

  if (data["type-visite"] === "personnel" && !data.personnel) {
    showNotification("Veuillez choisir un membre du personnel", "error");
    return;
  }

  if (data["type-visite"] === "formation" && !data.formation) {
    showNotification("Veuillez choisir une formation", "error");
    return;
  }

  try {
    // Déterminer le purpose et les IDs selon le type de visite choisi
    let purpose, staffMemberId, trainingId;

    if (data["type-visite"] === "personnel") {
      purpose = "visite";
      staffMemberId = data.personnel ? parseInt(data.personnel, 10) : null;
      trainingId = null;
    } else if (data["type-visite"] === "formation") {
      purpose = "formation";
      staffMemberId = null;
      trainingId = data.formation ? parseInt(data.formation, 10) : null;
    }

    // Nettoyer les données et adapter aux noms de champs attendus par l'API Laravel
    const visiteurData = cleanFormData({
      first_name: data.prenom, // Laravel attend first_name
      last_name: data.nom, // Laravel attend last_name
      email: data.email,
      purpose: purpose, // "visite" pour personnel, "formation" pour formation
      staff_member_id: staffMemberId, // ID du membre du personnel si visite
      training_id: trainingId, // ID de la formation si formation
    });

    // Enregistrer l'entrée
    const resultat = await enregistrerEntree(visiteurData);

    // Afficher le badge
    afficherBadge(resultat);

    // Réinitialiser le formulaire
    event.target.reset();
    gererAffichageMenus();

    showNotification("Entrée enregistrée avec succès !", "success");
  } catch (error) {
    console.error("Erreur lors de l'enregistrement:", error);
    showNotification("Erreur lors de l'enregistrement de l'entrée", "error");
  }
}

// Afficher le badge du visiteur
function afficherBadge(apiResponse) {
  const divBadge = document.getElementById("badge-visiteur");
  if (!divBadge) return;

  // Extraire les données de la réponse selon la doc API
  const visitor = apiResponse.visitor;
  const visit = apiResponse.visit;
  const badgeId = apiResponse.badge_id;

  // Trouver les informations de destination
  let destination = "";
  let contact = "";

  if (visit.purpose === "visite" && visit.staff_member_id) {
    const personne = personnel.find((p) => p.id == visit.staff_member_id);
    if (personne) {
      destination = personne.room;
      contact = `${personne.last_name} ${personne.first_name}`;
    }
  } else if (visit.purpose === "formation" && visit.training_id) {
    const formation = formations.find((f) => f.id == visit.training_id);
    if (formation) {
      destination = formation.room;
      contact = formation.title;
    }
  }

  divBadge.innerHTML = `
    <div class="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-300">
        <!-- Badge simple inspiré du PDF -->
        <div id="printable-badge" style="
            padding: 20px;
            display: flex;
            gap: 16px;
            min-height: 160px;
        ">
            <!-- Informations visiteur -->
            <div style="flex: 1;">
                <div style="
                    font-size: 20px;
                    font-weight: bold;
                    margin-bottom: 12px;
                    color: #000;
                ">
                    ${visitor.first_name} ${visitor.last_name}
                </div>
                
                <div style="font-size: 14px; line-height: 1.6; color: #333;">
                    <div style="margin-bottom: 4px;">
                        <strong>Local:</strong> ${destination}
                    </div>
                    <div style="margin-bottom: 4px;">
                        <strong>Voir:</strong> ${contact}
                    </div>
                    <div style="margin-bottom: 4px;">
                        <strong>Type:</strong> ${
                          visit.purpose === "visite" ? "visite" : "formation"
                        }
                    </div>
                    <div style="margin-bottom: 4px;">
                        <strong>Badge ID:</strong> ${badgeId}
                    </div>
                </div>
            </div>
            
            <!-- Section QR Code -->
            <div style="
                width: 80px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            ">
                <div style="
                    border: 1px solid #ccc;
                    padding: 4px;
                    background: white;
                ">
                    <div id="badge-qrcode" style="width: 60px; height: 60px;"></div>
                </div>
                <div style="
                    font-size: 10px;
                    margin-top: 4px;
                    text-align: center;
                    color: #666;
                ">
                    Sca
                </div>
            </div>
        </div>
        
        <!-- Footer du badge -->
        <div style="
            border-top: 1px solid #eee;
            padding: 8px 20px;
            font-size: 10px;
            color: #666;
            text-align: center;
            background: #f9f9f9;
        ">
            Valide le ${new Date().toLocaleDateString(
              "fr-FR"
            )} à ${new Date().toLocaleTimeString("fr-FR")} • www.cepegra.be
        </div>
        
        <!-- Boutons d'action -->
        <div class="p-4 text-center space-y-2">
            <div class="flex gap-2 justify-center">
                <button id="print-badge-btn" 
                        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
                    🖨️ Imprimer ce Badge
                </button>
                <button onclick="this.parentElement.parentElement.parentElement.innerHTML=''" 
                        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm">
                    Fermer
                </button>
            </div>
            <p class="text-xs text-gray-500">Le badge s'ouvrira dans une nouvelle fenêtre pour l'impression</p>
        </div>
    </div>
  `;

  divBadge.classList.remove("hidden");

  // Préparer les données pour l'impression du badge
  const badgeData = formatBadgeDataForPrint(apiResponse, personnel, formations);

  // Générer le QR code avec le badge ID
  // Attendre un peu que le DOM soit mis à jour
  setTimeout(() => {
    if (isQRLibrariesLoaded()) {
      generateQRCode(badgeId, "badge-qrcode");
    } else {
      console.warn("Librairies QR code non disponibles");
      document.getElementById("badge-qrcode").innerHTML =
        '<p class="text-xs text-gray-500">QR code non disponible</p>';
    }

    // Attacher l'événement d'impression du badge
    const printBtn = document.getElementById("print-badge-btn");
    if (printBtn) {
      printBtn.addEventListener("click", () => {
        // Créer une fenêtre d'impression dédiée
        createPrintWindow(badgeData, badgeId);
      });
    }
  }, 100);
}

// === NOUVELLES FONCTIONS QR CODE ===

// Basculer vers la recherche manuelle
function switchToManualSearch() {
  // Arrêter le scanner s'il est actif
  stopCurrentScanner();

  // Mettre à jour l'interface
  document
    .getElementById("btn-search-manual")
    .classList.remove("bg-gray-300", "text-gray-700");
  document
    .getElementById("btn-search-manual")
    .classList.add("bg-green-600", "text-white");

  document
    .getElementById("btn-search-qr")
    .classList.remove("bg-green-600", "text-white");
  document
    .getElementById("btn-search-qr")
    .classList.add("bg-gray-300", "text-gray-700");

  // Afficher/cacher les sections
  document.getElementById("section-search-manual").classList.remove("hidden");
  document.getElementById("section-search-qr").classList.add("hidden");
}

// Basculer vers le scanner QR
function switchToQRSearch() {
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
    .getElementById("btn-search-qr")
    .classList.remove("bg-gray-300", "text-gray-700");
  document
    .getElementById("btn-search-qr")
    .classList.add("bg-green-600", "text-white");

  document
    .getElementById("btn-search-manual")
    .classList.remove("bg-green-600", "text-white");
  document
    .getElementById("btn-search-manual")
    .classList.add("bg-gray-300", "text-gray-700");

  // Afficher/cacher les sections
  document.getElementById("section-search-manual").classList.add("hidden");
  document.getElementById("section-search-qr").classList.remove("hidden");

  // Démarrer le scanner QR
  startQRScanner();
}

// Démarrer le scanner QR pour la recherche
function startQRScanner() {
  // Arrêter le scanner précédent s'il existe
  stopCurrentScanner();

  // Vider le conteneur du scanner
  document.getElementById("qr-scanner").innerHTML = "";

  // Démarrer le nouveau scanner
  currentQRScanner = initQRScanner(
    "qr-scanner",
    onQRCodeScanned,
    onQRScanError
  );

  // Afficher le bouton d'arrêt
  document.getElementById("btn-stop-scanner").classList.remove("hidden");
}

// Callback quand un QR code est scanné avec succès
async function onQRCodeScanned(decodedText, decodedResult) {
  console.log(`QR Code scanné: ${decodedText}`);

  // Arrêter le scanner
  stopCurrentScanner();

  // Essayer de rechercher le visiteur avec le badge ID scanné
  try {
    showNotification("QR Code détecté ! Recherche en cours...", "info");
    const visiteur = await getVisiteurByBadgeId(decodedText);
    afficherResultatRecherche(visiteur);
    showNotification("Visiteur trouvé via QR Code !", "success");
  } catch (error) {
    console.error("Erreur lors de la recherche par QR code:", error);
    showNotification(
      `Badge ID scanné: ${decodedText} - Visiteur non trouvé`,
      "error"
    );
  }
}

// Callback en cas d'erreur de scan
function onQRScanError(error) {
  // Ne pas afficher les erreurs de scan en continu, juste les erreurs importantes
  if (error && !error.includes("NotFoundException")) {
    console.warn("Erreur scanner QR:", error);
  }
}

// Arrêter le scanner QR actuel
function stopCurrentScanner() {
  if (currentQRScanner) {
    stopQRScanner(currentQRScanner);
    currentQRScanner = null;
  }

  // Cacher le bouton d'arrêt
  const btnStop = document.getElementById("btn-stop-scanner");
  if (btnStop) {
    btnStop.classList.add("hidden");
  }

  // Vider le conteneur du scanner
  const scannerContainer = document.getElementById("qr-scanner");
  if (scannerContainer) {
    scannerContainer.innerHTML = '<p class="text-gray-500">Scanner arrêté</p>';
  }
}

// Créer une fenêtre d'impression dédiée pour le badge
function createPrintWindow(badgeData, badgeId) {
  // Créer une nouvelle fenêtre pour l'impression
  const printWindow = window.open("", "_blank", "width=400,height=300");

  if (!printWindow) {
    alert("Veuillez autoriser les pop-ups pour imprimer le badge");
    return;
  }

  // Créer le HTML simple du badge selon le design que tu as montré
  const badgeHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Badge Visiteur - ${badgeData.firstName} ${badgeData.lastName}</title>
    <script src="${window.location.origin}/qrcode.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        
        .badge {
            width: 100mm;
            height: 54mm;
            background: white;
            border: 2px solid #333;
            border-radius: 8px;
            padding: 8mm;
            display: flex;
            position: relative;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .badge-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        
        .visitor-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #000;
        }
        
        .visitor-details {
            font-size: 11px;
            line-height: 1.4;
            color: #333;
        }
        
        .detail-line {
            margin-bottom: 2px;
        }
        
        .qr-section {
            width: 90px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin-left: 10px;
        }
        
        .qr-code {
            width: 80px;
            height: 80px;
            border: 1px solid #ccc;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .qr-label {
            font-size: 8px;
            text-align: center;
            margin-top: 4px;
            color: #666;
        }
        
        .badge-footer {
            position: absolute;
            bottom: 4px;
            left: 8mm;
            right: 8mm;
            font-size: 8px;
            color: #666;
            text-align: center;
            border-top: 1px solid #eee;
            padding-top: 2px;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
                margin: 0;
            }
            
            .badge {
                box-shadow: none;
                margin: 0;
            }
        }
        
        @page {
            size: A4;
            margin: 15mm;
        }
    </style>
</head>
<body>
    <div class="badge">
        <div class="badge-content">
            <div>
                <div class="visitor-name">${badgeData.firstName} ${
    badgeData.lastName
  }</div>
                <div class="visitor-details">
                    <div class="detail-line">Local: ${
                      badgeData.destination
                    }</div>
                    <div class="detail-line">Voir: ${badgeData.contact}</div>
                    <div class="detail-line">Type: ${
                      badgeData.purpose === "visite" ? "visite" : "formation"
                    }</div>
                </div>
            </div>
        </div>
        
        <div class="qr-section">
            <div id="badge-qrcode-print" class="qr-code"></div>
            <div class="qr-label">Sca</div>
        </div>
        
        <div class="badge-footer">
            Valide le ${new Date().toLocaleDateString(
              "fr-FR"
            )} à ${new Date().toLocaleTimeString("fr-FR")} • www.cepegra.be
        </div>
    </div>
</body>
</html>`;

  // Écrire le contenu dans la nouvelle fenêtre
  printWindow.document.write(badgeHTML);
  printWindow.document.close();

  // Attendre que le contenu soit chargé puis générer le QR code
  printWindow.onload = () => {
    // Générer le QR code dans la fenêtre d'impression
    setTimeout(() => {
      if (typeof printWindow.QRCode !== "undefined") {
        new printWindow.QRCode(
          printWindow.document.getElementById("badge-qrcode-print"),
          {
            text: badgeId,
            width: 80,
            height: 80,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: printWindow.QRCode.CorrectLevel.M,
          }
        );
      } else {
        // Fallback si QRCode n'est pas disponible
        const qrContainer =
          printWindow.document.getElementById("badge-qrcode-print");
        qrContainer.innerHTML = `<div style="font-size:10px;text-align:center;padding:20px;">${badgeId}</div>`;
      }

      // Lancer l'impression automatiquement après un court délai
      setTimeout(() => {
        printWindow.print();

        // Fermer la fenêtre après impression (optionnel)
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      }, 1000);
    }, 500);
  };

  return printWindow;
}

export { initEntreeComponent };
