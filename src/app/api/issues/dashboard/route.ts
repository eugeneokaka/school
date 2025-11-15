import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    const staff = await prisma.staff.findUnique({ where: { clerkId: userId } });

    if (!user && !staff) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const url = new URL(req.url);
    const departmentFilter = url.searchParams.get("department") || undefined;
    const statusQuery = url.searchParams.get("status") || undefined;
    const startDateQuery = url.searchParams.get("startDate") || undefined;
    const endDateQuery = url.searchParams.get("endDate") || undefined;

    // Allowed statuses
    const allowedStatuses = ["pending", "reviewing", "resolved"] as const;
    type IssueStatusType = (typeof allowedStatuses)[number];

    const statusFilter: IssueStatusType | undefined = allowedStatuses.includes(
      statusQuery as IssueStatusType
    )
      ? (statusQuery as IssueStatusType)
      : undefined;

    // Date filter
    const createdAtFilter =
      startDateQuery || endDateQuery
        ? {
            ...(startDateQuery && { gte: new Date(startDateQuery) }),
            ...(endDateQuery && { lte: new Date(endDateQuery) }),
          }
        : undefined;

    // Build query
    const whereClause: any = {
      ...(user && { studentId: user.id }),
      ...(departmentFilter && { department: departmentFilter }),
      ...(statusFilter && { status: statusFilter }),
      ...(createdAtFilter && { createdAt: createdAtFilter }),
    };

    // Students see only their issues, staff/admin see all
    // const issues = await prisma.issue.findMany({
    //   where: whereClause,
    //   include: { student: true, staff: true },
    //   orderBy: { createdAt: "desc" },
    // });
    const issues = await prisma.issue.findMany({
      where: whereClause,
      include: {
        student: true,
        staff: true,

        comments: {
          orderBy: { createdAt: "asc" },
          include: { user: true, staff: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ issues });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
