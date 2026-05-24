"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

type InventoryUnit = {
  stockLedgerId: string;

  fulfillmentCenter: {
    id: string;
    name: string;
    region: string;
  };

  physicalUnits: number;
  allocatedUnits: number;
  availableUnits: number;
};

type CatalogItem = {
  id: string;
  title: string;
  details: string;
  inventory: InventoryUnit[];
};

export default function HomePage() {

  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadCatalog() {
    try {

      const response = await fetch("/api/catalog");

      const data = await response.json();

      setCatalog(data);

    } catch (error) {

      toast.error("Unable to load inventory");

    } finally {

      setLoading(false);
    }
  }

  async function reserveInventory(
    stockLedgerId: string
  ) {

    try {

      const response = await fetch(
        "/api/reservations",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            stockLedgerId,
            unitsRequested: 1,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {

        toast.error(data.message);

        return;
      }

      toast.success(
        "Inventory reserved successfully"
      );

     window.location.assign(
  `/checkout/${data.id}`
);

    } catch (error) {

      toast.error(
        "Reservation request failed"
      );
    }
  }

  useEffect(() => {
    loadCatalog();
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">

      <Toaster position="top-right" />

      <section className="mx-auto max-w-7xl px-6 py-12">

        <div className="mb-12">

          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-neutral-400">
            Distributed Inventory Engine
          </p>

          <h1 className="text-5xl font-black leading-tight">
            Real-Time Multi-Warehouse
            Reservation System
          </h1>

          <p className="mt-5 max-w-3xl text-lg text-neutral-400">
            Live reservation orchestration
            across fulfillment zones with
            temporary allocation handling,
            expiration management, and
            transactional inventory safety.
          </p>
        </div>

        {loading ? (

          <div className="text-neutral-400">
            Loading inventory...
          </div>

        ) : (

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">

            {catalog.map((item) => (

              <div
                key={item.id}
                className="rounded-3xl border border-neutral-800 bg-neutral-900 p-7 shadow-2xl"
              >

                <div className="mb-5 flex items-start justify-between">

                  <div>

                    <h2 className="text-2xl font-bold">
                      {item.title}
                    </h2>

                    <p className="mt-2 text-sm text-neutral-400">
                      {item.details}
                    </p>
                  </div>

                  <div className="rounded-full bg-emerald-500/15 px-4 py-1 text-xs font-semibold text-emerald-400">
                    LIVE
                  </div>
                </div>

                <div className="space-y-4">

                  {item.inventory.map((inventory) => (

                    <div
                      key={inventory.stockLedgerId}
                      className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"
                    >

                      <div className="mb-4 flex items-center justify-between">

                        <div>

                          <p className="font-semibold">
                            {
                              inventory
                                .fulfillmentCenter
                                .name
                            }
                          </p>

                          <p className="text-sm text-neutral-500">
                            {
                              inventory
                                .fulfillmentCenter
                                .region
                            }
                          </p>
                        </div>

                        <div className="text-right">

                          <p className="text-sm text-neutral-500">
                            Available
                          </p>

                          <p className="text-2xl font-black text-cyan-400">
                            {
                              inventory.availableUnits
                            }
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          reserveInventory(
                            inventory.stockLedgerId
                          )
                        }
                        disabled={
                          inventory.availableUnits <= 0
                        }
                        className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
                      >
                        {inventory.availableUnits > 0
                          ? "Reserve Inventory"
                          : "Out of Stock"}
                      </button>

                    </div>

                  ))}

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

    </main>
  );
}