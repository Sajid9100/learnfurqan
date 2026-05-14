import { NextResponse } from "next/server";
import { getReviewsByTeacherSlug } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const reviews = await getReviewsByTeacherSlug(params.slug);
  return NextResponse.json({ reviews });
}
