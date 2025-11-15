import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  studentAttachment: f({
    image: { maxFileSize: "4MB", maxFileCount: 6 },
    pdf: { maxFileSize: "4MB", maxFileCount: 4 },
    // You can add more file types here if needed
  }).onUploadComplete(async ({ file }) => {
    // Log the uploaded file
    console.log("Upload complete:", file.url);
    // You can also save this URL to your database here
    return { url: file.url };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
