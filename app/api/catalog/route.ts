import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const catalog = await prisma.catalogItem.findMany({
      include: {
        inventory: {
          include: {
            fulfillmentCenter: true,
          },
        },
      },
    });

    return NextResponse.json(catalog);
  } catch (error) {
    console.error("Catalog error:", error);
    return NextResponse.json(
      { message: "Failed to fetch catalog" },
      { status: 500 }
    );
  }
}