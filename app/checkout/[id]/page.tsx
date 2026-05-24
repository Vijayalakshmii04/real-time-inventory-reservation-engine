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

  async function loadReservation() {
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

      const expiryTime = new Date(
        data.expiresAt
      ).getTime();

      const now = Date.now();

      const secondsLeft = Math.max(
        Math.floor((expiryTime - now) / 1000),
        0
      );

      setRemainingSeconds(secondsLeft);
    } catch (error) {
      toast.error("Unable to load reservation");
    } finally {
      setLoading(false);
    }
  }

  async function confirmReservation() {
    try {
      const response = await fetch(
        `/api/reservations/${reservationId}/confirm`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message);
        await loadReservation();
        return;
      }

      toast.success("Purchase confirmed successfully");
      await loadReservation();
    } catch (error) {
      toast.error("Confirmation request failed");
    }
  }

  async function releaseReservation() {
    try {
      const response = await fetch(
        `/api/reservations/${reservationId}/release`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Reservation cancelled");
      router.push("/");
    } catch (error) {
      toast.error("Cancellation failed");
    }
  }

  /* ✅ FIXED: safer initialization effect */
  useEffect(() => {
    if (!reservationId) return;

    const init = async () => {
      await loadReservation();
    };

    init();
  }, [reservationId]);

  /* ✅ FIXED: stable countdown timer */
  useEffect(() => {
    if (!reservation || reservation.state !== "ACTIVE") return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) =>
        prev > 0 ? prev - 1 : 0
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [reservation?.state]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
      <Toaster position="top-right" />

      {loading ? (
        <div className="text-neutral-400">
          Loading reservation...
        </div>
      ) : reservation ? (
        <div className="w-full max-w-2xl rounded-3xl border border-neutral-800 bg-neutral-900 p-10 shadow-2xl">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <p className="mb-3 text-sm uppercase tracking-[0.3em] text-neutral-500">
                Reservation Session
              </p>

              <h1 className="text-4xl font-black">
                {reservation.stockLedger.catalogItem.title}
              </h1>

              <p className="mt-3 text-neutral-400">
                {reservation.stockLedger.catalogItem.details}
              </p>
            </div>

            <div className="rounded-full bg-cyan-500/15 px-5 py-2 text-sm font-semibold text-cyan-400">
              {reservation.state}
            </div>
          </div>

          <div className="mb-8 rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-neutral-400">
                Fulfillment Center
              </span>
              <span className="font-semibold">
                {reservation.stockLedger.fulfillment.name}
              </span>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <span className="text-neutral-400">
                Region
              </span>
              <span className="font-semibold">
                {reservation.stockLedger.fulfillment.region}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-400">
                Reserved Units
              </span>
              <span className="font-semibold">
                {reservation.unitsReserved}
              </span>
            </div>
          </div>

          <div className="mb-8 text-center">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-neutral-500">
              Reservation Expires In
            </p>

            <div className="text-6xl font-black text-cyan-400">
              {reservation.state === "ACTIVE"
                ? `${String(minutes).padStart(2, "0")}:${String(
                    seconds
                  ).padStart(2, "0")}`
                : reservation.state}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <button
              onClick={confirmReservation}
              disabled={reservation.state !== "ACTIVE"}
              className="rounded-2xl bg-emerald-500 px-6 py-4 font-bold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
            >
              Confirm Purchase
            </button>

            <button
              onClick={releaseReservation}
              disabled={reservation.state !== "ACTIVE"}
              className="rounded-2xl border border-red-500 bg-red-500/10 px-6 py-4 font-bold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:border-neutral-700 disabled:text-neutral-500"
            >
              Cancel Reservation
            </button>
          </div>
        </div>
      ) : (
        <div className="text-neutral-400">
          Reservation not found
        </div>
      )}
    </main>
  );
}