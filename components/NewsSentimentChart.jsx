"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { fetchNews } from "@/lib/api";

// Chart.js bileşenlerini kaydet
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function NewsSentimentChart() {
  const [sentiment, setSentiment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadNewsSentiment() {
      try {
        setIsLoading(true);
        const data = await fetchNews();
        setSentiment(data);
      } catch (error) {
        console.error("Haber duyarlılığı hatası:", error);
        setSentiment(null); // Hata durumunda veriyi temizle
      } finally {
        setIsLoading(false);
      }
    }

    loadNewsSentiment();
    const interval = setInterval(loadNewsSentiment, 5 * 60 * 1000); // 5 dakikada bir güncelle
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <Skeleton className="h-80 w-full" />;
  }

  if (!sentiment || !sentiment.sentiment) {
    return (
      <Card className="w-full h-80">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Haber Duyarlılık Analizi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Veri yüklenirken bir hata oluştu.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = dateString => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("tr-TR");
  };

  const data = {
    labels: ["Olumlu", "Olumsuz", "Nötr"],
    datasets: [
      {
        label: "Haber Sayısı",
        data: [
          sentiment.sentiment.bullish,
          sentiment.sentiment.bearish,
          sentiment.sentiment.neutral,
        ],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 206, 86, 0.6)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow h-[200px]">
        <Bar data={data} options={options} />
      </div>
      <div className="text-xs text-center text-muted-foreground mt-2">
        Son güncelleme: {formatDate(sentiment.timestamp)}
      </div>
    </div>
  );
}
