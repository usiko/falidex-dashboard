const fs = require('fs');
const path = require('path');
try {
    require('dotenv').config();
} catch (e) {
    // dotenv not installed, relying purely on process.env
}

// Variables d'environnement référencées mais absentes/vides : on ne remplace
// jamais par "" en silence, sinon le build produit un bundle qui échoue à
// l'exécution (ex: une clé de dérivation vide -> tous les appels API en 401).
const missing = new Map();

function noteIfMissing(filePath, envVar) {
    const value = process.env[envVar];
    if (value === undefined || value === '') {
        if (!missing.has(envVar)) {
            missing.set(envVar, new Set());
        }
        missing.get(envVar).add(path.basename(filePath));
        return true;
    }
    return false;
}

// Résout les {ENV:VAR_NAME} d'un fichier JSON/JS et retourne le contenu à écrire
// (null si le fichier n'existe pas)
function resolveEnvVariables(filePath) {
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return null;
    }

    const content = fs.readFileSync(filePath, 'utf8');

    // Remplace les occurences de {ENV:VAR_NAME} par la valeur de process.env.VAR_NAME
    // S'il s'agit d'une chaîne de caractères (qui nécessite des guillemets dans le JSON),
    // assurez-vous de formater correctement.
    return content.replace(/"?\{ENV:([^}]+)\}"?/g, (match, envVar) => {
        if (noteIfMissing(filePath, envVar)) {
            return match;
        }
        const value = process.env[envVar];

        // Si c'est un booléen ou un nombre (déjà sans guillemets dans le JSON original ou le JS)
        if (value === 'true' || value === 'false' || (!isNaN(Number(value)) && value.trim() !== '')) {
            return value;
        }

        // Sinon, on rajoute les guillemets (pour les chaînes de caractères)
        return `"${value}"`;
    });
}

// Idem pour les fichiers HTML/texte (sans gestion de guillemets)
function resolveEnvVariablesInHtml(filePath) {
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return null;
    }

    const content = fs.readFileSync(filePath, 'utf8');

    // Remplace les occurences de {ENV:VAR_NAME} par la valeur de process.env.VAR_NAME directement
    return content.replace(/\{ENV:([^}]+)\}/g, (match, envVar) => {
        if (noteIfMissing(filePath, envVar)) {
            return match;
        }
        return process.env[envVar];
    });
}

// Fichiers de configuration à traiter
const configProdPath = path.join(__dirname, '..', 'public', 'config', 'config.prod.json');
const configPath = path.join(__dirname, '..', 'public', 'config', 'config.json');
const envProdPath = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');
const envPath = path.join(__dirname, '..', 'src', 'environments', 'environment.ts');
const indexPath = path.join(__dirname, '..', 'src', 'index.html');

// On résout tout d'abord, on n'écrit qu'une fois sûr qu'aucune variable ne manque
const resolved = [
    [configProdPath, resolveEnvVariables(configProdPath)],
    [configPath, resolveEnvVariables(configPath)],
    [envProdPath, resolveEnvVariables(envProdPath)],
    [envPath, resolveEnvVariables(envPath)],
    [indexPath, resolveEnvVariablesInHtml(indexPath)],
];

if (missing.size > 0) {
    console.error('\n❌ Build interrompu : variables d\'environnement manquantes ou vides.\n');
    for (const [envVar, files] of missing) {
        console.error(`   - ${envVar} (référencée dans ${[...files].join(', ')})`);
    }
    console.error('\nDéfinissez-les avant le build (aucun fichier n\'a été modifié).\n');
    process.exit(1);
}

for (const [filePath, content] of resolved) {
    if (content === null) {
        continue;
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated environment variables in ${path.basename(filePath)}`);
}
