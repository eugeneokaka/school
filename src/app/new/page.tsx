"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileUpload } from "../components/uploadthing"; // Adjust path if needed

export default function PublicAnnouncementsPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [issuetype, setIssuetype] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !content || !issuetype)
      return toast.error("All fields are required");

    setLoading(true);
    try {
      const res = await fetch("/api/public-issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          issuetype,
          attachments,
          isAnonymous,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Announcement posted!");
        setTitle("");
        setContent("");
        setIssuetype("");
        setAttachments([]);
        setIsAnonymous(false);
      } else {
        toast.error(data.error || "Failed to post announcement");
      }
    } catch (err) {
      toast.error("Something went wrong");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Post Public Announcement</h1>
      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Title"
          className="border px-3 py-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select
          className="border px-3 py-2 rounded"
          value={issuetype}
          onChange={(e) => setIssuetype(e.target.value)}
        >
          <option value="">Select Type</option>
          <option value="general">General</option>
          <option value="event">Event</option>
          <option value="alert">Alert</option>
        </select>
        <textarea
          placeholder="Content"
          className="border px-3 py-2 rounded h-32"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* UploadThing File Upload */}
        <FileUpload
          onComplete={(urls) => {
            setAttachments(urls);
          }}
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
          />
          Post anonymously
        </label>

        <button
          onClick={handleSubmit}
          className="bg-black text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Posting..." : "Post Announcement"}
        </button>
      </div>
    </div>
  );
}
