// /app/api/public-issues/route.ts
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
export async function GET() {
  try {
    const announcements = await prisma.publicIssue.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        content: true,
        issuetype: true,
        createdAt: true,
        isAnonymous: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { title, content, issuetype, attachments = [], isAnonymous } = body;

    if (!title || !content || !issuetype) {
      return NextResponse.json(
        { error: "Title, content, and issue type are required" },
        { status: 400 }
      );
    }

    const newPublicIssue = await prisma.publicIssue.create({
      data: {
        title,
        content,
        issuetype,
        attachments,
        isAnonymous: isAnonymous || false,
        userId: user.id,
      },
    });

    return NextResponse.json({
      message: "Announcement created",
      issue: newPublicIssue,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
