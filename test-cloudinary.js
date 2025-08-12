const crypto = require("crypto");

// Cloudinary Credentials
const cloudName = "dpfpr3yxc";
const apiKey = "163413616558123";
const apiSecret = "3owG6BleMFr6LOG2gxW5JyU6l9U";

// Parameter für die API
const params = {
  api_key: apiKey,
  max_results: "10",
  type: "upload",
  prefix: "fahndungen/",
  timestamp: Math.floor(Date.now() / 1000).toString(),
};

// Sortiere Parameter alphabetisch
const sortedParams = Object.keys(params)
  .sort()
  .reduce((acc, key) => {
    acc[key] = params[key];
    return acc;
  }, {});

// Erstelle String für Signatur
const paramString = Object.entries(sortedParams)
  .map(([key, value]) => `${key}=${value}`)
  .join("&");

// Generiere SHA1-Signatur
const signature = crypto
  .createHash("sha1")
  .update(paramString + apiSecret)
  .digest("hex");

console.log("Parameter String:", paramString);
console.log("Signature:", signature);

// Füge Signatur zu Parametern hinzu
params.signature = signature;

// Erstelle URL
const queryString = new URLSearchParams(params).toString();
const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?${queryString}`;

console.log("URL:", url);

// Teste die API
fetch(url)
  .then((response) => response.json())
  .then((data) => {
    console.log("Response:", JSON.stringify(data, null, 2));
  })
  .catch((error) => {
    console.error("Error:", error);
  });
