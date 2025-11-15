"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) throw new Error("User not authenticated");

      const email = user.primaryEmailAddress?.emailAddress;
      const clerkId = user.id;

      if (!email || !clerkId) throw new Error("Missing email or Clerk ID");

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, clerkId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to save data");

      toast.success("Profile completed successfully!");

      setTimeout(() => {
        router.push("/");
      }, 700);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#f5eee6] to-white">
      <Card className="w-full max-w-md p-8 shadow-2xl border border-[#d4bba4] rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-[#4b2e2e] text-center text-3xl font-extrabold mb-2">
            Complete Your Profile
          </CardTitle>
          <CardDescription className="text-center text-[#6f4e37] mb-6">
            Fill in your details to finish onboarding
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label
                htmlFor="firstName"
                className="text-[#4b2e2e] font-semibold"
              >
                First Name
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="mt-2 border-[#b28d78] focus:ring-[#4b2e2e] focus:border-[#4b2e2e]"
                required
              />
            </div>

            <div>
              <Label
                htmlFor="lastName"
                className="text-[#4b2e2e] font-semibold"
              >
                Last Name
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="mt-2 border-[#b28d78] focus:ring-[#4b2e2e] focus:border-[#4b2e2e]"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full py-3 text-white bg-[#4b2e2e] hover:bg-[#3b2626] disabled:bg-[#bfae9f] rounded-lg shadow-lg transition-all"
              disabled={loading}
            >
              {loading ? "Saving..." : "Complete Onboarding"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
