// Composant pour gérer l'entrée des visiteurs
import { enregistrerEntree } from "../services/visiteurs.js";
import { getPersonnel } from "../services/personnel.js";
import { getFormationsDuJour } from "../services/formations.js";
import { getVisiteurByEmail } from "../services/visiteurs.js";
import { isValidEmail, showNotification, cleanFormData } from "../utils.js";

// Variables globales pour stocker les données
let personnel = [];
let formations = [];

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
        <div class="bg-white border-2 border-gray-300 rounded-lg p-6 max-w-md mx-auto">
            <h3 class="text-xl font-bold text-center mb-4">Badge Visiteur</h3>
            <div class="space-y-2">
                <p><strong>Nom:</strong> ${visitor.last_name}</p>
                <p><strong>Prénom:</strong> ${visitor.first_name}</p>
                <p><strong>Local:</strong> ${destination}</p>
                <p><strong>À voir:</strong> ${contact}</p>
                <p><strong>Badge ID:</strong> ${badgeId}</p>
            </div>
            <div class="mt-4 text-center">
                <button onclick="this.parentElement.parentElement.parentElement.innerHTML=''" 
                        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Fermer
                </button>
            </div>
        </div>
    `;

  divBadge.classList.remove("hidden");
}

export { initEntreeComponent };
