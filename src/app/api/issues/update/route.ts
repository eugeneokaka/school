import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staff = await prisma.staff.findUnique({ where: { clerkId: userId } });
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });

    if (!user && !staff) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { issueId, status, comment, commentId, updateComment } = body;

    if (!issueId && !(commentId && updateComment)) {
      return NextResponse.json(
        {
          error:
            "Provide issueId for issue updates or commentId for comment updates",
        },
        { status: 400 }
      );
    }

    let updatedIssue;

    // --- Staff updates issue status ---
    if (staff && status) {
      updatedIssue = await prisma.issue.update({
        where: { id: issueId },
        data: { status, staffId: staff.id },
      });
    }

    // --- Add new comment ---
    if (comment) {
      if (!issueId) {
        return NextResponse.json(
          { error: "issueId is required to add a comment" },
          { status: 400 }
        );
      }

      await prisma.comment.create({
        data: {
          message: comment,
          issueId,
          staffId: staff?.id || undefined,
          userId: user?.id || undefined,
        },
      });
    }

    // --- Update existing comment ---
    if (commentId && updateComment) {
      const existingComment = await prisma.comment.findUnique({
        where: { id: commentId },
      });

      if (!existingComment) {
        return NextResponse.json(
          { error: "Comment not found" },
          { status: 404 }
        );
      }

      // Only author (user or staff) can update their comment
      if (
        (user && existingComment.userId !== user.id) ||
        (staff && existingComment.staffId !== staff.id)
      ) {
        return NextResponse.json(
          { error: "You can only update your own comment" },
          { status: 403 }
        );
      }

      await prisma.comment.update({
        where: { id: commentId },
        data: { message: updateComment },
      });
    }

    return NextResponse.json({
      message: "Update successful",
      issue: updatedIssue,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
