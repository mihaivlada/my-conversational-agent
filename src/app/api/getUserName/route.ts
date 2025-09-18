import { NextResponse } from "next/server";

// get user name from query params
export async function GET(req: Request) {
    const toolId = process.env.TOOL_ID;

    const { nume } = req.url.includes("?") ? Object.fromEntries(new URL(req.url).searchParams.entries()) : {};
    if (!nume) {
        return NextResponse.json({ error: "Missing nume parameter" }, { status: 400 });
    }
    return NextResponse.json({ name: nume });
}

// logic for POST if needed in the future
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { nume } = body;

        if (!nume) {
            return NextResponse.json({ error: "Missing nume in request body" }, { status: 400 });
        }
        return NextResponse.json({ name: nume });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
