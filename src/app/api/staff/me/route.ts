import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if staff exists
    const staff = await prisma.staff.findUnique({
      where: { clerkId: userId },
    });

    if (!staff) {
      return NextResponse.json({ isStaff: false });
    }

    return NextResponse.json({
      isStaff: true,
      staff: {
        id: staff.id,
        firstName: staff.firstName,
        lastName: staff.lastName,
        email: staff.email,
        department: staff.department,
        role: staff.role,
      },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
