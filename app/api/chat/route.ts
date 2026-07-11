import { consultantFlow } from '../../genkit';
import { hexclaveServerApp } from '@/lib/config/hexclave';

export const maxDuration = 10;

export async function POST(req: Request) {
    try {
        // Auth check: hanya user login yang boleh menggunakan AI chatbot
        // Mencegah abuse biaya API LLM oleh pihak tak berwenang
        const user = await hexclaveServerApp.getUser();
        if (!user) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const body = await req.json();
        const { messages } = body;

        if (!messages || !Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: "Messages array is required" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Genkit stream() returns a Promise<{ stream: AsyncIterable, response: Promise, ... }>
        const response = await consultantFlow.stream({ messages });

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    if (!response.stream) {
                        throw new Error("No stream returned from Genkit");
                    }

                    for await (const chunk of response.stream) {
                        // In consultantFlow, we use sendChunk(chunkText) where chunkText is a string
                        if (typeof chunk === 'string') {
                            controller.enqueue(encoder.encode(chunk));
                        } else if (chunk && typeof chunk === 'object') {
                            const chunkObj = chunk as Record<string, unknown>;
                            const text = (chunkObj.text as string) || (chunkObj.content as string) || JSON.stringify(chunk);
                            controller.enqueue(encoder.encode(text));
                        }
                    }
                } catch (error) {
                    console.error("Genkit Stream Iteration Error:", error);
                    // Don't kill the controller if we already sent some data, 
                    // but since this is raw text it might just end abruptly.
                    const errorMsg = `\n\n[Chat Error: ${(error as Error).message}]`;
                    controller.enqueue(encoder.encode(errorMsg));
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (e) {
        console.error("Chat API POST Error:", e);
        return new Response(JSON.stringify({ error: (e as Error).message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
