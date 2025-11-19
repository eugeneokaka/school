import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // make sure you have this setup

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { firstName, lastName, registrationNumber, fileUrl } = body;

    if (!firstName || !lastName || !registrationNumber || !fileUrl) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // find real user by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const project = await prisma.project.create({
      data: {
        studentId: user.id,
        firstName,
        lastName,
        registrationNumber,
        fileUrl,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
