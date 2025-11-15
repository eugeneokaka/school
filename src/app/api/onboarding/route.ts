import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, clerkId } = body;

    if (!firstName || !lastName || !email || !clerkId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Create new user in database
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        clerkId,
      },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (err: any) {
    console.error(err);

    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
