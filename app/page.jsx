"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SignalHistoryChart from "@/components/charts/DynamicSignalHistoryChart";
import { SignalCard } from "@/components/SignalCard";
import NewsSentimentChart from "@/components/NewsSentimentChart";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Gauge, Newspaper } from "lucide-react";
import { fetchSignal, fetchNews } from "@/lib/api";

// --- Dinamik Veri Kartları ---

function RsiCard({ data, isLoading }) {
  if (isLoading || !data?.latest_indicators) {
    return <Skeleton className="h-28 w-full" />;
  }
  const rsi = data.latest_indicators.rsi;
  const rsiStatus =
    rsi > 70 ? "Aşırı Alım" : rsi < 30 ? "Aşırı Satım" : "Normal";
  const rsiColor =
    rsi > 70 ? "text-red-500" : rsi < 30 ? "text-green-500" : "text-primary";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">RSI</CardTitle>
        <Gauge className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${rsiColor}`}>
          {rsi?.toFixed(2) ?? "N/A"}
        </div>
        <p className="text-xs text-muted-foreground">{rsiStatus}</p>
      </CardContent>
    </Card>
  );
}

function MacdCard({ data, isLoading }) {
  if (isLoading || !data?.latest_indicators) {
    return <Skeleton className="h-28 w-full" />;
  }

  const { macd, macd_signal } = data.latest_indicators;
  const status = macd > macd_signal ? "Yükseliş" : "Düşüş";
  const color = macd > macd_signal ? "text-green-500" : "text-red-500";
  const Icon = macd > macd_signal ? TrendingUp : TrendingDown;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">MACD Trend</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{status}</div>
        <p className="text-xs text-muted-foreground">Kısa Vadeli Yön</p>
      </CardContent>
    </Card>
  );
}

function NewsCard({ data, isLoading }) {
  if (isLoading || !data?.sentiment) {
    return <Skeleton className="h-28 w-full" />;
  }

  const { bullish, bearish, neutral } = data.sentiment;
  const total = bullish + bearish + neutral;
  const dominantVal = Math.max(bullish, bearish, neutral);

  let status, color;
  if (dominantVal === bullish) {
    status = "Olumlu";
    color = "text-green-500";
  } else if (dominantVal === bearish) {
    status = "Olumsuz";
    color = "text-red-500";
  } else {
    status = "Nötr";
    color = "text-primary";
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Haber Duyarlılığı</CardTitle>
        <Newspaper className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{status}</div>
        <p className="text-xs text-muted-foreground">
          {total} haber analiz edildi
        </p>
      </CardContent>
    </Card>
  );
}

// --- Ana Dashboard Bileşeni ---

export default function Home() {
  const [signalData, setSignalData] = useState(null);
  const [newsData, setNewsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        if (lastUpdated === null) setIsLoading(true);

        const [signalData, newsData] = await Promise.all([
          fetchSignal(),
          fetchNews(),
        ]);

        setSignalData(signalData);
        setNewsData(newsData);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Dashboard verisi çekilirken hata:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
    const interval = setInterval(fetchAllData, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          NVDA TradeBot Dashboard
        </h2>
        <div className="text-sm text-muted-foreground">
          {isLoading && !lastUpdated ? (
            <Skeleton className="h-5 w-32" />
          ) : (
            `Son Güncelleme: ${lastUpdated?.toLocaleTimeString("tr-TR")}`
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SignalCard />
        <RsiCard data={signalData} isLoading={isLoading} />
        <MacdCard data={signalData} isLoading={isLoading} />
        <NewsCard data={newsData} isLoading={isLoading} />
      </div>

      <div className="flex flex-col gap-4">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Geçmiş Performans Simülasyonu</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <SignalHistoryChart />
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Haber Duyarlılık Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <NewsSentimentChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
