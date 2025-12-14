import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createAdminClient();
    const { id } = await params;
    
    const { data: sweet, error } = await supabase
      .from("sweets")
      .select("*, category:categories(*)")
      .eq("id", id)
      .single();

    if (error || !sweet) {
      return NextResponse.json({ error: "Sweet not found" }, { status: 404 });
    }

    return NextResponse.json({ sweet });
  } catch (error) {
    console.error("Get sweet error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const updates = await request.json();

    const { data: sweet, error } = await supabase
      .from("sweets")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*, category:categories(*)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sweet });
  } catch (error) {
    console.error("Update sweet error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { error } = await supabase
      .from("sweets")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Sweet deleted successfully" });
  } catch (error) {
    console.error("Delete sweet error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
