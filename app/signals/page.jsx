"use client";

import { useState, useEffect } from "react";
import { fetchSignalHistory } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SignalsPage() {
  const [signals, setSignals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getHistoricalSignals = async () => {
      try {
        setIsLoading(true);
        const data = await fetchSignalHistory();
        setSignals(data);
      } catch (error) {
        console.error("Error fetching historical signals:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getHistoricalSignals();
  }, []);

  const getSignalColor = decision => {
    switch (decision) {
      case "BUY":
        return "text-green-600 dark:text-green-400";
      case "SELL":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-yellow-600 dark:text-yellow-400";
    }
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleString("tr-TR");
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Geçmiş Sinyaller</h1>

      <div className="bg-card rounded-lg shadow p-6">
        {isLoading ? (
          <div className="w-full animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-4"></div>
            <div className="space-y-2">
              {Array(10)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="h-10 bg-muted rounded"></div>
                ))}
            </div>
          </div>
        ) : (
          <Table>
            <TableCaption>Son 10 ticaret sinyali</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Karar</TableHead>
                <TableHead>Fiyat</TableHead>
                <TableHead>RSI</TableHead>
                <TableHead>MACD</TableHead>
                <TableHead>SMA 200</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {signals.map(signal => (
                <TableRow key={signal.id}>
                  <TableCell>{formatDate(signal.timestamp)}</TableCell>
                  <TableCell className={getSignalColor(signal.decision)}>
                    <span className="font-medium">{signal.decision}</span>
                  </TableCell>
                  <TableCell className="font-mono">
                    ${signal.price.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {signal.rsi ? signal.rsi.toFixed(1) : "N/A"}
                  </TableCell>
                  <TableCell>
                    {signal.macd ? signal.macd.toFixed(4) : "N/A"}
                  </TableCell>
                  <TableCell className="font-mono">
                    {signal.sma_200 ? signal.sma_200.toFixed(2) : "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Sinyal Açıklamaları</h2>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>
            <span className="text-green-600 font-medium">BUY</span> - Alım
            sinyali, fiyatın yükselmesi bekleniyor
          </li>
          <li>
            <span className="text-red-600 font-medium">SELL</span> - Satım
            sinyali, fiyatın düşmesi bekleniyor
          </li>
          <li>
            <span className="text-yellow-600 font-medium">WAIT</span> - Bekle
            sinyali, net bir trend yok
          </li>
        </ul>
      </div>
    </div>
  );
}
