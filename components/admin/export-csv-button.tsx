"use client";

import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

function toCsvValue(value: string | number) {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function ExportCsvButton({ filename, headers, rows }: { filename: string; headers: string[]; rows: (string | number)[][] }) {
  const handleExport = () => {
    const lines = [headers, ...rows].map((row) => row.map(toCsvValue).join(","));
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" onClick={handleExport} className="cursor-pointer gap-1.5 rounded-full">
      <DownloadSimpleIcon size={14} /> Export CSV
    </Button>
  );
}
