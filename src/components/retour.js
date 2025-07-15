// Composant pour gérer le retour des visiteurs
import { enregistrerRetour, getVisiteurByEmail } from "../services/visiteurs.js";
import { getPersonnel } from "../services/personnel.js";
import { getFormationsDuJour } from "../services/formations.js";
import { showNotification, isValidEmail } from "../utils.js";

let visiteurCourant = null;
let personnel = [];
let formations = [];

// Initialiser le composant de retour
async function initRetourComponent() {
  try {
    // Charger les données nécessaires
    personnel = await getPersonnel();
    formations = await getFormationsDuJour();
    
    createRetourInterface();
    attachRetourEvents();
  } catch (error) {
    console.error("Erreur lors de l'initialisation:", error);
    showNotification("Erreur lors du chargement des données", "error");
  }
}

// Créer l'interface de retour
function createRetourInterface() {
  const container = document.getElementById("retour-container");
  if (!container) return;

  container.innerHTML = `
        <div class="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
            <h2 class="text-2xl font-bold text-center mb-6 text-orange-600">Retour Visiteur</h2>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Recherche par Email</label>
                    <input type="email" id="visiteur-email" placeholder="votre@email.com"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                </div>
                
                <button id="rechercher-email" 
                        class="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium">
                    Rechercher
                </button>
            </div>
            
            <div id="visiteur-info" class="hidden mt-6 p-4 border rounded-lg bg-gray-50">
                <h3 class="font-bold mb-2">Visiteur trouvé</h3>
                <div id="visiteur-details"></div>
                
                <!-- Nouveau motif de visite -->
                <div class="mt-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nouveau motif de visite *</label>
                    <div class="space-y-2">
                        <label class="flex items-center">
                            <input type="radio" name="nouveau-motif" value="personnel" 
                                   class="mr-2 text-orange-600 focus:ring-orange-500">
                            <span>Visiter un membre du personnel</span>
                        </label>
                        <label class="flex items-center">
                            <input type="radio" name="nouveau-motif" value="formation" 
                                   class="mr-2 text-orange-600 focus:ring-orange-500">
                            <span>Participer à une formation</span>
                        </label>
                    </div>
                </div>
                
                <!-- Menu personnel (caché par défaut) -->
                <div id="div-personnel" class="hidden mt-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Membre du personnel *</label>
                    <select id="personnel-select" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option value="">Choisir un membre du personnel</option>
                    </select>
                </div>
                
                <!-- Menu formations (caché par défaut) -->
                <div id="div-formations" class="hidden mt-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Formation *</label>
                    <select id="formations-select" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option value="">Choisir une formation</option>
                    </select>
                </div>
                
                <button id="confirmer-retour" 
                        class="w-full mt-4 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium">
                    Confirmer le retour
                </button>
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

  selectPersonnel.innerHTML = '<option value="">Choisir un membre du personnel</option>';

  personnel.forEach((personne) => {
    const option = document.createElement("option");
    option.value = personne.id;
    option.textContent = `${personne.nom} ${personne.prenom} - ${personne.fonction} (${personne.local})`;
    selectPersonnel.appendChild(option);
  });
}

// Remplir le menu des formations
function remplirMenuFormations() {
  const selectFormations = document.getElementById("formations-select");
  if (!selectFormations) return;

  selectFormations.innerHTML = '<option value="">Choisir une formation</option>';

  formations.forEach((formation) => {
    const option = document.createElement("option");
    option.value = formation.id;
    option.textContent = `${formation.intitule} - ${formation.local}`;
    selectFormations.appendChild(option);
  });
}

// Attacher les événements
function attachRetourEvents() {
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
    
  // Gérer l'affichage conditionnel des menus
  const motifRadios = document.querySelectorAll('input[name="nouveau-motif"]');
  motifRadios.forEach(radio => {
    radio.addEventListener('change', gererAffichageMenus);
  });
}

// Gérer l'affichage des menus selon le motif
function gererAffichageMenus() {
  const motif = document.querySelector('input[name="nouveau-motif"]:checked')?.value;
  const divPersonnel = document.getElementById('div-personnel');
  const divFormations = document.getElementById('div-formations');
  
  if (motif === 'personnel') {
    divPersonnel?.classList.remove('hidden');
    divFormations?.classList.add('hidden');
  } else if (motif === 'formation') {
    divPersonnel?.classList.add('hidden');
    divFormations?.classList.remove('hidden');
  } else {
    divPersonnel?.classList.add('hidden');
    divFormations?.classList.add('hidden');
  }
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
    
    // Vérifier si le visiteur est sorti
    if (!visiteur.heure_sortie && !visiteur.exit_time) {
      showNotification("Ce visiteur est encore présent dans le bâtiment", "error");
      return;
    }
    
    afficherInfoVisiteur(visiteur);
  } catch (error) {
    showNotification("Visiteur non trouvé ou erreur de recherche", "error");
    cacherInfoVisiteur();
  }
}

// Afficher les informations du visiteur
function afficherInfoVisiteur(visiteur) {
  visiteurCourant = visiteur;
  
  const details = document.getElementById("visiteur-details");
  details.innerHTML = `
        <div class="space-y-2">
            <p><strong>Nom:</strong> ${visiteur.nom || visiteur.name}</p>
            <p><strong>Prénom:</strong> ${visiteur.prenom || visiteur.first_name}</p>
            <p><strong>Email:</strong> ${visiteur.email}</p>
            <p><strong>Statut:</strong> <span class="text-red-600 font-medium">Sorti</span></p>
        </div>
    `;

  document.getElementById("visiteur-info").classList.remove("hidden");
  
  // Réattacher les événements après création du DOM
  const motifRadios = document.querySelectorAll('input[name="nouveau-motif"]');
  motifRadios.forEach(radio => {
    radio.addEventListener('change', gererAffichageMenus);
  });
  
  // Attacher l'événement de confirmation
  document.getElementById("confirmer-retour").onclick = confirmerRetour;
}

// Cacher les informations du visiteur
function cacherInfoVisiteur() {
  document.getElementById("visiteur-info").classList.add("hidden");
  visiteurCourant = null;
}

// Confirmer le retour
async function confirmerRetour() {
  if (!visiteurCourant) {
    showNotification("Aucun visiteur sélectionné", "error");
    return;
  }

  const motif = document.querySelector('input[name="nouveau-motif"]:checked')?.value;
  
  if (!motif) {
    showNotification("Veuillez choisir un motif de visite", "error");
    return;
  }
  
  const personnelId = document.getElementById("personnel-select").value;
  const formationId = document.getElementById("formations-select").value;
  
  if (motif === 'personnel' && !personnelId) {
    showNotification("Veuillez choisir un membre du personnel", "error");
    return;
  }
  
  if (motif === 'formation' && !formationId) {
    showNotification("Veuillez choisir une formation", "error");
    return;
  }

  try {
    // Préparer les données pour le retour selon le format API Laravel
    const retourData = {
      email: visiteurCourant.email,
      visitor_id: visiteurCourant.id,
      visit_type: motif,
      staff_member_id: personnelId || null,
      training_id: formationId || null
    };

    await enregistrerRetour(retourData);
    
    showNotification("Retour enregistré avec succès ! Bon retour !", "success");
    
    // Réinitialiser l'interface
    document.getElementById("visiteur-email").value = "";
    cacherInfoVisiteur();
    
    // Réinitialiser les sélections
    document.querySelectorAll('input[name="nouveau-motif"]').forEach(radio => {
      radio.checked = false;
    });
    gererAffichageMenus();
    
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du retour:", error);
    showNotification("Erreur lors de l'enregistrement du retour", "error");
  }
}

export { initRetourComponent };
