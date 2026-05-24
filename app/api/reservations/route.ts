import { NextRequest, NextResponse } from "next/server";
import { database } from "@/core/database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  try {

    const { id: reservationId } =
      await params;

    let reservation =
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

    const activeReservation =
      reservation;

    const hasExpired =
      activeReservation.state === "ACTIVE" &&
      new Date() >
        new Date(
          activeReservation.expiresAt
        );

    if (hasExpired) {

      await database.$transaction(
        async (transaction) => {

          await transaction.stockLedger.update({
            where: {
              id:
                activeReservation.stockLedgerId,
            },

            data: {
              allocatedUnits: {
                decrement:
                  activeReservation.unitsReserved,
              },
            },
          });

          await transaction.reservationRecord.update({
            where: {
              id:
                activeReservation.id,
            },

            data: {
              state: "EXPIRED",

              cancelledAt:
                new Date(),
            },
          });
        }
      );

      reservation =
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
    }

    return NextResponse.json(
      reservation
    );

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