// Specific Type for FeatureExtractionPipeline
let extractor: any = null;

export async function generateEmbedding(text: string): Promise<number[]> {
    if (!extractor) {
        console.log("Loading local embedding model (Xenova/all-MiniLM-L6-v2)...");
        // Dynamic import bypass for ts-node/CommonJS
        const dynamicImport = new Function('modulePath', 'return import(modulePath)');
        const { pipeline } = await dynamicImport("@xenova/transformers");
        // 'feature-extraction' task
        extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    }

    try {
        const output = await extractor(text, { pooling: "mean", normalize: true });
        // output is a Tensor. .data is the underlying Float32Array. 
        // We convert it to a regular array.
        return Array.from(output.data);
    } catch (error) {
        console.error("Error generating local embedding:", error);
        throw error;
    }
}
