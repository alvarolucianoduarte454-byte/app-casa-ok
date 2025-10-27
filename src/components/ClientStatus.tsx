"use client";
import { useEffect, useState } from "react";

export default function ClientStatus() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    update();
    if (typeof window !== "undefined") {
      window.addEventListener("online", update);
      window.addEventListener("offline", update);
      return () => {
        window.removeEventListener("online", update);
        window.removeEventListener("offline", update);
      };
    }
  }, []);
  if (online) return null;
  return (
    <div style={{background:"#FFE4A1",color:"#7A4A00",textAlign:"center",fontSize:12,padding:4}}>
      ⚠️ Você está offline — exibindo dados em cache.
    </div>
  );
}