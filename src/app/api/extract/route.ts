import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No PDF uploaded." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parser = new PDFParse({ data: buffer });
    let text = "";
    try {
      const result = await parser.getText();
      text = (result.text || "").trim();
    } finally {
      await parser.destroy();
    }

    if (text.length < 40) {
      return NextResponse.json(
        { error: "Couldn't read enough text from that PDF (is it scanned/image-only?)." },
        { status: 422 }
      );
    }

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json(
      { error: "Failed to read the PDF. Try pasting the text instead." },
      { status: 500 }
    );
  }
}
