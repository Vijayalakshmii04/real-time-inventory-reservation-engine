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
            "Reservation is no longer active",
        },
        {
          status: 400,
        }
      );
    }

    if (new Date() > reservation.expiresAt) {

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
            state: "EXPIRED",
          },
        });

      });

      return NextResponse.json(
        {
          message:
            "Reservation expired before confirmation",
        },
        {
          status: 410,
        }
      );
    }

    const confirmedReservation =
      await database.reservationRecord.update({
        where: {
          id: reservation.id,
        },
        data: {
          state: "CONFIRMED",
          confirmedAt: new Date(),
        },
      });

    return NextResponse.json(confirmedReservation);

  } catch (error) {

    console.error(
      "Reservation confirmation failed:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to confirm reservation",
      },
      {
        status: 500,
      }
    );
  }
}