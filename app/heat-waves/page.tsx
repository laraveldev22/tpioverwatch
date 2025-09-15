"use client";

import { useEffect, useRef, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

declare global {
  interface Window {
    google: typeof google;
  }
}

// ---------------- STATIC AUSTRALIA HEAT DATA ----------------
// Static dummy heatmap points (Australia ke andar)
// Static dummy heatmap points (Australia ke andar)
const heatWaveData: Record<number, { lat: number; lng: number; weight: number }[]> = {
  2004: [
    { lat: -28.674625, lng: 130.295658, weight: 40 },
    { lat: -27.449032, lng: 139.416311, weight: 42 },
    { lat: -23.848723, lng: 119.292967, weight: 38 },
    { lat: -33.341056, lng: 141.587895, weight: 45 },
    { lat: -31.434854, lng: 119.727283, weight: 50 },
    { lat: -16.300436, lng: 130.006114, weight: 47 },
    { lat: -19.114388, lng: 135.073143, weight: 44 },
    { lat: -22.417607, lng: 146.220607, weight: 48 },
    { lat: -26.165012, lng: 147.234013, weight: 46 },
    { lat: -30.046739, lng: 147.668329, weight: 49 },
    { lat: -33.057131, lng: 147.523557, weight: 51 },
  ],
  2008: [
    { lat: -28.674625, lng: 130.295658, weight: 50 },
    { lat: -27.449032, lng: 139.416311, weight: 52 },
    { lat: -23.848723, lng: 119.292967, weight: 48 },
    { lat: -33.341056, lng: 141.587895, weight: 55 },
    { lat: -31.434854, lng: 119.727283, weight: 53 },
    { lat: -16.300436, lng: 130.006114, weight: 51 },
    { lat: -19.114388, lng: 135.073143, weight: 49 },
    { lat: -22.417607, lng: 146.220607, weight: 54 },
    { lat: -26.165012, lng: 147.234013, weight: 52 },
    { lat: -30.046739, lng: 147.668329, weight: 56 },
    { lat: -33.057131, lng: 147.523557, weight: 58 },
  ],
  2012: [
    { lat: -28.674625, lng: 130.295658, weight: 60 },
    { lat: -27.449032, lng: 139.416311, weight: 62 },
    { lat: -23.848723, lng: 119.292967, weight: 58 },
    { lat: -33.341056, lng: 141.587895, weight: 65 },
    { lat: -31.434854, lng: 119.727283, weight: 63 },
    { lat: -16.300436, lng: 130.006114, weight: 61 },
    { lat: -19.114388, lng: 135.073143, weight: 59 },
    { lat: -22.417607, lng: 146.220607, weight: 64 },
    { lat: -26.165012, lng: 147.234013, weight: 62 },
    { lat: -30.046739, lng: 147.668329, weight: 66 },
    { lat: -33.057131, lng: 147.523557, weight: 68 },
  ],
  2016: [
    { lat: -28.674625, lng: 130.295658, weight: 70 },
    { lat: -27.449032, lng: 139.416311, weight: 72 },
    { lat: -23.848723, lng: 119.292967, weight: 68 },
    { lat: -33.341056, lng: 141.587895, weight: 75 },
    { lat: -31.434854, lng: 119.727283, weight: 73 },
    { lat: -16.300436, lng: 130.006114, weight: 71 },
    { lat: -19.114388, lng: 135.073143, weight: 69 },
    { lat: -22.417607, lng: 146.220607, weight: 74 },
    { lat: -26.165012, lng: 147.234013, weight: 72 },
    { lat: -30.046739, lng: 147.668329, weight: 76 },
    { lat: -33.057131, lng: 147.523557, weight: 78 },
  ],
  2020: [
    { lat: -28.674625, lng: 130.295658, weight: 80 },
    { lat: -27.449032, lng: 139.416311, weight: 82 },
    { lat: -23.848723, lng: 119.292967, weight: 78 },
    { lat: -33.341056, lng: 141.587895, weight: 85 },
    { lat: -31.434854, lng: 119.727283, weight: 83 },
    { lat: -16.300436, lng: 130.006114, weight: 81 },
    { lat: -19.114388, lng: 135.073143, weight: 79 },
    { lat: -22.417607, lng: 146.220607, weight: 84 },
    { lat: -26.165012, lng: 147.234013, weight: 82 },
    { lat: -30.046739, lng: 147.668329, weight: 86 },
    { lat: -33.057131, lng: 147.523557, weight: 88 },
  ],
  2024: [
    { lat: -28.674625, lng: 130.295658, weight: 100 },
    { lat: -27.449032, lng: 139.416311, weight: 102 },
    { lat: -23.848723, lng: 119.292967, weight: 98 },
    { lat: -33.341056, lng: 141.587895, weight: 105 },
    { lat: -31.434854, lng: 119.727283, weight: 103 },
    { lat: -16.300436, lng: 130.006114, weight: 101 },
    { lat: -19.114388, lng: 135.073143, weight: 99 },
    { lat: -22.417607, lng: 146.220607, weight: 104 },
    { lat: -26.165012, lng: 147.234013, weight: 102 },
    { lat: -30.046739, lng: 147.668329, weight: 106 },
    { lat: -33.057131, lng: 147.523557, weight: 108 },
  ],
};


// 👉 Chart data
const trendData = Object.keys(heatWaveData).map((year) => {
  const avg =
    heatWaveData[+year].reduce((sum, p) => sum + p.weight, 0) /
    heatWaveData[+year].length;
  return { year, avgWeight: Math.round(avg) };
});

// ---------------- COMPONENT ----------------
export default function AUHeatMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [heatmapInstance, setHeatmapInstance] =
    useState<google.maps.visualization.HeatmapLayer | null>(null);
  const [year, setYear] = useState(2004);
  const [isPlaying, setIsPlaying] = useState(false);
  const playInterval = useRef<NodeJS.Timeout | null>(null);
  const [activeTab, setActiveTab] = useState<"map" | "trend">("map");

  // Load Google Maps API
  useEffect(() => {
    if (!mapRef.current) return;
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDT0tFXelavZUzMcJSWgKecDPlbDm-PHEU&libraries=visualization`;
    script.async = true;
    script.onload = () => {
      if (!mapRef.current) return;
      const map = new google.maps.Map(mapRef.current, {
        zoom: 4.5,
        center: { lat: -25.2744, lng: 133.7751 },
        disableDefaultUI: true,
        gestureHandling: "none",
        scrollwheel: false,
        draggable: false,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#383042" }] },
          { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#E8F0C6" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#3D374D" }] },
          { featureType: "administrative.country", stylers: [{ visibility: "off" }] },
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "road", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
          { featureType: "water", stylers: [{ color: "#474561" }] },
          { featureType: "landscape", stylers: [{ color: "#54587B" }] },
        ],
      });
      setMapInstance(map);
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Update heatmap when year changes
  useEffect(() => {
    if (!mapInstance || !(window as any).google) return;
    const data = heatWaveData[year] || [];
    const heatmapData = data.map(
      (p) =>
      ({
        location: new google.maps.LatLng(p.lat, p.lng),
        weight: p.weight,
      } as google.maps.visualization.WeightedLocation)
    );

    if (heatmapInstance) {
      heatmapInstance.setMap(null);
    }

    const gradient = [
      "rgba(56, 48, 66, 0)",
      "rgba(61, 55, 77, 0.4)",
      "rgba(84, 88, 123, 0.5)",
      "rgba(232, 240, 198, 0.6)",
      "rgba(250, 243, 202, 0.7)",
      "rgba(254, 247, 206, 0.8)",
      "rgba(255, 252, 211, 0.9)",
    ];

    const newHeatmap = new google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      radius: 70,
      opacity: 0.95,
      gradient,
      map: mapInstance,
    });

    setHeatmapInstance(newHeatmap);
  }, [year, mapInstance]);

  // Play/Pause
  const togglePlay = () => {
    if (isPlaying) {
      if (playInterval.current) clearInterval(playInterval.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playInterval.current = setInterval(() => {
        setYear((prev) => {
          const nextYear = prev + 4;
          if (nextYear > 2024) {
            if (playInterval.current) clearInterval(playInterval.current);
            setIsPlaying(false);
            return 2024;
          }
          return nextYear;
        });
      }, 1200);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ position: "relative", width: "100%", height: "88vh" }}>
        {/* MAP VIEW */}
        <div
          ref={mapRef}
          style={{
            width: "100%",
            height: "100%",
            display: activeTab === "map" ? "block" : "none",
          }}
        />

        {/* TREND VIEW */}
        <div
          className="w-full h-full bg-[#474561] flex items-center justify-center"
          style={{ display: activeTab === "trend" ? "flex" : "none" }}
        >
          <ResponsiveContainer width="95%" height="100%">
            <LineChart data={trendData}>
              <XAxis dataKey="year" stroke="#fff" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="avgWeight"
                stroke="#E8F0C6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* YEAR LABEL */}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            background: "#1c1c2a",
            padding: "10px 20px",
            color: "#fff",
            borderRadius: "6px",
            fontSize: "1.2rem",
            zIndex: 1,
          }}
        >
          Year: {year}
        </div>

        {/* PLAY BUTTON */}
        <button
          onClick={togglePlay}
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            padding: "10px 20px",
            background: "#e8f0c6",
            color: "#1c1c2a",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            zIndex: 1,
          }}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>

        {/* TAB BUTTONS */}
        <div className="w-[150px] h-[50px] absolute top-3 right-4 grid grid-cols-2 rounded-lg overflow-hidden shadow-lg">
          <button
            onClick={() => setActiveTab("map")}
            className={`text-white font-semibold transition-colors ${activeTab === "map" ? "bg-[#7B7FA8]" : "bg-[#54587B]"
              }`}
          >
            Map
          </button>
          <button
            onClick={() => setActiveTab("trend")}
            className={`text-white font-semibold transition-colors ${activeTab === "trend" ? "bg-[#7B7FA8]" : " bg-[#54587B]"
              }`}
          >
            Trend
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
