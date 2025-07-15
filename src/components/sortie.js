// Composant pour gérer la sortie des visiteurs
import {
  enregistrerSortie,
  getVisiteurByEmail,
} from "../services/visiteurs.js";
import { showNotification, isValidEmail } from "../utils.js";

let visiteurCourant = null;

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
            
            <div class="space-y-4">
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

  // Vérifier qu'on a bien une visite active avec un badge_id
  if (!visiteurCourant.last_visit || !visiteurCourant.last_visit.badge_id) {
    showNotification(
      "Impossible de trouver le badge de la visite active",
      "error"
    );
    return;
  }

  try {
    // Préparer les données pour la sortie selon la doc API Laravel
    const sortieData = {
      badge_id: visiteurCourant.last_visit.badge_id,
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

export { initSortieComponent };
