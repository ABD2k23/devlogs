import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { logs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  // Not logged in → reject
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Only delete if the log belongs to the logged in user
  // This prevents users from deleting each other's logs!
  await db
    .delete(logs)
    .where(and(eq(logs.id, id), eq(logs.userId, session.user.id)));

  return NextResponse.json({ success: true });
}
