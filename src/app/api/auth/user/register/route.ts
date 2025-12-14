import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const redirectUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
        emailRedirectTo: `${redirectUrl}/auth/confirm`,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (data.user) {
      const { error: dbError } = await supabase
        .from("users")
        .upsert({
          id: data.user.id,
          email: data.user.email,
          name,
        }, {
          onConflict: 'id'
        });

      if (dbError) {
        console.error("Error creating user in database:", dbError);
      }
    }

    return NextResponse.json({ 
      message: "Registration successful! Please check your email to confirm your account.",
      emailSent: true,
      user: data.user 
    }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}