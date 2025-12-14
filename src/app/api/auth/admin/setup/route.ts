import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { hashPassword, generateToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 });
    }

    const { data: existingAdmin } = await supabase
      .from("admins")
      .select("id")
      .eq("email", email)
      .single();

    if (existingAdmin) {
      return NextResponse.json({ error: "Admin already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const { data: admin, error } = await supabase
      .from("admins")
      .insert({ email, password_hash: passwordHash, name })
      .select("id, email, name, created_at, updated_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const token = generateToken({ id: admin.id, email: admin.email, type: "admin" });

    return NextResponse.json({ admin, token, type: "admin" }, { status: 201 });
  } catch (error) {
    console.error("Admin setup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
