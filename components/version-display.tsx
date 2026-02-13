"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export function VersionDisplay() {
  const [version, setVersion] = useState<string>("");

  useEffect(() => {
    fetch("/version.json")
      .then((res) => res.json())
      .then((data) => setVersion(data.version))
      .catch(() => setVersion("1.0.0"));
  }, []);

  if (!version) return null;

  return (
    <Link href="/changelog" className="fixed bottom-4 right-4 z-50 group">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <span className="text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors">
          v{version}
        </span>
      </div>
    </Link>
  );
}
