"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileUpload } from "@/app/components/uploadthing"; // <-- import your working UploadThing component

export default function CreateIssuePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const submitIssue = async () => {
    if (!title || !description || !department) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/issues/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, department, attachments }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Issue submitted successfully!");
        setTitle("");
        setDescription("");
        setDepartment("");
        setAttachments([]);
      } else {
        toast.error(data.error || "Failed to submit issue");
      }
    } catch (err) {
      toast.error("Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-start p-6 bg-gradient-to-br from-white via-brown-50 to-white">
      <div className="w-full max-w-2xl bg-white/30 backdrop-blur-md border border-brown-300 rounded-2xl p-6 shadow-lg space-y-6">
        <h1 className="text-3xl font-extrabold text-black text-center">
          Submit Issue
        </h1>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Issue Title"
            className="w-full px-3 py-2 rounded-lg border border-brown-400 focus:ring-brown-700 focus:border-brown-700 bg-white/70"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Description"
            className="w-full px-3 py-2 rounded-lg border border-brown-400 focus:ring-brown-700 focus:border-brown-700 bg-white/70"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <select
            className="w-full px-3 py-2 rounded-lg border border-brown-400 focus:ring-brown-700 focus:border-brown-700 bg-white/70"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">Select Department</option>
            <option value="IT">IT</option>
            <option value="Finance">Finance</option>
            <option value="Housing">Housing</option>
            <option value="Security">Security</option>
            <option value="academics">academics</option>
            <option value="sset">sset</option>
            <option value="medicine">medicine</option>
            <option value="administration">administration</option>
          </select>

          {/* UploadThing FileUpload */}
          <FileUpload
            onComplete={(urls) => setAttachments((prev) => [...prev, ...urls])}
          />

          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {attachments.map((att, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-brown-200/50 rounded-full text-sm"
                >
                  {att.split("/").pop()} {/* show filename */}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={submitIssue}
            disabled={loading}
            className="w-full py-2 rounded-lg bg-black text-white font-medium hover:bg-gray-900 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Issue"}
          </button>
        </div>
      </div>
    </div>
  );
}
