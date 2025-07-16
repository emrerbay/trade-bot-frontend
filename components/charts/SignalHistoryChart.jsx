"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import { fetchBacktestSimulation } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

// Tooltip'i formatlamak için özel bileşen
const CustomTooltip = ({ active, payload, label, signalsMap }) => {
  if (active && payload && payload.length) {
    const signal = signalsMap.get(label);

    return (
      <div className="p-2 bg-background/80 backdrop-blur-sm border rounded-md shadow-lg">
        <p className="font-bold">{`Fiyat: $${payload[0].value.toFixed(2)}`}</p>
        <p className="text-sm text-muted-foreground">
          {new Date(label).toLocaleString("tr-TR", {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </p>
        {signal && (
          <div className="mt-2 pt-2 border-t border-muted">
            <p
              className="font-bold text-sm"
              style={{ color: signal.type === "BUY" ? "green" : "red" }}
            >
              {signal.type === "BUY" ? "ALIŞ SİNYALİ" : "SATIŞ SİNYALİ"}
            </p>
            <p className="text-xs">
              Güven: %{(signal.confidence * 100).toFixed(0)}
            </p>
          </div>
        )}
      </div>
    );
  }
  return null;
};

// Y ekseni etiketlerini formatlamak için fonksiyon
const formatYAxis = tickItem => `$${tickItem}`;

export default function SignalHistoryChart() {
  const [days, setDays] = useState(7);
  const [investment, setInvestment] = useState(10000);
  const [strategy, setStrategy] = useState("signals"); // 'signals' or 'buyAndHold'
  const [confidenceThreshold, setConfidenceThreshold] = useState(0); // Başlangıçta filtre yok
  const [simulationData, setSimulationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sinyalleri zaman damgasına göre hızlıca aramak için bir harita oluştur
  const signalsMap = useMemo(
    () =>
      new Map(
        (simulationData?.trades || []).map(s => [
          s.time,
          { ...s, confidence: s.confidence ?? 0 }, // confidence null ise 0 yap
        ])
      ),
    [simulationData?.trades]
  );

  // Sinyal noktalarını çizmek için özel bileşen
  const CustomDot = props => {
    const { cx, cy, payload } = props;
    const signal = signalsMap.get(payload.time);

    // Eğer bu veri noktası bir sinyal değilse, hiçbir şey çizme
    if (!signal) {
      return null;
    }

    // Sinyal varsa, bir daire çiz ve içine tarayıcı tooltip'i için başlık ekle
    return (
      <g>
        <title>{`Sinyal: ${signal.type}\nFiyat: $${signal.price.toFixed(
          2
        )}\nGüven: %${(signal.confidence * 100).toFixed(0)}`}</title>
        <circle
          cx={cx}
          cy={cy}
          r={5}
          fill={signal.type === "BUY" ? "green" : "red"}
          stroke="hsl(var(--background))"
          strokeWidth={2}
        />
      </g>
    );
  };

  useEffect(() => {
    const runSimulation = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // confidenceThreshold'u 0-1 aralığına çevir
        const threshold = confidenceThreshold / 100;
        const data = await fetchBacktestSimulation(
          days,
          investment,
          strategy,
          threshold
        );
        setSimulationData(data);
      } catch (e) {
        setError(e.message || "Simülasyon verisi yüklenirken bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      runSimulation();
    }, 500); // Kullanıcı kaydırmayı bitirdikten sonra 500ms bekle

    return () => clearTimeout(timer); // Cleanup
  }, [days, investment, strategy, confidenceThreshold]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="h-[400px] flex items-center justify-center bg-muted/50 rounded-lg animate-pulse">
          Yükleniyor...
        </div>
      );
    }
    if (error) {
      return (
        <div className="h-[400px] flex items-center justify-center text-destructive">
          {error}
        </div>
      );
    }
    if (
      !simulationData ||
      !simulationData.price_data ||
      simulationData.price_data.length === 0
    ) {
      return (
        <div className="h-[400px] flex items-center justify-center">
          Veri bulunamadı.
        </div>
      );
    }

    const {
      price_data,
      trades: signals, // `trades`'i `signals` olarak yeniden adlandır
      final_value,
      profit_loss_pct,
    } = simulationData;
    const profitColor =
      profit_loss_pct >= 0 ? "text-green-500" : "text-red-500";

    const resultText =
      strategy === "buyAndHold"
        ? `yatırımınız, hiç işlem yapmasaydınız şu an yaklaşık`
        : `yatırımınız, sinyaller takip edilseydi şu an yaklaşık`;

    return (
      <>
        <div className="mb-4 p-4 border rounded-lg bg-background">
          <h3 className="text-lg font-semibold text-center mb-2">
            Simülasyon Sonucu
          </h3>
          <p className="text-center text-muted-foreground">
            <span className="font-bold text-xl text-primary">
              ${investment.toLocaleString()}
            </span>{" "}
            {resultText}{" "}
            <span className={`font-bold text-xl ${profitColor}`}>
              ${final_value.toLocaleString()}
            </span>{" "}
            olurdu.
          </p>
          <p className={`text-center font-bold text-lg ${profitColor}`}>
            %{profit_loss_pct.toFixed(2)}
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={price_data}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
            <XAxis
              dataKey="time"
              tickFormatter={timeStr =>
                new Date(timeStr).toLocaleDateString("tr-TR")
              }
            />
            <YAxis
              tickFormatter={formatYAxis}
              domain={["dataMin", "dataMax"]}
            />
            <Tooltip content={<CustomTooltip signalsMap={signalsMap} />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              activeDot={{ r: 8 }}
              dot={false} // Normal noktaları kaldır
            />

            {/* Sinyalleri Tooltip ile birlikte çiz */}
            {signals &&
              strategy === "signals" &&
              [...signals]
                .sort((a, b) => new Date(a.time) - new Date(b.time))
                .map((signal, index) => (
                  <ReferenceDot
                    key={index}
                    x={signal.time}
                    y={signal.price}
                    r={5}
                    fill={signal.type === "BUY" ? "green" : "red"}
                    ifOverflow="extendDomain"
                  />
                ))}
          </LineChart>
        </ResponsiveContainer>
      </>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Geçmiş Performans Simülasyonu</CardTitle>
            <p className="text-sm text-muted-foreground">
              Botun sinyalleri geçmişte nasıl performans gösterirdi?
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="strategy-switch"
                checked={strategy === "buyAndHold"}
                onCheckedChange={checked =>
                  setStrategy(checked ? "buyAndHold" : "signals")
                }
              />
              <Label htmlFor="strategy-switch">Al ve Tut Modu</Label>
            </div>
            <div className="w-full md:w-auto">
              <Label htmlFor="investment-input" className="mb-2 block">
                Başlangıç Yatırımı ($)
              </Label>
              <Input
                id="investment-input"
                type="number"
                value={investment}
                onChange={e => setInvestment(Number(e.target.value))}
                className="w-full md:w-[150px]"
                min="1"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 items-center">
          <div className="w-full md:w-auto">
            <Label htmlFor="confidence-slider">
              Minimum Güven Skoru: %{confidenceThreshold}
            </Label>
            <Slider
              id="confidence-slider"
              min={0}
              max={100}
              step={5}
              value={[confidenceThreshold]}
              onValueChange={value => setConfidenceThreshold(value[0])}
              className="mt-2"
              disabled={strategy === "buyAndHold"}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          value={String(days)}
          onValueChange={value => setDays(Number(value))}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="3">3 Gün</TabsTrigger>
            <TabsTrigger value="7">7 Gün</TabsTrigger>
            <TabsTrigger value="14">14 Gün</TabsTrigger>
          </TabsList>
          <TabsContent value="3">{renderContent()}</TabsContent>
          <TabsContent value="7">{renderContent()}</TabsContent>
          <TabsContent value="14">{renderContent()}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
