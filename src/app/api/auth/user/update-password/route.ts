import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { hashPassword, generateToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const { data: user, error } = await supabase
      .from("users")
      .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
      .eq("email", email)
      .select("id, email, name, created_at, updated_at")
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const token = generateToken({ id: user.id, email: user.email, type: "user" });

    return NextResponse.json({ user, token, type: "user" });
  } catch (error) {
    console.error("Update password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
