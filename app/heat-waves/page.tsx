"use client";

import { useEffect, useRef, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";

// 👇 Add this so TS knows about window.google
declare global {
  interface Window {
    google: typeof google;
  }
}

// Generate ~60% coverage
const generateAustraliaHeatData60 = (baseWeight: number = 10) => {
  const points: { lat: number; lng: number; weight: number }[] = [];

  // Rough bounding box of Australia
  const latMin = -44.0;
  const latMax = -10.0;
  const lngMin = 112.0;
  const lngMax = 154.0;

  const latStep = 4.0; // larger step → fewer points
  const lngStep = 4.0;

  for (let lat = latMin; lat <= latMax; lat += latStep) {
    for (let lng = lngMin; lng <= lngMax; lng += lngStep) {
      // Include ~60% of points randomly
      if (Math.random() < 0.6) {
        const weight = baseWeight + Math.random() * 30; // random weight for variation
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

export default function AUHeatMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [heatmapInstance, setHeatmapInstance] = useState<google.maps.visualization.HeatmapLayer | null>(null);
  const [year, setYear] = useState(2004);
  const [isPlaying, setIsPlaying] = useState(false);
  const playInterval = useRef<NodeJS.Timeout | null>(null);

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

    // ✅ Proper cleanup (must return void | () => void)
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
      heatmapInstance.setMap(null); // Remove previous
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
      }, 1200); // Every 1.2 sec
    }
  };

  return (
    <DashboardLayout>
      <div style={{ position: "relative", width: "100%", height: "88vh" }}>
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
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
      </div>
    </DashboardLayout>
  );
}
