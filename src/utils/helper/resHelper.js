import { NextResponse } from "next/server";

export const resSend = ({data}, status=200) => {
    return NextResponse.json({ data }, { status });
}