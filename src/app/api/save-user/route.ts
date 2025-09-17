import { NextResponse } from "next/server";
import { saveUserInfo, UserInfo } from "@/app/lib/saveUserInfo";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const userInfo: UserInfo = body;

        saveUserInfo(userInfo);

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
    }
}

// (Opțional) dacă vrei să refuzi alte metode:
export function GET() {
    return NextResponse.json({
        success: true,
        message: "Use POST to submit user info",
        status: 200,
    });
}
