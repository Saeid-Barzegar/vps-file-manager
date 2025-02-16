import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get("path") ?? "/";
    const { stdout, stderr } = await execAsync(`ls -lah "${path}"`);
    if (stderr) {
      return NextResponse.json({ error: stderr }, { status: 500 });
    }
    return NextResponse.json({ files: stdout.split("\n") });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}