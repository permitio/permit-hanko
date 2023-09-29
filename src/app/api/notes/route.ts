import { NextRequest, NextResponse } from "next/server";

type Note = {
    owner: string;
    title: string;
    content: string;
    createdAt: string;
    id: string;
}

const notes: Note[] = [{
    owner: 'test',
    title: 'test',
    content: 'test test test testtesttesttesttesttest testtest test testtest',
    createdAt: 'test',
    id: 'test'
}, {
    owner: 'test',
    title: 'test',
    content: 'tes ttes ttes',
    createdAt: 'test',
    id: 'test'
}];

const GET = async (req: NextRequest) => {
    return NextResponse.json(notes);
}

const POST = async (req: NextRequest) => {
    return NextResponse.json([]);
}

const DELETE = async (req: NextRequest) => {
    return NextResponse.json([]);
}

export { GET, POST, DELETE };
