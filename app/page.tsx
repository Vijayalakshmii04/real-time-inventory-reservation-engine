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

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/catalog");
        const data = await response.json();
        setCatalog(data);
      } catch {
        toast.error("Unable to load inventory");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function reserveInventory(stockLedgerId: string) {
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stockLedgerId,
          unitsRequested: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Inventory reserved successfully");
      window.location.assign(`/checkout/${data.id}`);
    } catch {
      toast.error("Reservation request failed");
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <Toaster position="top-right" />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-12">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-neutral-400">
            Distributed Inventory Engine
          </p>

          <h1 className="text-5xl font-black leading-tight">
            Real-Time Multi-Warehouse Reservation System
          </h1>
        </div>

        {loading ? (
          <div className="text-neutral-400">Loading inventory...</div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {catalog.map((item) => (
              <div key={item.id} className="rounded-3xl border p-6">
                <h2 className="text-2xl font-bold">{item.title}</h2>
                <p className="text-sm text-neutral-400">{item.details}</p>

                {item.inventory.map((inv) => (
                  <div key={inv.stockLedgerId} className="mt-4 border p-4">
                    <p>{inv.fulfillmentCenter.name}</p>
                    <p>{inv.availableUnits} available</p>

                    <button
                      onClick={() => reserveInventory(inv.stockLedgerId)}
                      disabled={inv.availableUnits <= 0}
                    >
                      Reserve
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}