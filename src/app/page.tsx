"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-8">
        Welcome to Kabarak Project Review
      </h1>

      <Card className="w-full max-w-md shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Submit Your Documentation
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-gray-600">
            Upload your project documentation for review by your lecturer.
          </p>
        </CardContent>

        <CardFooter>
          <Link href="/submit" className="w-full">
            <Button className="w-full">Go to Submit Page</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
