"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function CreateStaffPage() {
  const [emailSearch, setEmailSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("staff");
  const [message, setMessage] = useState("");

  const searchUser = async () => {
    setLoading(true);
    setMessage("");
    setSelectedUser(null);

    try {
      const res = await fetch(
        `/api/staff/create?email=${encodeURIComponent(emailSearch)}`
      );
      const data = await res.json();

      if (res.ok) {
        setSelectedUser(data.user);
      } else {
        setMessage(data.error || "User not found");
      }
    } catch {
      setMessage("Error searching for user");
    }

    setLoading(false);
  };

  const createStaff = async () => {
    if (!selectedUser) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/staff/create", {
        method: "POST",
        body: JSON.stringify({
          clerkId: selectedUser.clerkId,
          firstName: selectedUser.firstName,
          lastName: selectedUser.lastName,
          email: selectedUser.email,
          department,
          role,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Staff created successfully!");
        setMessage("Staff created successfully!");
        setSelectedUser(null);
        setDepartment("");
        setRole("staff");
        setEmailSearch("");
      } else {
        setMessage(data.error || "Error creating staff");
      }
    } catch {
      toast.error("Failed to create staff. Please try again.");
      setMessage("Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-brown-50 to-white flex flex-col items-center p-6">
      <div className="w-full max-w-xl bg-white/30 backdrop-blur-md border border-brown-300 rounded-2xl shadow-lg p-6 space-y-6">
        <h1 className="text-3xl font-extrabold text-black text-center">
          Create Staff
        </h1>

        {/* Search Section */}
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Search user by email..."
            value={emailSearch}
            onChange={(e) => setEmailSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-brown-400 focus:ring-brown-700 focus:border-brown-700 bg-white/70"
          />
          <button
            onClick={searchUser}
            disabled={loading}
            className="w-full py-2 rounded-lg bg-black text-white font-medium hover:bg-gray-900 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Message */}
        {message && <p className="text-center text-red-600">{message}</p>}

        {/* User Card */}
        {selectedUser && (
          <div className="border border-brown-300 p-4 rounded-lg bg-brown-100/40 backdrop-blur-sm space-y-3">
            <h2 className="text-xl font-semibold text-black">User Found:</h2>
            <p className="text-black">
              <strong>Name:</strong> {selectedUser.firstName}{" "}
              {selectedUser.lastName}
            </p>
            <p className="text-black">
              <strong>Email:</strong> {selectedUser.email}
            </p>
            <p className="text-black">
              <strong>Clerk ID:</strong> {selectedUser.clerkId}
            </p>

            {/* Role selector */}
            <div className="mt-4 space-y-2">
              <label className="block text-black font-medium">
                Select Role
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-brown-400 focus:ring-brown-700 focus:border-brown-700 bg-white/70"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Department selector */}
            <div className="mt-4 space-y-2">
              <label className="block text-black font-medium">
                Select Department
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-brown-400 focus:ring-brown-700 focus:border-brown-700 bg-white/70"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">Select...</option>
                <option value="IT">IT</option>
                <option value="Finance">Finance</option>
                <option value="Housing">Housing</option>
                <option value="Security">Security</option>
              </select>
            </div>

            <button
              onClick={createStaff}
              disabled={loading || !department}
              className="w-full mt-4 py-2 rounded-lg bg-black text-white font-medium hover:bg-gray-900 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Staff"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
