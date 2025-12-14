import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    const categoryId = searchParams.get("category_id");
    const minPrice = searchParams.get("min_price");
    const maxPrice = searchParams.get("max_price");

    let query = supabase
      .from("sweets")
      .select("*, category:categories(*)");

    if (name) {
      query = query.ilike("name", `%${name}%`);
    }

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    if (minPrice) {
      query = query.gte("price", parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.lte("price", parseFloat(maxPrice));
    }

    const { data: sweets, error } = await query.order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sweets });
  } catch (error) {
    console.error("Search sweets error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
