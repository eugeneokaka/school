"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

type Comment = {
  id: string;
  message: string;
  createdAt: string;
  user?: { firstName: string; lastName: string } | null;
  staff?: { firstName: string; lastName: string } | null;
};

type Issue = {
  id: string;
  title: string;
  description: string;
  department: string;
  status: string;
  createdAt: string;
  attachments: string[];
  student: { firstName: string; lastName: string };
  staff?: { firstName: string; lastName: string } | null;
  comments: Comment[];
};

export default function DashboardPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [showFullDesc, setShowFullDesc] = useState<Record<string, boolean>>({});
  const [statusLoading, setStatusLoading] = useState<Record<string, boolean>>(
    {}
  );
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>(
    {}
  );
  const [isStaff, setIsStaff] = useState(false);

  // Fetch staff info
  const fetchStaffInfo = async () => {
    try {
      const res = await fetch("/api/staff/me");
      const data = await res.json();
      setIsStaff(data.isStaff || false);
    } catch (err) {
      console.error("Failed to check staff status", err);
    }
  };

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (departmentFilter) params.append("department", departmentFilter);
      if (statusFilter) params.append("status", statusFilter);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await fetch(`/api/issues/dashboard?${params.toString()}`);
      const data = await res.json();
      if (res.ok) setIssues(data.issues);
      else toast.error(data.error || "Failed to fetch issues");
    } catch (err) {
      toast.error("Something went wrong fetching issues");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStaffInfo();
    fetchIssues();
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [departmentFilter, statusFilter, startDate, endDate]);

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    setStatusLoading((prev) => ({ ...prev, [issueId]: true }));
    try {
      const res = await fetch("/api/issues/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Status updated!");
        fetchIssues();
      } else {
        toast.error(data.error || "Failed to update status");
      }
    } catch {
      toast.error("Failed to update status");
    }
    setStatusLoading((prev) => ({ ...prev, [issueId]: false }));
  };

  const handleAddComment = async (issueId: string) => {
    const comment = commentText[issueId]?.trim();
    if (!comment) return toast.error("Comment cannot be empty");

    setCommentLoading((prev) => ({ ...prev, [issueId]: true }));

    try {
      const res = await fetch("/api/issues/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId, comment }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Comment added!");
        setCommentText((prev) => ({ ...prev, [issueId]: "" }));
        fetchIssues();
      } else {
        toast.error(data.error || "Failed to add comment");
      }
    } catch {
      toast.error("Failed to add comment");
    }
    setCommentLoading((prev) => ({ ...prev, [issueId]: false }));
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    reviewing: "bg-blue-100 text-blue-800",
    resolved: "bg-green-100 text-green-800",
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl p-6 shadow-lg space-y-6">
        <h1 className="text-3xl font-extrabold text-black text-center mb-4">
          Issue Dashboard
        </h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            <option value="IT">IT</option>
            <option value="Finance">Finance</option>
            <option value="Housing">Housing</option>
            <option value="Security">Security</option>
            <option value="academics">academics</option>
            <option value="sset">sset</option>
            <option value="medicine">medicine</option>
            {/* <option value="Security">administration</option> */}
          </select>

          <select
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="resolved">Resolved</option>
          </select>

          <input
            type="date"
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : issues.length === 0 ? (
          <p>No issues found.</p>
        ) : (
          <div className="space-y-6">
            {issues.map((issue) => {
              const isLong = issue.description.length > 150;
              const showFull = showFullDesc[issue.id] || false;

              return (
                <div
                  key={issue.id}
                  className="p-5 bg-white rounded-2xl shadow-md border border-gray-200"
                >
                  {/* Header */}
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="font-semibold text-xl">{issue.title}</h2>

                    {isStaff ? (
                      <div className="flex items-center gap-2">
                        <select
                          className="border px-2 py-1 rounded"
                          value={issue.status}
                          onChange={(e) =>
                            handleStatusChange(issue.id, e.target.value)
                          }
                          disabled={statusLoading[issue.id]}
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewing">Reviewing</option>
                          <option value="resolved">Resolved</option>
                        </select>
                        {statusLoading[issue.id] && (
                          <span className="text-sm text-gray-500">
                            Updating...
                          </span>
                        )}
                      </div>
                    ) : (
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          statusColors[issue.status] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {issue.status.charAt(0).toUpperCase() +
                          issue.status.slice(1)}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 mb-2">
                    {isLong && !showFull
                      ? issue.description.slice(0, 150) + "..."
                      : issue.description}
                    {isLong && (
                      <button
                        className="text-blue-600 ml-2 underline"
                        onClick={() =>
                          setShowFullDesc((prev) => ({
                            ...prev,
                            [issue.id]: !prev[issue.id],
                          }))
                        }
                      >
                        {showFull ? "Show Less" : "View More"}
                      </button>
                    )}
                  </p>

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                    <p>
                      <strong>Department:</strong> {issue.department}
                    </p>
                    <p>
                      <strong>Submitted by:</strong> {issue.student.firstName}{" "}
                      {issue.student.lastName}
                    </p>
                    {issue.staff && (
                      <p>
                        <strong>Assigned Staff:</strong> {issue.staff.firstName}{" "}
                        {issue.staff.lastName}
                      </p>
                    )}
                    <p>
                      <strong>Created:</strong>{" "}
                      {new Date(issue.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Attachments */}
                  {issue.attachments && issue.attachments.length > 0 && (
                    <div className="mb-3">
                      <h3 className="font-medium text-gray-800 mb-2">
                        Attachments:
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {issue.attachments.map((att, idx) => {
                          const isImage = att.match(
                            /\.(jpeg|jpg|png|gif|webp)$/i
                          );
                          return isImage ? (
                            <img
                              key={idx}
                              src={att}
                              alt={`Attachment ${idx + 1}`}
                              className="w-32 h-32 object-cover rounded-md border border-gray-200 shadow-sm"
                            />
                          ) : (
                            <a
                              key={idx}
                              href={att}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 border border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 text-sm"
                            >
                              Attachment {idx + 1}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Comments */}
                  <div className="mb-3">
                    <h3 className="font-medium text-gray-800 mb-1">
                      Comments:
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto px-2 py-1 border rounded-lg bg-gray-50">
                      {issue.comments.length === 0 && (
                        <p className="text-gray-500 text-sm">
                          No comments yet.
                        </p>
                      )}
                      {issue.comments.map((c) => (
                        <div
                          key={c.id}
                          className="p-2 rounded-md bg-white border border-gray-200 shadow-sm"
                        >
                          <p className="text-gray-700 text-sm">
                            <strong>
                              {c.user
                                ? `${c.user.firstName} ${c.user.lastName}`
                                : c.staff
                                ? `${c.staff.firstName} ${c.staff.lastName}`
                                : "Unknown"}
                              :
                            </strong>{" "}
                            {c.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(c.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add comment */}
                  <div className="mt-2 flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Add comment..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg w-full"
                      value={commentText[issue.id] || ""}
                      onChange={(e) =>
                        setCommentText((prev) => ({
                          ...prev,
                          [issue.id]: e.target.value,
                        }))
                      }
                      disabled={commentLoading[issue.id]}
                    />
                    <button
                      onClick={() => handleAddComment(issue.id)}
                      className="px-4 py-2 bg-black text-white rounded-lg w-full sm:w-auto"
                      disabled={commentLoading[issue.id]}
                    >
                      {commentLoading[issue.id] ? "Sending..." : "Send"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
