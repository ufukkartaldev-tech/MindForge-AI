"use client";

import React, { useState } from "react";
import { Calculator, ChevronRight, Sliders, CheckCircle2 } from "lucide-react";
import katex from "katex";

export function MathVisualizer() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(-4);
  const [activeStep, setActiveStep] = useState(0);

  // Quadratic equation: f(x) = a*x^2 + b*x + c, let's explore vertex & roots
  // or linear / derivative example: f(x) = a*x^2, f'(x) = 2*a*x
  const derivativeAt2 = 2 * a * 2; // at x = 2

  const steps = [
    {
      title: "1. Denklem Tanımı",
      formula: `f(x) = ${a}x^2 + (${b})x`,
      detail: `Burada parametreleri (a=${a}, b=${b}) yukarıdaki sürgülerle anlık değiştirebilirsin.`
    },
    {
      title: "2. Birinci Mertebeden Türev Alma",
      formula: `f'(x) = \\frac{d}{dx}(${a}x^2 + ${b}x) = 2 \\cdot ${a}x + (${b}) = ${2 * a}x + (${b})`,
      detail: "Kuvvet kuralı: d/dx(x^n) = n*x^(n-1). Üs başa katsayı iner, üs 1 azalır."
    },
    {
      title: "3. Ekstremum (Tepe Noktası) Tespiti",
      formula: `f'(x) = 0 \\implies ${2 * a}x + (${b}) = 0 \\implies x_{tepe} = \\frac{${-b}}{${2 * a}} = ${(-b / (2 * a)).toFixed(2)}`,
      detail: "Türevin sıfır olduğu nokta fonksiyonun teğetinin yatay olduğu yerel minimum veya maksimum noktasıdır."
    }
  ];

  const renderLatex = (latex: string) => {
    try {
      return { __html: katex.renderToString(latex, { throwOnError: false }) };
    } catch (e) {
      return { __html: latex };
    }
  };

  // Generate SVG curve points for x from -5 to +5
  const points: [number, number][] = [];
  for (let x = -4; x <= 4; x += 0.5) {
    const y = a * x * x + b * x;
    points.push([x, y]);
  }

  // Normalize points for 280x160 SVG canvas
  // X range: -4 to 4 -> 20 to 260
  // Y range: -20 to 30 -> 140 to 20
  const svgPoints = points
    .map(([x, y]) => {
      const svgX = 140 + x * 28;
      const svgY = 90 - y * 3;
      return `${svgX},${Math.min(150, Math.max(10, svgY))}`;
    })
    .join(" ");

  return (
    <div className="rounded-xl border border-border bg-card/60 backdrop-blur overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">
            İnteraktif Matematik & Türev Laboratuvarı
          </span>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground">
          Adım Adım Çözümleyici
        </span>
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls & Graph */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-3.5 rounded-lg border border-border bg-background space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-primary" /> Parametreleri Değiştir:
              </span>
              <span className="text-xs font-mono text-primary font-semibold">
                f(x) = {a}x² + ({b})x
              </span>
            </div>

            {/* Slider A */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Katsayı (a):</span>
                <span className="font-mono text-foreground font-semibold">{a}</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={a}
                onChange={(e) => setA(Number(e.target.value))}
                className="w-full accent-primary h-1.5 bg-secondary rounded-lg cursor-pointer"
              />
            </div>

            {/* Slider B */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Eğim Katsayısı (b):</span>
                <span className="font-mono text-foreground font-semibold">{b}</span>
              </div>
              <input
                type="range"
                min="-8"
                max="8"
                step="2"
                value={b}
                onChange={(e) => setB(Number(e.target.value))}
                className="w-full accent-primary h-1.5 bg-secondary rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Interactive Dynamic SVG Graph */}
          <div className="p-3 rounded-lg border border-border bg-zinc-950 flex flex-col items-center justify-center">
            <div className="w-full flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
              <span>Eğri Grafiği: f(x)</span>
              <span className="text-emerald-400">Tepe x: {(-b / (2 * a)).toFixed(2)}</span>
            </div>
            <svg width="100%" height="160" viewBox="0 0 280 160" className="overflow-visible">
              {/* Axis */}
              <line x1="20" y1="90" x2="260" y2="90" stroke="#374151" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="140" y1="10" x2="140" y2="150" stroke="#374151" strokeWidth="1" strokeDasharray="3 3" />
              {/* Curve */}
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                points={svgPoints}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Vertex Point */}
              <circle
                cx={140 + (-b / (2 * a)) * 28}
                cy={90 - (a * Math.pow(-b / (2 * a), 2) + b * (-b / (2 * a))) * 3}
                r="4.5"
                fill="#10b981"
              />
            </svg>
            <span className="text-[10px] text-zinc-500 mt-1">
              Yeşil nokta f'(x)=0 olan tepe noktasını gösterir.
            </span>
          </div>
        </div>

        {/* Step-by-Step Solver */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-3">
          <div>
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-2">
              Adım Adım Matematiksel Çözüm
            </span>

            <div className="space-y-2.5">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    activeStep === idx
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-muted-foreground/30 bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      {activeStep >= idx ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                      {step.title}
                    </span>
                  </div>

                  <div
                    className="p-2 rounded bg-muted/30 font-mono text-xs overflow-x-auto text-primary my-1"
                    dangerouslySetInnerHTML={renderLatex(step.formula)}
                  />

                  {activeStep === idx && (
                    <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                      {step.detail}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400">
            💡 <strong>Sınav İpucu:</strong> Fonksiyonun x=2 noktasındaki anlık değişim hızı teğet eğimidir:{" "}
            <span className="font-mono font-bold">f'(2) = {2 * a * 2 + b}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
