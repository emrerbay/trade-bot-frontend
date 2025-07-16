"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchSignal } from "@/lib/api";

function getSignalColor(decision) {
  switch (decision) {
    case "BUY":
      return "bg-green-500 hover:bg-green-600";
    case "SELL":
      return "bg-red-500 hover:bg-red-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
}

export function SignalCard() {
  const [signal, setSignal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadSignal() {
      try {
        setLoading(true);
        const data = await fetchSignal();
        setSignal(data);
        setError(null);
      } catch (err) {
        console.error("Sinyal yüklenirken hata:", err);
        setError("Sinyal yüklenemedi");
      } finally {
        setLoading(false);
      }
    }

    loadSignal();
    const interval = setInterval(loadSignal, 60000); // Her 60 saniyede bir güncelle

    return () => clearInterval(interval);
  }, []);

  if (loading && !signal) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mevcut Sinyal</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    );
  }

  if (error && !signal) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mevcut Sinyal</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Hata: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!signal) {
    return null;
  }

  const confidenceScore = (signal.confidence * 100).toFixed(2);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mevcut Sinyal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start justify-between">
          {/* Sol Taraf: Karar ve Fiyat */}
          <div className="flex flex-col">
            <Badge
              className={`text-base w-min mb-2 text-white ${getSignalColor(
                signal.decision
              )}`}
            >
              {signal.decision || "N/A"}
            </Badge>
            <span className="text-3xl font-bold">
              ${signal.price?.toFixed(2) || "0.00"}
            </span>
          </div>
          {/* Sağ Taraf: Güven Skoru */}
          <div className="text-right">
            <p className="text-sm text-gray-400">Güven Skoru</p>
            <p className="text-2xl font-semibold">{confidenceScore}%</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          {new Date(signal.timestamp).toLocaleTimeString("tr-TR")}
        </p>
      </CardContent>
    </Card>
  );
}
