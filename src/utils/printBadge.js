// Utilitaires pour l'impression de badges visiteurs

/**
 * Générer et imprimer un badge visiteur stylisé
 * @param {Object} badgeData - Données du badge
 * @param {string} badgeData.badgeId - ID du badge
 * @param {string} badgeData.lastName - Nom du visiteur
 * @param {string} badgeData.firstName - Prénom du visiteur
 * @param {string} badgeData.email - Email du visiteur
 * @param {string} badgeData.destination - Local de destination
 * @param {string} badgeData.contact - Personne à voir ou formation
 * @param {string} badgeData.purpose - Type de visite (visite/formation)
 * @param {string} badgeData.entryTime - Heure d'entrée
 */
export function printVisitorBadge(badgeData) {
  // Créer une nouvelle fenêtre pour l'impression
  const printWindow = window.open("", "_blank", "width=800,height=600");

  if (!printWindow) {
    alert("Veuillez autoriser les pop-ups pour imprimer le badge");
    return;
  }

  // Générer le contenu HTML du badge
  const badgeHTML = generateBadgeHTML(badgeData);

  // Écrire le contenu dans la nouvelle fenêtre
  printWindow.document.write(badgeHTML);
  printWindow.document.close();

  // Attendre que le contenu soit chargé puis générer le QR code
  printWindow.onload = () => {
    // Générer le QR code dans la fenêtre d'impression
    generateQRCodeForPrint(printWindow, badgeData.badgeId);

    // Lancer l'impression automatiquement après un court délai
    setTimeout(() => {
      printWindow.print();

      // Fermer la fenêtre après impression (optionnel)
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    }, 1000);
  };

  return printWindow;
}

/**
 * Générer le HTML stylisé pour le badge
 * @param {Object} badgeData - Données du badge
 * @returns {string} HTML complet du badge
 */
function generateBadgeHTML(badgeData) {
  const currentDate = new Date();
  const dateStr = currentDate.toLocaleDateString("fr-FR");
  const timeStr =
    badgeData.entryTime || currentDate.toLocaleTimeString("fr-FR");

  return `
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
            font-family: 'Arial', sans-serif;
            background: #f5f5f5;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        
        .badge-container {
            width: 85mm;
            height: 54mm;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            overflow: hidden;
            position: relative;
        }
        
        .badge-header {
            background: rgba(255,255,255,0.95);
            padding: 8px 12px;
            text-align: center;
            border-bottom: 2px solid #667eea;
        }
        
        .company-name {
            font-size: 14px;
            font-weight: bold;
            color: #333;
            margin-bottom: 2px;
        }
        
        .badge-title {
            font-size: 10px;
            color: #666;
            font-weight: 500;
        }
        
        .badge-content {
            display: flex;
            padding: 10px;
            gap: 10px;
            height: calc(100% - 50px);
        }
        
        .visitor-info {
            flex: 1;
            color: white;
        }
        
        .visitor-name {
            font-size: 13px;
            font-weight: bold;
            margin-bottom: 3px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }
        
        .visitor-details {
            font-size: 9px;
            line-height: 1.3;
            opacity: 0.95;
        }
        
        .detail-row {
            margin-bottom: 2px;
            display: flex;
        }
        
        .detail-label {
            font-weight: 600;
            margin-right: 4px;
            min-width: 35px;
        }
        
        .qr-section {
            width: 60px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        
        .qr-code {
            background: white;
            padding: 4px;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        
        .qr-label {
            color: white;
            font-size: 7px;
            margin-top: 4px;
            text-align: center;
            font-weight: 600;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }
        
        .badge-footer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0,0,0,0.1);
            padding: 3px 8px;
            font-size: 7px;
            color: white;
            text-align: center;
        }
        
        .print-instructions {
            position: absolute;
            top: -40px;
            left: 0;
            right: 0;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
                margin: 0;
            }
            
            .print-instructions {
                display: none;
            }
            
            .badge-container {
                box-shadow: none;
                margin: 10mm;
            }
        }
        
        @page {
            size: A4;
            margin: 20mm;
        }
    </style>
</head>
<body>
    <div class="print-instructions">
        Badge visiteur - Prêt pour impression
    </div>
    
    <div class="badge-container">
        <div class="badge-header">
            <div class="company-name">CEPEGRA</div>
            <div class="badge-title">BADGE VISITEUR</div>
        </div>
        
        <div class="badge-content">
            <div class="visitor-info">
                <div class="visitor-name">${badgeData.firstName} ${
    badgeData.lastName
  }</div>
                
                <div class="visitor-details">
                    <div class="detail-row">
                        <span class="detail-label">Local:</span>
                        <span>${badgeData.destination}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Voir:</span>
                        <span>${badgeData.contact}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Type:</span>
                        <span>${
                          badgeData.purpose === "visite"
                            ? "Visite"
                            : "Formation"
                        }</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">ID:</span>
                        <span>${badgeData.badgeId}</span>
                    </div>
                </div>
            </div>
            
            <div class="qr-section">
                <div id="badge-qrcode-print" class="qr-code"></div>
                <div class="qr-label">Scanner<br>pour sortie</div>
            </div>
        </div>
        
        <div class="badge-footer">
            Valide le ${dateStr} à ${timeStr} • www.cepegra.be
        </div>
    </div>
</body>
</html>`;
}

