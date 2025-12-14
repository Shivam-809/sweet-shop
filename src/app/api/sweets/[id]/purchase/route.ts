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

    if (!payload || payload.type !== "user") {
      return NextResponse.json({ error: "User access required" }, { status: 403 });
    }

    const { id } = await params;
    const { quantity = 1 } = await request.json();

    const { data: sweet, error: sweetError } = await supabase
      .from("sweets")
      .select("*")
      .eq("id", id)
      .single();

    if (sweetError || !sweet) {
      return NextResponse.json({ error: "Sweet not found" }, { status: 404 });
    }

    if (sweet.quantity < quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
    }

    const totalPrice = sweet.price * quantity;

    const { error: updateError } = await supabase
      .from("sweets")
      .update({ quantity: sweet.quantity - quantity, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .insert({
        user_id: payload.id,
        sweet_id: id,
        quantity,
        total_price: totalPrice,
      })
      .select("*, sweet:sweets(*)")
      .single();

    if (purchaseError) {
      return NextResponse.json({ error: purchaseError.message }, { status: 500 });
    }

    return NextResponse.json({ purchase, message: "Purchase successful" }, { status: 201 });
  } catch (error) {
    console.error("Purchase error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
