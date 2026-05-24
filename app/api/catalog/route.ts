import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.catalogItem.findMany();
    return NextResponse.json(items);
  } catch (error) {
    console.error("Catalog fetch error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}