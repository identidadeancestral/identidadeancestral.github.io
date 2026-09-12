"use client";
import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { registerPageVisit, type VisitStats } from "@/lib/visit-client";
import type { Lang } from "@/lib/vocabulary";

export default function VisitCounter({lang}:{lang:Lang}) {
 const [stats,setStats]=useState<VisitStats|null>(null),[failed,setFailed]=useState(false);
 useEffect(()=>{let active=true;void registerPageVisit().then(value=>{if(active)setStats(value);}).catch(()=>{if(active)setFailed(true);});return()=>{active=false;};},[]);
 const pt=lang==="pt";
 const title=stats?(pt?"Visitas desde ":"Visits since ")+new Date(stats.startedAt).toLocaleDateString(pt?"pt-BR":"en")+(pt?". Uma visita por sessão de 30 minutos nesta aba.":". One visit per 30-minute session in this tab."):undefined;
 return <footer className="visit-footer"><span className="visit-counter" role="status" title={title}><Eye aria-hidden="true"/>{stats?<><strong>{stats.visits.toLocaleString(pt?"pt-BR":"en")}</strong>{pt?(stats.visits===1?"visita":"visitas"):(stats.visits===1?"visit":"visits")}</>:failed?(pt?"Contador temporariamente indisponível":"Visit counter temporarily unavailable"):(pt?"Carregando visitas…":"Loading visits…")}</span></footer>;
}
