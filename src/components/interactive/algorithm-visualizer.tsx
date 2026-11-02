"use client";

import React, { useState, useEffect } from "react";
import { GitBranch, Play, Pause, RotateCcw, ChevronRight, Activity } from "lucide-react";

export function AlgorithmVisualizer() {
  const initialArray = [45, 12, 85, 32, 89, 39, 69, 22];
  const [array, setArray] = useState<number[]>([...initialArray]);
  const [mode, setMode] = useState<"bubble" | "binary">("bubble");
  const [comparingIndices, setComparingIndices] = useState<number[]>([]);
  const [sortedIndices, setSortedIndices] = useState<number[]>([]);
  const [targetSearch, setTargetSearch] = useState<number>(39);
  const [binaryPointers, setBinaryPointers] = useState<{ low: number; mid: number; high: number } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [stepMessage, setStepMessage] = useState<string>("Algoritmayı çalıştırmak veya adım adım ilerletmek için butonları kullanın.");
  const [comparisons, setComparisons] = useState(0);

  const reset = () => {
    setIsRunning(false);
    setArray([...initialArray]);
    setComparingIndices([]);
    setSortedIndices([]);
    setBinaryPointers(null);
    setComparisons(0);
    setStepMessage("Dizi başlangıç durumuna sıfırlandı.");
  };

  // Step-by-step bubble sort
  const stepBubbleSort = () => {
    let arr = [...array];
    let n = arr.length;
    let swapped = false;

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (!sortedIndices.includes(j + 1) && (!comparingIndices.length || comparingIndices[0] !== j)) {
          setComparingIndices([j, j + 1]);
          setComparisons(c => c + 1);
          if (arr[j] > arr[j + 1]) {
            let temp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;
            setArray([...arr]);
            setStepMessage(`${arr[j + 1]} > ${arr[j]} olduğu için yer değiştirdi (Swap).`);
            return;
          } else {
            setStepMessage(`${arr[j]} <= ${arr[j + 1]}, yer değiştirmeye gerek yok.`);
            return;
          }
        }
      }
    }

    setComparingIndices([]);
    setSortedIndices(array.map((_, i) => i));
    setStepMessage("🎉 Bubble sort tamamlandı! Dizi tamamen sıralı.");
    setIsRunning(false);
  };

  // Step-by-step Binary search on sorted array
  const stepBinarySearch = () => {
    const sorted = [...array].sort((a, b) => a - b);
    if (JSON.stringify(sorted) !== JSON.stringify(array)) {
      setArray(sorted);
      setStepMessage("Binary Search için dizi önce sıralandı.");
      return;
    }

    let low = binaryPointers ? binaryPointers.low : 0;
    let high = binaryPointers ? binaryPointers.high : array.length - 1;

    if (low <= high) {
      const mid = Math.floor((low + high) / 2);
      setBinaryPointers({ low, mid, high });
      setComparisons(c => c + 1);

      if (array[mid] === targetSearch) {
        setComparingIndices([mid]);
        setSortedIndices([mid]);
        setStepMessage(`🎯 Hedef (${targetSearch}) indeks ${mid}'de bulundu!`);
        setIsRunning(false);
        return;
      }

      if (array[mid] < targetSearch) {
        setStepMessage(`${array[mid]} < ${targetSearch}: Sol yarı elendi, sağa bakılıyor.`);
        setBinaryPointers({ low: mid + 1, mid, high });
      } else {
        setStepMessage(`${array[mid]} > ${targetSearch}: Sağ yarı elendi, sola bakılıyor.`);
        setBinaryPointers({ low, mid, high: mid - 1 });
      }
    } else {
      setStepMessage(`❌ Hedef (${targetSearch}) dizide bulunamadı.`);
      setIsRunning(false);
    }
  };

  const handleStep = () => {
    if (mode === "bubble") {
      stepBubbleSort();
    } else {
      stepBinarySearch();
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card/60 backdrop-blur overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">
            İnteraktif Algoritma & Karmaşıklık Laboratuvarı
          </span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => { setMode("bubble"); reset(); }}
            className={`text-xs font-medium px-2.5 py-1 rounded transition-colors ${
              mode === "bubble" ? "bg-primary text-primary-foreground font-semibold" : "bg-muted text-muted-foreground"
            }`}
          >
            Bubble Sort
          </button>
          <button
            onClick={() => { setMode("binary"); reset(); }}
            className={`text-xs font-medium px-2.5 py-1 rounded transition-colors ${
              mode === "binary" ? "bg-primary text-primary-foreground font-semibold" : "bg-muted text-muted-foreground"
            }`}
          >
            Binary Search
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-background border border-border">
          <div className="flex items-center gap-2">
            <button
              onClick={handleStep}
              className="flex items-center gap-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" /> Tek Adım İlerle
            </button>
            <button
              onClick={reset}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-md border border-border"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Sıfırla
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-muted-foreground">
              Karşılaştırma Sayısı: <strong className="text-foreground">{comparisons}</strong>
            </span>
            <span className="text-muted-foreground">
              Zaman Karmaşıklığı:{" "}
              <strong className="text-primary font-bold">
                {mode === "bubble" ? "O(n²)" : "O(log n)"}
              </strong>
            </span>
          </div>
        </div>

        {/* Bar Visualizer */}
        <div className="h-44 p-4 rounded-lg bg-zinc-950 flex items-end justify-center gap-2 border border-border">
          {array.map((val, idx) => {
            const isComparing = comparingIndices.includes(idx);
            const isSorted = sortedIndices.includes(idx);
            const isMid = binaryPointers?.mid === idx;
            const isRange =
              binaryPointers && idx >= binaryPointers.low && idx <= binaryPointers.high;

            let color = "bg-blue-600";
            if (isComparing || isMid) color = "bg-amber-400";
            if (isSorted) color = "bg-emerald-500";
            if (mode === "binary" && !isRange && binaryPointers) color = "bg-zinc-800 opacity-40";

            return (
              <div key={idx} className="flex-1 max-w-[42px] flex flex-col items-center gap-1.5 transition-all">
                <span className="text-[10px] font-mono text-zinc-300 font-semibold">{val}</span>
                <div
                  style={{ height: `${val * 1.3}px` }}
                  className={`w-full rounded-t-sm transition-all duration-300 ${color}`}
                />
                <span className="text-[9px] font-mono text-zinc-500">[{idx}]</span>
              </div>
            );
          })}
        </div>

        {/* Step Explanation Banner */}
        <div className="p-3 rounded-lg bg-muted/40 border border-border flex items-start gap-2.5 text-xs">
          <Activity className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-foreground block mb-0.5">Adım Durumu:</span>
            <p className="text-muted-foreground">{stepMessage}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
