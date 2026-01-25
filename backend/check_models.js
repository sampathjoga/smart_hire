require('dotenv').config();
const fetch = require('node-fetch');

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No GEMINI_API_KEY found in .env");
        return;
    }

    console.log("Checking available models with API Key...");

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
            { method: "GET" }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Error fetching models:", data);
        } else {
            console.log("Available Models:");
            if (data.models) {
                data.models.forEach(model => {
                    if (model.supportedGenerationMethods.includes("generateContent")) {
                        console.log(`- ${model.name} (${model.displayName})`);
                    }
                });
            } else {
                console.log("No models returned. raw data:", data);
            }
        }
    } catch (err) {
        console.error("Network error:", err);
    }
}

listModels();
