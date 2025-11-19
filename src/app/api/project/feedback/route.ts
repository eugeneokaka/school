import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Find user or staff
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    const staff = await prisma.staff.findUnique({ where: { clerkId: userId } });

    if (!user && !staff)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    let projects;

    if (staff) {
      // Staff sees all projects
      projects = await prisma.project.findMany({
        include: {
          student: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          feedbacks: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (user) {
      // Normal user sees only their projects
      projects = await prisma.project.findMany({
        where: { studentId: user.id },
        include: {
          student: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          feedbacks: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(projects);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { projectId, message } = body;

    if (!projectId || !message)
      return NextResponse.json({ error: "Missing data" }, { status: 400 });

    // Find logged-in user (student) or staff
    const user = await prisma.user.findUnique({ where: { clerkId } });
    const staff = await prisma.staff.findUnique({ where: { clerkId } });

    if (!user && !staff)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Determine sender type and id
    const sender = staff ? "lecturer" : "student";
    const uid = staff ? staff.id : user!.id; // assign staff.id or user.id

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        projectId,
        // userId: uid,
        message,
        sender,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
