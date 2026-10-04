interface BarChartDatum {
  label: string;
  value: number;
}

interface SimpleBarChartProps {
  data: BarChartDatum[];
  unit?: string;
}

export function SimpleBarChart({ data, unit = "" }: SimpleBarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div>
      <div className="flex h-48 items-end gap-3" role="img" aria-label={`Bar chart: ${data.map((d) => `${d.label} ${d.value}${unit}`).join(", ")}`}>
        {data.map((d) => (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-xs font-medium tabular-nums text-muted-foreground">{d.value}{unit}</span>
            <div
              className="w-full rounded-t-lg bg-gradient-to-t from-primary to-lavender transition-all"
              style={{ height: `${(d.value / max) * 140}px` }}
            />
            <span className="text-[11px] text-muted-foreground">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
