import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { logs } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const log = await db
    .insert(logs)
    .values({
      userId: session.user.id!,
      title: body.title,
      what_i_built: body.what_i_built,
      blockers: body.blockers || null,
      mood: body.mood || null,
      time_spent: body.time_spent || null,
      tags: body.tags || [],
    })
    .returning();

  return NextResponse.json(log[0]);
}
