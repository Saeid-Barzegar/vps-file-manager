import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { stat } from "fs/promises";

const statAsync = promisify(fs.stat);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filePath = searchParams.get("file");

    console.log({ filePath })

    if (!filePath) {
      return NextResponse.json({ error: "File path is required" }, { status: 400 });
    }

    // Resolve absolute path (ensure security)
    const resolvedPath = path.resolve(filePath);

    // Check if file exists
    const fileStats = await stat(resolvedPath);
    if (!fileStats.isFile()) {
      return NextResponse.json({ error: "Not a valid file" }, { status: 400 });
    }

    // Create readable stream
    const fileStream = fs.createReadStream(resolvedPath);

    // Convert Node.js stream to Web ReadableStream
    const readableStream = new ReadableStream({
      start(controller) {
        fileStream.on("data", (chunk) => controller.enqueue(chunk));
        fileStream.on("end", () => controller.close());
        fileStream.on("error", (err) => controller.error(err));
      },
    });

    return new NextResponse(readableStream, {
      status: 200,
      headers: new Headers({
        "Content-Disposition": `attachment; filename="${path.basename(resolvedPath)}"`,
        "Content-Type": "application/octet-stream",
      }),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
