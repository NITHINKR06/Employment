import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: {
          id: "usr_101",
          name: "Arjun Rao",
          email: email,
          role: "user",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}