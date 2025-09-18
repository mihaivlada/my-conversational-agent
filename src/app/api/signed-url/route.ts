import { NextResponse } from "next/server";

export async function GET() {
    const agentId = process.env.NEXT_PUBLIC_AGENT_ID!;

    if (!agentId) {
        console.log("AGENT_ID is not set in environment variables");
        return NextResponse.json({ error: "AGENT_ID is not set in environment variables" }, { status: 500 });
    }

    try {
        console.log("Fetching...");
        const res = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`, {
            method: "GET",
            headers: {
                "xi-api-key": process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY!,
            },
        }).then((res) => {
            return res.json();
        });

        return NextResponse.json({ signedUrl: res.signed_url });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
