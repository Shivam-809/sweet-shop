import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category_id");

    let query = supabase
      .from("sweets")
      .select("*, category:categories(*)");

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data: sweets, error } = await query.order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sweets });
  } catch (error) {
    console.error("Get sweets error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const { name, description, category_id, price, quantity, image_url } = await request.json();

    if (!name || price === undefined || quantity === undefined) {
      return NextResponse.json({ error: "Name, price, and quantity are required" }, { status: 400 });
    }

    const { data: sweet, error } = await supabase
      .from("sweets")
      .insert({ name, description, category_id, price, quantity, image_url })
      .select("*, category:categories(*)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sweet }, { status: 201 });
  } catch (error) {
    console.error("Create sweet error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}