import { NextResponse } from "next/server";
import { getActiveCities } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const cities = await getActiveCities();
  return NextResponse.json({ cities });
}
