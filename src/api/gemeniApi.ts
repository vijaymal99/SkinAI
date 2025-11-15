import {SKIN_ANALYSIS_PROMPT} from "@/src/utils/skinPrompt";

export async function SkinImageWithGemini(imageBuffer: any, model = "gemini-2.0-flash") {
    try {
        const base64Image = imageBuffer.toString("base64");

        const body = {
            contents: [
                {
                    parts: [
                        {
                            inline_data: {
                                mime_type: "image/jpeg",
                                data: base64Image,
                            },
                        },
                        {
                            text: SKIN_ANALYSIS_PROMPT,
                        },
                    ],
                },
            ],
        };

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=AIzaSyAzxm-QOmi45-5jZChi-cco2izfDf2Nb2k`;

        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const json = await res.json();

        if (!json?.candidates?.[0]?.content?.parts) {
            console.error("Gemini API error:", json);
            return null;
        }

        const text = json.candidates[0].content.parts
            .map((p: any) => p.text || "")
            .join("")
            .trim();

        return text;
    } catch (error) {
        console.error("Gemini Skin Classification failed:", error);
        return null;
    }
}
