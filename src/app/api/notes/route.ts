import { Note } from "@/models/Note";
import { NextRequest, NextResponse } from "next/server";

const uuidv4 = () =>
  "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c: any) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );

const notes: Note[] = [];

const GET = async (req: NextRequest) => {
  return NextResponse.json(notes);
};

const POST = async (req: NextRequest) => {
  const note = await req.json();
  note.id = uuidv4();
  note.createdAt = new Date().toISOString();
  notes.push(note);
  console.log(note);
  return NextResponse.json(note);
};

const PUT = async (req: NextRequest) => {
  const note = await req.json();
  const index = notes.findIndex((n) => n.id === note.id);
  notes[index] = note;
  return NextResponse.json(note);
};

const DELETE = async (req: NextRequest) => {
  const note = await req.json();
  const index = notes.findIndex((n) => n.id === note.id);
  notes.splice(index, 1);
  return NextResponse.json([]);
};

export { GET, POST, PUT, DELETE };
