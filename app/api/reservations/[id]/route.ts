import { NextRequest, NextResponse } from "next/server";
import { database } from "@/core/database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const { id: reservationId } = await params;

    const reservation =
      await database.reservationRecord.findUnique({
        where: {
          id: reservationId,
        },

        include: {
          stockLedger: {

            include: {

              catalogItem: true,

              fulfillment: true,
            },
          },
        },
      });

    if (!reservation) {

      return NextResponse.json(
        {
          message:
            "Reservation not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(reservation);

  } catch (error) {

    console.error(
      "Reservation fetch failed:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to fetch reservation",
      },
      {
        status: 500,
      }
    );
  }
}