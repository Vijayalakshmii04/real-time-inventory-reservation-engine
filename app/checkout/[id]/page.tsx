"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

type ReservationData = {
  id: string;
  state: string;
  expiresAt: string;
  unitsReserved: number;

  stockLedger: {
    catalogItem: {
      title: string;
      details: string;
    };

    fulfillment: {
      name: string;
      region: string;
    };
  };
};

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();

  const reservationId = params.id as string;

  const [reservation, setReservation] =
    useState<ReservationData | null>(null);

  const [remainingSeconds, setRemainingSeconds] =
    useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reservationId) return;

    (async () => {
      try {
        const response = await fetch(
          `/api/reservations/${reservationId}`
        );

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.message);
          return;
        }

        setReservation(data);

        const expiry =
          new Date(data.expiresAt).getTime();

        const now = Date.now();

        setRemainingSeconds(
          Math.max(
            Math.floor((expiry - now) / 1000),
            0
          )
        );
      } catch {
        toast.error("Unable to load reservation");
      } finally {
        setLoading(false);
      }
    })();
  }, [reservationId]);

  useEffect(() => {
    if (!reservation || reservation.state !== "ACTIVE") return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) =>
        prev > 0 ? prev - 1 : 0
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [reservation?.state]);

  async function confirmReservation() {
    try {
      const response = await fetch(
        `/api/reservations/${reservationId}/confirm`,
        { method: "POST" }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Purchase confirmed");
      router.push("/");
    } catch {
      toast.error("Confirmation failed");
    }
  }

  async function releaseReservation() {
    try {
      const response = await fetch(
        `/api/reservations/${reservationId}/release`,
        { method: "POST" }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Reservation cancelled");
      router.push("/");
    } catch {
      toast.error("Cancellation failed");
    }
  }

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
      <Toaster position="top-right" />

      {loading ? (
        <p>Loading...</p>
      ) : reservation ? (
        <div className="p-8 border rounded-xl">
          <h1>{reservation.stockLedger.catalogItem.title}</h1>

          <p>{reservation.state}</p>

          <h2>
            {reservation.state === "ACTIVE"
              ? `${String(minutes).padStart(2, "0")}:${String(
                  seconds
                ).padStart(2, "0")}`
              : reservation.state}
          </h2>

          <button onClick={confirmReservation}>
            Confirm
          </button>

          <button onClick={releaseReservation}>
            Cancel
          </button>
        </div>
      ) : (
        <p>Reservation not found</p>
      )}
    </main>
  );
}