// src/pages/InvestPage.jsx
import { useEffect, useState } from "react";
import PlotsMap from "../components/PlotsMap";
import { bc } from "../admin/bus";
import UnderConstruction from "../components/UnderConstruction";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

async function loadInvest() {
  const url = `${API_BASE}/plots?category=invest&t=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Plots API ${res.status}`);
  return res.json(); // бэкенд отдаёт массив
}

export default function InvestPage() {
  return <UnderConstruction title="Рекреация - туризм" />;
}