import { NextResponse } from "next/server";
import { database } from "@/core/database";

export async function GET() {
  try {
    const catalog = await database.catalogItem.findMany({
      include: {
        stockLedger: {
          include: {
            fulfillment: true,
          },
        },
      },
    });

    const formattedCatalog = catalog.map((item) => ({
      id: item.id,
      title: item.title,
      details: item.details,

      inventory: item.stockLedger.map((ledger) => ({
        stockLedgerId: ledger.id,

        fulfillmentCenter: {
          id: ledger.fulfillment.id,
          name: ledger.fulfillment.name,
          region: ledger.fulfillment.region,
        },

        physicalUnits: ledger.physicalUnits,
        allocatedUnits: ledger.allocatedUnits,

        availableUnits:
          ledger.physicalUnits - ledger.allocatedUnits,
      })),
    }));

    return NextResponse.json(formattedCatalog);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Unable to fetch catalog",
      },
      {
        status: 500,
      }
    );
  }
}