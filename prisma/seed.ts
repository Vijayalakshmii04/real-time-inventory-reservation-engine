import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  const centralHub = await prisma.fulfillmentCenter.create({
    data: {
      name: "South Zone Hub",
      region: "Chennai",
    },
  });

  const expressHub = await prisma.fulfillmentCenter.create({
    data: {
      name: "West Zone Hub",
      region: "Bangalore",
    },
  });
  const smartWatch = await prisma.catalogItem.create({
    data: {
      title: "Boat Smart Watch",
      details:
        "AMOLED display with fitness telemetry and LTE support",
    },
  });

  const keyboard = await prisma.catalogItem.create({
    data: {
      title: "Phantom Mechanical Keyboard",
      details: "Wireless RGB low-latency keyboard",
    },
  });

  const headset = await prisma.catalogItem.create({
    data: {
      title: "Nova Gaming Headset",
      details: "Spatial surround sound headset",
    },
  });

  const mouse = await prisma.catalogItem.create({
    data: {
      title: "Velocity Pro Mouse",
      details: "Ultra-light esports gaming mouse",
    },
  });

  await prisma.stockLedger.createMany({
    data: [
      {
        catalogItemId: keyboard.id,
        fulfillmentId: centralHub.id,
        physicalUnits: 5,
      },
      {
        catalogItemId: keyboard.id,
        fulfillmentId: expressHub.id,
        physicalUnits: 2,
      },
      {
        catalogItemId: headset.id,
        fulfillmentId: centralHub.id,
        physicalUnits: 12,
      },
      {
        catalogItemId: mouse.id,
        fulfillmentId: expressHub.id,
        physicalUnits: 4,
      },
       {
        catalogItemId: smartWatch.id,
        fulfillmentId: expressHub.id,
        physicalUnits: 10,
      },
    ],
  });

  console.log("Seed completed successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });