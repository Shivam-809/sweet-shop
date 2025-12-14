import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createAdminClient();
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);

    if (!payload || payload.type !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const { quantity } = await request.json();

    if (!quantity || quantity <= 0) {
      return NextResponse.json({ error: "Valid quantity is required" }, { status: 400 });
    }

    const { data: sweet, error: sweetError } = await supabase
      .from("sweets")
      .select("*")
      .eq("id", id)
      .single();

    if (sweetError || !sweet) {
      return NextResponse.json({ error: "Sweet not found" }, { status: 404 });
    }

    const { data: updatedSweet, error: updateError } = await supabase
      .from("sweets")
      .update({ quantity: sweet.quantity + quantity, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*, category:categories(*)")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ sweet: updatedSweet, message: "Restock successful" });
  } catch (error) {
    console.error("Restock error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
