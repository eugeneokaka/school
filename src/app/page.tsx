"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type PublicIssue = {
  id: string;
  title: string;
  content: string;
  issuetype: string;
  createdAt: string;
  isAnonymous: boolean;
  user?: {
    firstName: string;
    lastName: string;
  };
};

export default function HomePage() {
  const [issues, setIssues] = useState<PublicIssue[]>([]);

  useEffect(() => {
    async function fetchIssues() {
      const res = await fetch("/api/public-issues");
      const data = await res.json();
      setIssues(data.announcements || []);
    }
    fetchIssues();
  }, []);

  return (
    <div className="min-h-screen w-full bg-gray-100 text-gray-900">
      {/* HERO SECTION */}
      <section className="min-h-[60vh] flex items-center justify-center px-6 bg-white border-b border-gray-200">
        <div className="max-w-2xl text-center space-y-6">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
            Welcome to Kabarak Online Helpdesk
          </h1>

          <p className="text-lg text-gray-600">
            Access announcements, report issues, and manage staff services all
            in one place.
          </p>
        </div>
      </section>

      {/* CARDS SECTION */}
      <section className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 px-6 py-16">
        <Card className="rounded-2xl border border-gray-300 bg-white shadow-sm hover:shadow-md transition">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Staff Directory
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-gray-600 mb-3 leading-relaxed">
              Contact staff members for assistance and support.
            </p>
            <a
              href="/issues"
              className="text-black font-medium hover:underline mt-2 inline-block"
            >
              Open Issues
            </a>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-gray-300 bg-white shadow-sm hover:shadow-md transition">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Submit an Issue
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-gray-600 mb-3 leading-relaxed">
              Report public issues, concerns, or make announcements.
            </p>
            <a
              href="/new"
              className="text-black font-medium hover:underline mt-2 inline-block"
            >
              Create Issue
            </a>
          </CardContent>
        </Card>
      </section>

      {/* LATEST PUBLIC ISSUES */}
      <section className="max-w-5xl mx-auto px-6 pb-20 space-y-6">
        <h2 className="text-3xl font-semibold text-gray-900">
          Latest Public Issues
        </h2>

        <div className="space-y-4">
          {issues.length === 0 && (
            <p className="text-gray-600">No public issues available.</p>
          )}

          {issues.map((issue) => (
            <Card
              key={issue.id}
              className="rounded-xl border border-gray-300 bg-white shadow-sm hover:shadow-md transition p-4"
            >
              {/* HEADER */}
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {issue.title}
                </CardTitle>

                <div className="text-sm text-gray-500 flex gap-4 mt-1">
                  <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                  <span>
                    {issue.isAnonymous
                      ? "Posted Anonymously"
                      : issue.user
                      ? `Posted by ${issue.user.firstName} ${issue.user.lastName}`
                      : "Posted by Unknown"}
                  </span>
                </div>
              </CardHeader>

              {/* FULL CONTENT */}
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {issue.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
