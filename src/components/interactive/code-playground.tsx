"use client";

import React, { useState } from "react";
import { Play, CheckCircle2, AlertCircle, RefreshCw, Terminal, Eye } from "lucide-react";

interface CodePlaygroundProps {
  initialCode?: string;
  language?: string;
  expectedOutput?: string;
  predictionQuestion?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
}

export function CodePlayground({
  initialCode = `int main() {\n    int a = 10;\n    int b = 25;\n    int* p = &a;\n    *p = b + 5;\n    std::cout << "Sonuç: " << a << std::endl;\n    return 0;\n}`,
  language = "cpp",
  expectedOutput = "Sonuç: 30",
  predictionQuestion = "Bu C++ kodu çalıştığında konsola hangi çıktı yazdırılır?",
  options = ["Sonuç: 10", "Sonuç: 25", "Sonuç: 30", "Derleme Hatası"],
  correctAnswer = "Sonuç: 30",
  explanation = "`p` işaretçisi `a` değişkeninin adresini tutar. `*p = b + 5` satırıyla `a` değişkeninin değeri 25 + 5 = 30 olur."
}: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [simulatedConsole, setSimulatedConsole] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  // Stepping variables for trace
  const traceSteps = [
    { line: 2, vars: { a: "10", b: "?", p: "null" }, note: "a tanımlandı (10)" },
    { line: 3, vars: { a: "10", b: "25", p: "null" }, note: "b tanımlandı (25)" },
    { line: 4, vars: { a: "10", b: "25", p: "&a (0x7ffee)" }, note: "p işaretçisi a'nın adresine bağlandı" },
    { line: 5, vars: { a: "30", b: "25", p: "&a (0x7ffee)" }, note: "*p dereference ile a'nın değeri 30 oldu!" },
    { line: 6, vars: { a: "30", b: "25", p: "&a" }, note: "std::cout ile konsola 30 yazdırıldı" }
  ];

  const handleCheckAnswer = (opt: string) => {
    setSelectedOption(opt);
    setHasEvaluated(true);
    if (opt === correctAnswer) {
      setSimulatedConsole(expectedOutput);
    }
  };

  const runSimulation = () => {
    setSimulatedConsole(expectedOutput);
  };

  const reset = () => {
    setSelectedOption(null);
    setHasEvaluated(false);
    setSimulatedConsole(null);
    setStepIndex(0);
  };

  return (
    <div className="rounded-xl border border-border bg-card/60 backdrop-blur overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs font-mono font-medium text-muted-foreground ml-2 uppercase">
            {language} • İnteraktif Kod Analizörü
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Sıfırla
          </button>
          <button
            onClick={runSimulation}
            className="flex items-center gap-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1 rounded-md transition-colors shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Çalıştır
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border">
        {/* Editor simulation */}
        <div className="lg:col-span-7 p-4 bg-zinc-950 font-mono text-xs text-zinc-100 overflow-x-auto leading-relaxed">
          <pre className="select-text">
            <code>{code}</code>
          </pre>

          {/* Stepper controls */}
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-400">
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px]">Bellek Durum Takibi:</span>
            </div>
            <div className="flex gap-1">
              {traceSteps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStepIndex(i)}
                  className={`w-6 h-6 rounded text-[11px] font-bold transition-colors ${
                    stepIndex === i
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Variable table trace */}
          <div className="mt-2.5 p-2.5 rounded bg-zinc-900 border border-zinc-800 text-[11px]">
            <div className="flex justify-between text-zinc-400 pb-1 mb-1 border-b border-zinc-800">
              <span>Değişken</span>
              <span>Anlık Değer</span>
            </div>
            {Object.entries(traceSteps[stepIndex].vars).map(([name, val]) => (
              <div key={name} className="flex justify-between font-mono py-0.5">
                <span className="text-amber-400">{name}</span>
                <span className="text-emerald-400">{val}</span>
              </div>
            ))}
            <div className="mt-2 text-[11px] text-zinc-400 italic">
              ℹ️ {traceSteps[stepIndex].note}
            </div>
          </div>
        </div>

        {/* Prediction / Interactive Question */}
        <div className="lg:col-span-5 p-4 flex flex-col justify-between bg-card">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-2">
              <Terminal className="w-3.5 h-3.5" />
              <span>ÇIKTIYI TAHMİN ET</span>
            </div>
            <p className="text-xs text-foreground font-medium mb-3">
              {predictionQuestion}
            </p>

            <div className="space-y-2">
              {options.map((opt) => {
                const isSelected = selectedOption === opt;
                const isCorrect = opt === correctAnswer;
                let btnStyle = "border-border hover:bg-accent/60 text-foreground";

                if (hasEvaluated) {
                  if (isCorrect) {
                    btnStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold";
                  } else if (isSelected && !isCorrect) {
                    btnStyle = "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400";
                  }
                } else if (isSelected) {
                  btnStyle = "border-primary bg-primary/10 text-primary";
                }

                return (
                  <button
                    key={opt}
                    onClick={() => handleCheckAnswer(opt)}
                    className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {hasEvaluated && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                    {hasEvaluated && isSelected && !isCorrect && (
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {hasEvaluated && (
              <div className="mt-3 p-3 rounded-lg bg-accent/40 border border-border text-xs leading-relaxed animate-in fade-in">
                <span className="font-semibold block mb-1">
                  {selectedOption === correctAnswer ? "🎉 Harika! Doğru Tahmin" : "💡 Çözüm Açıklaması:"}
                </span>
                <p className="text-muted-foreground">{explanation}</p>
              </div>
            )}
          </div>

          {/* Console Output Bar */}
          {simulatedConsole && (
            <div className="mt-4 pt-3 border-t border-border">
              <span className="text-[11px] font-mono text-muted-foreground block mb-1">
                Terminâl Çıktısı:
              </span>
              <div className="p-2.5 rounded bg-zinc-950 font-mono text-xs text-emerald-400">
                &gt; {simulatedConsole}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
