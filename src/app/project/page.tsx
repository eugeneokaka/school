"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type FeedbackType = {
  id: string;
  message: string;
  sender: string;
  user: { firstName: string; lastName: string };
};

type ProjectType = {
  id: string;
  firstName: string;
  lastName: string;
  registrationNumber: string;
  fileUrl: string;
  feedbacks: FeedbackType[];
  projecturl?: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [feedbacks, setFeedbacks] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/project/feedback");
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleFeedbackChange = (projectId: string, value: string) => {
    setFeedbacks({ ...feedbacks, [projectId]: value });
  };

  const submitFeedback = async (projectId: string) => {
    if (!feedbacks[projectId]) {
      toast.error("Enter a message");
      return;
    }
    try {
      const res = await fetch("/api/project/feedback", {
        method: "POST",
        body: JSON.stringify({ projectId, message: feedbacks[projectId] }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to submit feedback");
        return;
      }
      toast.success("Feedback sent!");
      setFeedbacks({ ...feedbacks, [projectId]: "" });
      fetchProjects();
    } catch (error) {
      toast.error("Error sending feedback");
    }
  };

  // ---------- LOADING ----------
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-8">
      <h1 className="text-2xl font-semibold">Projects</h1>

      {projects.map((project) => (
        <div key={project.id} className="border p-4 rounded-md space-y-3">
          <h2 className="font-semibold">
            {project.firstName} {project.lastName} ({project.registrationNumber}
            )
          </h2>

          {/* Document Link */}
          <a
            href={project.fileUrl}
            target="_blank"
            className="text-blue-600 underline"
          >
            View Document
          </a>

          {/* ✅ Project URL */}
          {project.projecturl && (
            <p>
              <strong>Project URL:</strong>{" "}
              <a
                href={project.projecturl}
                target="_blank"
                className="text-blue-600 underline"
              >
                {project.projecturl}
              </a>
            </p>
          )}

          <div className="space-y-2">
            <h3 className="font-medium">Feedback:</h3>

            {project.feedbacks.map((f) => (
              <p key={f.id}>
                <strong>
                  {f.sender === "lecturer" ? "Lecturer" : "Student"}:
                </strong>{" "}
                {f.message}
              </p>
            ))}

            <div className="flex gap-2 mt-2">
              <Input
                value={feedbacks[project.id] || ""}
                onChange={(e) =>
                  handleFeedbackChange(project.id, e.target.value)
                }
                placeholder="Add feedback..."
              />
              <Button onClick={() => submitFeedback(project.id)}>Send</Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
