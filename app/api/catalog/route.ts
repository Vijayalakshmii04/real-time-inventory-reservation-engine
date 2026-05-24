import { NextResponse } from "next/server";
import { database } from "@/core/database";

export async function GET() {

  try {

    const items =
      await database.catalogItem.findMany({
        include: {
          stockLedger: {
            include: {
              fulfillment: true,
            },
          },
        },
      });

    return NextResponse.json(items);

  } catch (error) {

    console.error("Catalog fetch error:", error);

    return NextResponse.json(
      {
        message: "Failed to load catalog",
      },
      { status: 500 }
    );
  }
}