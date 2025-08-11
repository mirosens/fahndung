// Hilfsfunktion für Dienststelle-Anzeige (kurze Begriffe)
export const getShortLocationDisplay = (address: string): string => {
  if (!address) return "";

  // Entferne Länder- und Bundesland-Suffixe
  const shortAddress = address
    .replace(/, Deutschland$/, "")
    .replace(/, Baden-Württemberg$/, "")
    .replace(/, Bayern$/, "")
    .replace(/, Hessen$/, "")
    .replace(/, Nordrhein-Westfalen$/, "")
    .replace(/, Niedersachsen$/, "")
    .replace(/, Rheinland-Pfalz$/, "")
    .replace(/, Saarland$/, "")
    .replace(/, Berlin$/, "")
    .replace(/, Hamburg$/, "")
    .replace(/, Bremen$/, "")
    .replace(/, Schleswig-Holstein$/, "")
    .replace(/, Mecklenburg-Vorpommern$/, "")
    .replace(/, Brandenburg$/, "")
    .replace(/, Sachsen$/, "")
    .replace(/, Sachsen-Anhalt$/, "")
    .replace(/, Thüringen$/, "");

  // Extrahiere den ersten Teil (Stadt/Ort)
  const parts = shortAddress.split(",");
  if (parts.length > 0) {
    const firstPart = parts[0]?.trim() ?? "";

    // Spezielle Behandlungen für bekannte Orte
    if (firstPart.includes("LKA")) return "LKA";
    if (firstPart.includes("Aalen")) return "Aalen";
    if (firstPart.includes("Freiburg")) return "Freiburg";
    if (firstPart.includes("Heilbronn")) return "Heilbronn";
    if (firstPart.includes("Karlsruhe")) return "Karlsruhe";
    if (firstPart.includes("Konstanz")) return "Konstanz";
    if (firstPart.includes("Ludwigsburg")) return "Ludwigsburg";
    if (firstPart.includes("Mannheim")) return "Mannheim";
    if (firstPart.includes("Offenburg")) return "Offenburg";
    if (firstPart.includes("Pforzheim")) return "Pforzheim";
    if (firstPart.includes("Ravensburg")) return "Ravensburg";
    if (firstPart.includes("Reutlingen")) return "Reutlingen";
    if (firstPart.includes("Stuttgart")) return "Stuttgart";
    if (firstPart.includes("Ulm")) return "Ulm";
    if (firstPart.includes("Polizeipräsidium")) return "Polizei";

    // Fallback: Erste 15 Zeichen oder bis zum ersten Komma
    return firstPart.length > 15
      ? firstPart.substring(0, 15) + "..."
      : firstPart;
  }

  return shortAddress;
};
