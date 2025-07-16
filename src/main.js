import "./style.css";
import { initEntreeComponent } from "./components/entree.js";
import { initSortieComponent } from "./components/sortie.js";
import { initRetourComponent } from "./components/retour.js";

// État de l'application
let currentView = "entree";

// Initialiser l'application
function initApp() {
  createAppInterface();
  attachNavEvents();
  showView("entree");
}

// Créer l'interface principale
function createAppInterface() {
  document.querySelector("#app").innerHTML = `
        <div class="min-h-screen bg-gray-100">
            <!-- Header -->
            <header class="bg-blue-600 text-white p-4 shadow-lg">
                <div class="flex justify-between items-center">
                    <div class="flex-1 text-center">
                        <h1 class="text-3xl font-bold">Qui est là ?</h1>
                        <p class="mt-2 text-blue-100">Système de gestion des visiteurs</p>
                    </div>
                    <div>
                        <a href="https://qui-est-la-main-i6aqmb.laravel.cloud/" target="_blank" class="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded text-sm">
                            👨‍💼 Administration
                        </a>
                    </div>
                </div>
            </header>

            <!-- Navigation -->
            <nav class="bg-white shadow-md">
                <div class="container mx-auto px-4">
                    <div class="flex justify-center space-x-1">
                        <button id="nav-entree" class="nav-btn active px-6 py-3 font-medium rounded-t-lg">
                            📥 Entrée
                        </button>
                        <button id="nav-sortie" class="nav-btn px-6 py-3 font-medium rounded-t-lg">
                            📤 Sortie
                        </button>
                    </div>
                </div>
            </nav>

            <!-- Contenu principal -->
            <main class="container mx-auto px-4 py-8">
                <div id="entree-container" class="view-container"></div>
                <div id="sortie-container" class="view-container hidden"></div>
                <div id="retour-container" class="view-container hidden"></div>
            </main>

            <!-- Footer -->
            <footer class="bg-gray-800 text-white text-center py-4 mt-auto">
                <p>&copy; 2025 Cepegra - Système "Qui est là ?"</p>
            </footer>
        </div>
    `;
}

// Attacher les événements de navigation
function attachNavEvents() {
  document
    .getElementById("nav-entree")
    .addEventListener("click", () => showView("entree"));
  document
    .getElementById("nav-sortie")
    .addEventListener("click", () => showView("sortie"));
}

// Afficher une vue spécifique
async function showView(view) {
  // Cacher toutes les vues
  document.querySelectorAll(".view-container").forEach((container) => {
    container.classList.add("hidden");
  });

  // Supprimer la classe active de tous les boutons de navigation
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Afficher la vue demandée
  document.getElementById(`${view}-container`).classList.remove("hidden");
  document.getElementById(`nav-${view}`).classList.add("active");

  // Initialiser le composant correspondant
  switch (view) {
    case "entree":
      await initEntreeComponent();
      break;
    case "sortie":
      initSortieComponent();
      break;
    case "retour":
      await initRetourComponent();
      break;
  }

  currentView = view;
}

// Démarrer l'application quand le DOM est chargé
document.addEventListener("DOMContentLoaded", initApp);
