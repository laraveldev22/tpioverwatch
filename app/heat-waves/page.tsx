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
const trendDataG = [
  { year: "2004", avgWeight: 50, maxWeight: 80, minWeight: 20 },
  { year: "2008", avgWeight: 60, maxWeight: 90, minWeight: 30 },
  { year: "2012", avgWeight: 70, maxWeight: 100, minWeight: 40 },
  { year: "2016", avgWeight: 80, maxWeight: 110, minWeight: 50 },
  { year: "2020", avgWeight: 90, maxWeight: 120, minWeight: 60 },
  { year: "2024", avgWeight: 100, maxWeight: 130, minWeight: 70 },
];


// Generate ~60% coverage
const generateAustraliaHeatData60 = (baseWeight: number = 10) => {
  const points: { lat: number; lng: number; weight: number }[] = [];

  // Australia ka approximate boundary
  const latMin = -44.0;
  const latMax = -15.0;
  const lngMin = 130.0; // thoda tight
  const lngMax = 153.0; // thoda tight
  const latStep = 2.0;  // grid thoda dense
  const lngStep = 2.0;  // grid thoda dense

  for (let lat = latMin; lat <= latMax; lat += latStep) {
    for (let lng = lngMin; lng <= lngMax; lng += lngStep) {
      // sirf 60% chance ke saath point generate
      if (Math.random() < 0.1) {
        const weight = baseWeight + Math.random() * 20;
        points.push({ lat, lng, weight });
      }
    }
  }

  return points;
};


const heatWaveData: Record<number, { lat: number; lng: number; weight: number }[]> = {
  2004: generateAustraliaHeatData60(40),
  2008: generateAustraliaHeatData60(50),
  2012: generateAustraliaHeatData60(60),
  2016: generateAustraliaHeatData60(70),
  2020: generateAustraliaHeatData60(80),
  2024: generateAustraliaHeatData60(100),
};

// 👉 Convert heatWaveData → chart-friendly format
const trendData = Object.keys(heatWaveData).map((year) => {
  const avg =
    heatWaveData[+year].reduce((sum, p) => sum + p.weight, 0) /
    heatWaveData[+year].length;
  return { year, avgWeight: Math.round(avg) };
});

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
      (p) => ({
        location: new google.maps.LatLng(p.lat, p.lng),
        weight: p.weight,
      })
    );

    const gradient = [
      "rgba(56, 48, 66, 0)",
      "rgba(61, 55, 77, 0.4)",
      "rgba(84, 88, 123, 0.5)",
      "rgba(232, 240, 198, 0.6)",
      "rgba(250, 243, 202, 0.7)",
      "rgba(254, 247, 206, 0.8)",
      "rgba(255, 252, 211, 0.9)",
    ];

    if (heatmapInstance) {
      heatmapInstance.setMap(null);
    }

    const newHeatmap = new google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      radius: 70,
      opacity: 0.95,
      gradient,
      map: mapInstance,
    });

    setHeatmapInstance(newHeatmap);
  }, [year, mapInstance]);

  // Handle Play/Pause
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
              {/* <CartesianGrid strokeDasharray="3 3" stroke="#8884d8" /> */}
              <XAxis dataKey="year" stroke="#fff" />
              {/* <YAxis stroke="#fff" /> */}
              <Tooltip />
              {/* <Legend verticalAlign="top" /> */}
              <Line type="monotone" dataKey="avgWeight" stroke="#E8F0C6" strokeWidth={2} />
              <Line type="monotone" dataKey="maxWeight" stroke="#FF6B6B" strokeWidth={2} />
              <Line type="monotone" dataKey="minWeight" stroke="#4ECDC4" strokeWidth={2} />
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
