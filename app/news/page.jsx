"use client";

import { useState, useEffect } from "react";
import { fetchNews } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Basit bir kelime tabanlı duyarlılık analizi
const analyzeSentiment = headline => {
  const lowercased = headline.toLowerCase();
  if (
    /\b(soars|beats|surges|strong|rally|rise|upgraded|bullish|breakthrough)\b/.test(
      lowercased
    )
  ) {
    return "bullish";
  }
  if (
    /\b(falls|misses|weak|drop|loss|downgrade|bearish|slumps|tumbles|concern)\b/.test(
      lowercased
    )
  ) {
    return "bearish";
  }
  return "neutral";
};

export default async function NewsPage() {
  const newsData = await fetchNews();

  // Veri gelmezse veya 'articles' dizisi boşsa hata mesajı göster
  if (!newsData || !newsData.articles || newsData.articles.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <h1 className="text-3xl font-bold mb-4">Haberler</h1>
        <p>Haberler yüklenemedi veya mevcut değil.</p>
      </div>
    );
  }

  // Haberleri tarihe göre en yeniden en eskiye sırala
  const sortedArticles = newsData.articles.sort(
    (a, b) => new Date(b.published) - new Date(a.published)
  );

  const sentimentCounts = newsData.sentiment;
  const dominantSentiment = Object.keys(sentimentCounts).reduce((a, b) =>
    sentimentCounts[a] > sentimentCounts[b] ? a : b
  );

  const sentimentText =
    dominantSentiment === "bullish"
      ? "Olumlu"
      : dominantSentiment === "bearish"
      ? "Olumsuz"
      : "Nötr";

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Piyasa Haberleri</h1>
          <p className="text-muted-foreground">
            NVDA ile ilgili en son haberler ve duyarlılık analizi.
          </p>
        </div>
        <Card className="w-full md:w-auto">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Genel Duyarlılık
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <Badge
                variant={
                  dominantSentiment === "bullish"
                    ? "default"
                    : dominantSentiment === "bearish"
                    ? "destructive"
                    : "secondary"
                }
              >
                {sentimentText}
              </Badge>
              <div className="flex space-x-2 text-sm">
                <span className="text-green-500">
                  +{sentimentCounts.bullish}
                </span>
                <span className="text-red-500">-{sentimentCounts.bearish}</span>
                <span className="text-blue-500">
                  ={sentimentCounts.neutral}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedArticles.map((article, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-base">{article.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {new Date(article.published).toLocaleString("tr-TR", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
