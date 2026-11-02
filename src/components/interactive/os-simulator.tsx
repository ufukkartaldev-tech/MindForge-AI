"use client";

import React, { useState } from "react";
import { Cpu, Play, Plus, Trash2, Clock, CheckCircle2 } from "lucide-react";

interface Process {
  id: string;
  name: string;
  burstTime: number;
  arrivalTime: number;
  color: string;
}

const DEFAULT_PROCESSES: Process[] = [
  { id: "p1", name: "P1 (Tarayıcı)", burstTime: 5, arrivalTime: 0, color: "bg-blue-500" },
  { id: "p2", name: "P2 (Derleyici)", burstTime: 3, arrivalTime: 1, color: "bg-emerald-500" },
  { id: "p3", name: "P3 (Müzik Çalar)", burstTime: 8, arrivalTime: 2, color: "bg-purple-500" },
  { id: "p4", name: "P4 (Arka Plan Servis)", burstTime: 4, arrivalTime: 3, color: "bg-amber-500" },
];

export function OSSimulator() {
  const [processes, setProcesses] = useState<Process[]>(DEFAULT_PROCESSES);
  const [algorithm, setAlgorithm] = useState<"FCFS" | "SJF" | "RR">("FCFS");
  const [quantum, setQuantum] = useState(2);
  const [newPName, setNewPName] = useState("");
  const [newPBurst, setNewPBurst] = useState(4);

  // Compute Gantt Chart based on algorithm
  interface GanttBlock {
    processName: string;
    startTime: number;
    endTime: number;
    color: string;
  }

  const computeSchedule = (): {
    blocks: GanttBlock[];
    avgWait: number;
    avgTurnaround: number;
  } => {
    let blocks: GanttBlock[] = [];
    let currentTime = 0;
    let waitTimes: Record<string, number> = {};
    let turnaroundTimes: Record<string, number> = {};

    if (algorithm === "FCFS") {
      // First-Come, First-Served sorted by arrivalTime
      const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
      for (const p of sorted) {
        if (currentTime < p.arrivalTime) {
          currentTime = p.arrivalTime;
        }
        const start = currentTime;
        currentTime += p.burstTime;
        blocks.push({
          processName: p.name.split(" ")[0],
          startTime: start,
          endTime: currentTime,
          color: p.color
        });
        turnaroundTimes[p.id] = currentTime - p.arrivalTime;
        waitTimes[p.id] = start - p.arrivalTime;
      }
    } else if (algorithm === "SJF") {
      // Shortest Job First (Non-preemptive)
      let remaining = [...processes];
      while (remaining.length > 0) {
        // available processes at currentTime
        let available = remaining.filter(p => p.arrivalTime <= currentTime);
        if (available.length === 0) {
          currentTime = Math.min(...remaining.map(p => p.arrivalTime));
          available = remaining.filter(p => p.arrivalTime <= currentTime);
        }
        available.sort((a, b) => a.burstTime - b.burstTime);
        const p = available[0];
        remaining = remaining.filter(item => item.id !== p.id);

        const start = currentTime;
        currentTime += p.burstTime;
        blocks.push({
          processName: p.name.split(" ")[0],
          startTime: start,
          endTime: currentTime,
          color: p.color
        });
        turnaroundTimes[p.id] = currentTime - p.arrivalTime;
        waitTimes[p.id] = start - p.arrivalTime;
      }
    } else if (algorithm === "RR") {
      // Round Robin
      let remaining = processes.map(p => ({ ...p, remainingBurst: p.burstTime }));
      let queue: typeof remaining = [];
      let time = 0;
      let completed = 0;

      // add arrivals at time 0
      queue.push(...remaining.filter(p => p.arrivalTime <= time));
      let visited = new Set(queue.map(p => p.id));

      while (completed < processes.length && time < 100) {
        if (queue.length === 0) {
          const nextArrivals = remaining.filter(p => p.remainingBurst > 0 && !visited.has(p.id));
          if (nextArrivals.length > 0) {
            nextArrivals.sort((a, b) => a.arrivalTime - b.arrivalTime);
            time = nextArrivals[0].arrivalTime;
            queue.push(nextArrivals[0]);
            visited.add(nextArrivals[0].id);
          } else {
            break;
          }
        }

        const curr = queue.shift()!;
        const execTime = Math.min(curr.remainingBurst, quantum);
        const start = time;
        time += execTime;
        curr.remainingBurst -= execTime;

        blocks.push({
          processName: curr.name.split(" ")[0],
          startTime: start,
          endTime: time,
          color: curr.color
        });

        // check newly arrived processes during this time
        for (const p of remaining) {
          if (p.arrivalTime <= time && p.remainingBurst > 0 && !visited.has(p.id)) {
            queue.push(p);
            visited.add(p.id);
          }
        }

        if (curr.remainingBurst > 0) {
          queue.push(curr);
        } else {
          completed++;
          turnaroundTimes[curr.id] = time - curr.arrivalTime;
          waitTimes[curr.id] = turnaroundTimes[curr.id] - curr.burstTime;
        }
      }
    }

    const n = processes.length || 1;
    const avgWait = Object.values(waitTimes).reduce((a, b) => a + b, 0) / n;
    const avgTurnaround = Object.values(turnaroundTimes).reduce((a, b) => a + b, 0) / n;

    return { blocks, avgWait, avgTurnaround };
  };

  const { blocks, avgWait, avgTurnaround } = computeSchedule();

  const addProcess = () => {
    if (!newPName) return;
    const colors = ["bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-teal-500"];
    const newP: Process = {
      id: `p-${Date.now()}`,
      name: newPName,
      burstTime: Number(newPBurst),
      arrivalTime: 0,
      color: colors[processes.length % colors.length]
    };
    setProcesses([...processes, newP]);
    setNewPName("");
  };

  const removeProcess = (id: string) => {
    setProcesses(processes.filter(p => p.id !== id));
  };

  return (
    <div className="rounded-xl border border-border bg-card/60 backdrop-blur overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">
            İşletim Sistemleri: CPU Çizelgeleme Simülatörü
          </span>
        </div>
        <div className="flex gap-1">
          {(["FCFS", "SJF", "RR"] as const).map(alg => (
            <button
              key={alg}
              onClick={() => setAlgorithm(alg)}
              className={`text-[11px] font-medium px-2.5 py-1 rounded transition-colors ${
                algorithm === alg
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {alg}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* RR Quantum Option */}
        {algorithm === "RR" && (
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-xs">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            <span>Zaman Kuantumu (Time Quantum): <strong>{quantum} birim</strong></span>
            <input
              type="range"
              min="1"
              max="6"
              value={quantum}
              onChange={e => setQuantum(Number(e.target.value))}
              className="accent-primary h-1.5 bg-secondary rounded flex-1 max-w-[140px] cursor-pointer"
            />
          </div>
        )}

        {/* Process Table & Add */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-xs font-medium text-foreground block">
              Aktif Süreçler ({processes.length})
            </span>
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {processes.map(p => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-background border border-border text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${p.color}`} />
                    <span className="font-medium text-foreground">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground font-mono">
                      Patlama: <strong>{p.burstTime}ms</strong>
                    </span>
                    <button
                      onClick={() => removeProcess(p.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add process form */}
          <div className="p-3 rounded-lg border border-border bg-muted/20 flex flex-col justify-between">
            <span className="text-xs font-medium text-foreground block mb-2">
              Yeni Süreç Ekle
            </span>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Örn: P5 (Veritabanı)"
                value={newPName}
                onChange={e => setNewPName(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-md border border-input bg-background"
              />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Burst (ms): {newPBurst}</span>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={newPBurst}
                  onChange={e => setNewPBurst(Number(e.target.value))}
                  className="accent-primary h-1.5 bg-secondary rounded w-28 cursor-pointer"
                />
              </div>
            </div>
            <button
              onClick={addProcess}
              className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 py-1.5 rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Süreci Ekle
            </button>
          </div>
        </div>

        {/* Gantt Chart */}
        <div>
          <div className="flex items-center justify-between text-xs font-medium text-foreground mb-2">
            <span>Çizelgeleme Gantt Şeması ({algorithm}):</span>
            <span className="text-muted-foreground font-mono text-[11px]">
              Toplam Süre: {blocks.length > 0 ? blocks[blocks.length - 1].endTime : 0}ms
            </span>
          </div>

          <div className="w-full overflow-x-auto pb-2">
            <div className="flex items-center min-w-[340px] border border-border rounded-lg overflow-hidden bg-zinc-950 p-1 gap-1">
              {blocks.map((block, idx) => {
                const duration = block.endTime - block.startTime;
                return (
                  <div
                    key={idx}
                    style={{ flexGrow: duration }}
                    className={`${block.color} text-white font-mono text-[11px] font-bold py-2 px-1 text-center rounded flex flex-col justify-between items-center transition-all shadow-sm`}
                  >
                    <span>{block.processName}</span>
                    <span className="text-[9px] opacity-80">{block.startTime}-{block.endTime}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
          <div className="p-2.5 rounded-lg bg-background border border-border text-center">
            <span className="text-[11px] text-muted-foreground block">Ortalama Bekleme Süresi (Waiting Time)</span>
            <span className="text-base font-bold font-mono text-primary">{avgWait.toFixed(2)} ms</span>
          </div>
          <div className="p-2.5 rounded-lg bg-background border border-border text-center">
            <span className="text-[11px] text-muted-foreground block">Ortalama Geri Dönüş Süresi (Turnaround)</span>
            <span className="text-base font-bold font-mono text-emerald-500">{avgTurnaround.toFixed(2)} ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}
