"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileUpload } from "@/app/components/uploadthing";
import { useRouter } from "next/navigation";

export default function SubmitProjectPage() {
  const [fileUrl, setFileUrl] = useState("");
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    registrationNumber: "",
    projecturl: "", // ✅ NEW FIELD
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!fileUrl) {
      toast.error("Upload your document first.");
      return;
    }

    try {
      const res = await fetch("/api/project", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          fileUrl,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to submit");
        return;
      }

      toast.success("Project submitted successfully!");
      router.push("/project");
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 space-y-4">
      <h1 className="text-2xl font-semibold">Submit Your Project</h1>

      <div>
        <label>First Name</label>
        <Input
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Last Name</label>
        <Input name="lastName" value={form.lastName} onChange={handleChange} />
      </div>

      <div>
        <label>Registration Number</label>
        <Input
          name="registrationNumber"
          value={form.registrationNumber}
          onChange={handleChange}
        />
      </div>

      {/* ✅ NEW PROJECT URL FIELD */}
      <div>
        <label>Project URL (GitHub / Live Link)</label>
        <Input
          name="projecturl"
          value={form.projecturl}
          onChange={handleChange}
          placeholder="https://github.com/username/project"
        />
      </div>

      <p>first convert to pdf before upload</p>

      <div className="border p-3 rounded-md">
        <FileUpload
          onComplete={(urls) => {
            setFileUrl(urls[0]);
            toast.success("File uploaded!");
          }}
        />

        {fileUrl && (
          <p className="text-green-600 text-sm mt-2">
            File uploaded successfully.
          </p>
        )}
      </div>

      <Button onClick={handleSubmit} className="w-full">
        Submit Project
      </Button>
    </div>
  );
}
