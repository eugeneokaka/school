import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// ==========================
// GET: Search for user by email
// ==========================
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can search
    const admin = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can perform this action" },
        { status: 403 }
      );
    }

    const email = req.nextUrl.searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email query parameter is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ==========================
// POST: Create staff + delete user
// ==========================
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can create staff" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { clerkId, firstName, lastName, email, department, role } = body;

    if (!clerkId || !firstName || !lastName || !email || !department) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log(body);
    const existingStaff = await prisma.staff.findUnique({ where: { clerkId } });
    console.log("existing staff:", existingStaff);
    if (existingStaff) {
      return NextResponse.json(
        { error: "Staff with this Clerk ID already exists" },
        { status: 400 }
      );
    }

    // Create staff
    const staff = await prisma.staff.create({
      data: {
        clerkId,
        firstName,
        lastName,
        email,
        department,
        role,
      },
    });

    // Remove from User table AFTER becoming staff
    console.log("Deleting user with clerkId:", clerkId);
    await prisma.user.delete({
      where: { email },
    });
    console.log("Deleted user with clerkId:", clerkId);

    return NextResponse.json({ success: true, staff });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
