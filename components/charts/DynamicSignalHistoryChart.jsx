"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const SignalHistoryChart = dynamic(() => import("./SignalHistoryChart"), {
  ssr: false,
  loading: () => (
    <div className="p-4">
      <Skeleton className="h-[400px] w-full" />
    </div>
  ),
});

export default SignalHistoryChart;
