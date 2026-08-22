import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      fullName,
      email,
      phone,
      position,
      experience,
      coverLetter,
      cvUrl,
      cvFileName,
    } = body;

    // Basic validation
    if (!fullName || !email || !phone || !position || !cvUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Save to Firebase
    const db = getDb();
    await addDoc(collection(db, "applications"), {
      fullName,
      email,
      phone,
      position,
      experience: experience || "",
      coverLetter: coverLetter || "",
      cvUrl,
      cvFileName,
      createdAt: serverTimestamp(),
      status: "pending",
    });

    return NextResponse.json(
      { success: true, message: "Application submitted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Career application error:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}