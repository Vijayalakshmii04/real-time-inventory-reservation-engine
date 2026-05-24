import { NextRequest, NextResponse } from "next/server";
import { database } from "@/core/database";

export async function POST(
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
      });

    if (!reservation) {
      return NextResponse.json(
        {
          message: "Reservation not found",
        },
        {
          status: 404,
        }
      );
    }

    if (reservation.state !== "ACTIVE") {
      return NextResponse.json(
        {
          message:
            "Reservation is already finalized",
        },
        {
          status: 400,
        }
      );
    }

    await database.$transaction(async (transaction) => {

      await transaction.stockLedger.update({
        where: {
          id: reservation.stockLedgerId,
        },
        data: {
          allocatedUnits: {
            decrement: reservation.unitsReserved,
          },
        },
      });

      await transaction.reservationRecord.update({
        where: {
          id: reservation.id,
        },
        data: {
          state: "RELEASED",
          cancelledAt: new Date(),
        },
      });

    });

    return NextResponse.json({
      success: true,
      message: "Reservation released successfully",
    });

  } catch (error) {

    console.error(
      "Reservation release failed:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to release reservation",
      },
      {
        status: 500,
      }
    );
  }
}