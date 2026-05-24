import { NextRequest, NextResponse } from "next/server";
import { database } from "@/core/database";

export async function POST(
  request: NextRequest
) {

  try {

    const body =
      await request.json();

    const {
      stockLedgerId,
      unitsReserved,
    } = body;

    const reservation =
      await database.$transaction(
        async (transaction) => {

          const stockLedger =
            await transaction.stockLedger.findUnique({
              where: {
                id: stockLedgerId,
              },
            });

          if (!stockLedger) {

            throw new Error(
              "Inventory record not found"
            );
          }

          const availableUnits =
            stockLedger.physicalUnits -
            stockLedger.allocatedUnits;

          if (
            availableUnits <
            unitsReserved
          ) {

            throw new Error(
              "INSUFFICIENT_STOCK"
            );
          }

          await transaction.stockLedger.update({
            where: {
              id: stockLedgerId,
            },

            data: {
              allocatedUnits: {
                increment:
                  unitsReserved,
              },
            },
          });

          const expiresAt =
            new Date(
              Date.now() +
              10 * 60 * 1000
            );

          return await transaction.reservationRecord.create({
            data: {
              stockLedgerId,
              unitsReserved,
              expiresAt,
            },
          });
        }
      );

    return NextResponse.json(
      reservation,
      {
        status: 201,
      }
    );

  } catch (error) {

    console.error(
      "Reservation creation failed:",
      error
    );

    if (
      error instanceof Error &&
      error.message ===
        "INSUFFICIENT_STOCK"
    ) {

      return NextResponse.json(
        {
          message:
            "Insufficient inventory available",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        message:
          "Reservation could not be created",
      },
      {
        status: 500,
      }
    );
  }
}