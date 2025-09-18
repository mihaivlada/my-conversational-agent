import { NextResponse } from "next/server";

// get user name from query params
export async function GET(req: Request) {
    const { nume } = req.url.includes("?") ? Object.fromEntries(new URL(req.url).searchParams.entries()) : {};
    if (!nume) {
        return NextResponse.json({ error: "Missing nume parameter" }, { status: 400 });
    }
    return NextResponse.json({ name: nume });
}
