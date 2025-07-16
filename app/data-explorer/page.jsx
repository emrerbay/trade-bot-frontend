"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DataExplorerPage() {
  const [date, setDate] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });
  const [interval, setInterval] = useState("15m");
  const [previewData, setPreviewData] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [downloadId, setDownloadId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFetchData = async () => {
    if (!date?.from || !date?.to) {
      setError("Lütfen başlangıç ve bitiş tarihi seçin.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setPreviewData([]);
    setMetadata(null);
    setDownloadId(null);

    const startDate = format(date.from, "yyyy-MM-dd");
    const endDate = format(date.to, "yyyy-MM-dd");

    try {
      const response = await fetch(
        `/api/historical-data/preview?start_date=${startDate}&end_date=${endDate}&interval=${interval}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Veri çekilirken bir hata oluştu.");
      }

      const result = await response.json();
      setMetadata(result.metadata);
      setPreviewData(result.preview_data);
      setDownloadId(result.download_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Veri Gezgini</CardTitle>
          <CardDescription>
            LSTM model eğitimi için normalize edilmiş geçmiş NVDA verilerini
            alın.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Tarih Seçici */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Tarih aralığı seçin</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            {/* Interval Seçici */}
            <select
              value={interval}
              onChange={e => setInterval(e.target.value)}
              className="w-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="1m">1 Dakika</option>
              <option value="5m">5 Dakika</option>
              <option value="15m">15 Dakika</option>
            </select>

            {/* Butonlar */}
            <Button onClick={handleFetchData} disabled={isLoading}>
              {isLoading ? "Yükleniyor..." : "Veri Getir"}
            </Button>
            <Button
              variant="secondary"
              disabled={!downloadId || isLoading}
              asChild
            >
              <a href={`/api/historical-data/download/${downloadId}`} download>
                CSV İndir
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sonuçlar Bölümü */}
      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Hata</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {metadata && (
        <Card>
          <CardHeader>
            <CardTitle>Veri Özeti ve Önizleme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
              <span>Toplam Satır: {metadata.total_rows}</span>
              <span>Aralık: {metadata.interval}</span>
              <span>
                Tarih Aralığı: {metadata.start_date} → {metadata.end_date}
              </span>
            </div>
            <div
              className="overflow-auto rounded-lg border"
              style={{ maxHeight: "500px" }}
            >
              <Table>
                <TableHeader className="sticky top-0 bg-muted">
                  <TableRow>
                    {metadata.columns.map(col => (
                      <TableHead key={col}>{col}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row, index) => (
                    <TableRow key={index}>
                      {metadata.columns.map(col => (
                        <TableCell key={col} className="font-mono text-xs">
                          {typeof row[col] === "number"
                            ? row[col].toFixed(6)
                            : row[col]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
