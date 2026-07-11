import { supportFlow } from '../../genkit';
import { toReadableStream } from '@/lib/config/genkit-stream';

export const maxDuration = 10;

export async function POST(req: Request) {
    const body = await req.json();
    const messages = body.messages || [];

    interface SupportMessage {
        id: string;
        role: "user" | "assistant" | "system";
        content?: string;
        parts?: { text: string }[];
    }
    const typedMessages = messages as SupportMessage[];

    // Map AI SDK v6 messages (parts) to Genkit-compatible structure (content)
    // GEMINI REQUIREMENT: History MUST start with a 'user' message.
    // We strictly filter any non-user messages at the beginning of the array.
    let normalizedMessages = typedMessages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content || m.parts?.map((p) => p.text).join('\n') || ''
    }));

    // Find the first index where role is 'user'
    const firstUserIndex = normalizedMessages.findIndex((m) => m.role === 'user');

    // If no user message yet, or if there were assistant messages before it, slice.
    if (firstUserIndex !== -1) {
        normalizedMessages = normalizedMessages.slice(firstUserIndex);
    } else {
        // Fallback: if somehow NO user message, Genkit/Gemini will fail anyway, 
        // but we'll send it as is or empty to avoid crash here.
        normalizedMessages = [];
    }

    // Call the support flow with cleaned messages
    const response = await supportFlow.stream({ messages: normalizedMessages });

    return new Response(toReadableStream(response), {
        headers: {
            'Content-Type': 'text/event-stream',
        },
    });
}
