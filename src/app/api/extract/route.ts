import { NextRequest, NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No PDF uploaded." }, { status: 400 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const pdf = await getDocumentProxy(bytes);
    const { text } = await extractText(pdf, { mergePages: true });
    const cleaned = (text || "").trim();

    if (cleaned.length < 40) {
      return NextResponse.json(
        {
          error:
            "Couldn't read enough text from that PDF (is it scanned/image-only?).",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ text: cleaned });
  } catch {
    return NextResponse.json(
      { error: "Failed to read the PDF. Try pasting the text instead." },
      { status: 500 }
    );
  }
}