/**
 * Générer le QR code dans la fenêtre d'impression
 * @param {Window} printWindow - Fenêtre d'impression
 * @param {string} badgeId - ID du badge
 */
function generateQRCodeForPrint(printWindow, badgeId) {
  try {
    // Vérifier que QRCode est disponible dans la fenêtre d'impression
    if (typeof printWindow.QRCode !== "undefined") {
      new printWindow.QRCode(
        printWindow.document.getElementById("badge-qrcode-print"),
        {
          text: badgeId,
          width: 50,
          height: 50,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: printWindow.QRCode.CorrectLevel.M,
        }
      );
    } else {
      // Fallback si QRCode n'est pas disponible
      const qrContainer =
        printWindow.document.getElementById("badge-qrcode-print");
      qrContainer.innerHTML = `
        <div style="width:50px;height:50px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:8px;text-align:center;">
          QR<br>${badgeId}
        </div>
      `;
    }
  } catch (error) {
    console.error(
      "Erreur lors de la génération du QR code pour impression:",
      error
    );
  }
}

/**
 * Préparer les données pour l'impression à partir de la réponse API
 * @param {Object} apiResponse - Réponse de l'API d'entrée
 * @param {Array} personnel - Liste du personnel
 * @param {Array} formations - Liste des formations
 * @returns {Object} Données formatées pour l'impression
 */
export function formatBadgeDataForPrint(apiResponse, personnel, formations) {
  const visitor = apiResponse.visitor;
  const visit = apiResponse.visit;
  const badgeId = apiResponse.badge_id;

  // Trouver les informations de destination et contact
  let destination = "Non défini";
  let contact = "Non défini";

  if (visit.purpose === "visite" && visit.staff_member_id) {
    const personne = personnel.find((p) => p.id == visit.staff_member_id);
    if (personne) {
      destination = personne.room || "Local non défini";
      contact = `${personne.last_name} ${personne.first_name}`;
    }
  } else if (visit.purpose === "formation" && visit.training_id) {
    const formation = formations.find((f) => f.id == visit.training_id);
    if (formation) {
      destination = formation.room || "Local non défini";
      contact = formation.title || "Formation non définie";
    }
  }

  return {
    badgeId: badgeId,
    lastName: visitor.last_name || "Non défini",
    firstName: visitor.first_name || "Non défini",
    email: visitor.email || "Non défini",
    purpose: visit.purpose || "Non défini",
    destination: destination,
    contact: contact,
    entryTime:
      new Date(visit.entered_at).toLocaleTimeString("fr-FR") ||
      new Date().toLocaleTimeString("fr-FR"),
  };
}
