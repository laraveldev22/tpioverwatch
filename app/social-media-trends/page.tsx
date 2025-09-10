"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../layout/DashboardLayout";

const data: string[] = [
  "Veteran suicide",
  "Royal Commission",
  "VETS Act reform",
  "Psychedelic therapies",
  "Sallymen cuts",
  "Healthcare access",
  "Pension indexation",
  "Public identity gap",
  "Hub funding",
  "Super scandal",
  "Aged-care neglect",
  "RSL funding",
  "Pokie profits",
  "Equipment theft",
  "Policy gap",
  "Weather"
];


const colors: string[] = ["bg-blue-500", "bg-red-500", "bg-green-500", "bg-yellow-400"];
const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

const directions = ["left", "right", "top", "bottom"];
const getRandomDirection = () => directions[Math.floor(Math.random() * directions.length)];

// Typing animation hook
const useTyping = (text: string, key: string, speed: number = 150) => {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let index = 0;
    setDisplayText("");
    const interval = setInterval(() => {
      index++;
      setDisplayText(text.slice(0, index));
      if (index >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, key, speed]);

  return displayText;
};

interface CardProps {
  text: string;
  isActive: boolean;
}

const Card: React.FC<CardProps> = ({ text, isActive }) => {
  const [color, setColor] = useState(getRandomColor());
  const [bgKey, setBgKey] = useState(0);
  const [typingKey, setTypingKey] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | "top" | "bottom">("left");

  // Text keeps typing independently
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingKey((k) => k + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Only change bg if active
  useEffect(() => {
    if (isActive) {
      setColor(getRandomColor());
      setBgKey((k) => k + 1);
      setDirection(getRandomDirection() as any);
    }
  }, [isActive]);

  const typedText = useTyping(text, typingKey.toString(), 80);

  // initial positions based on direction
  const getInitial = () => {
    switch (direction) {
      case "left":
        return { x: "-100%", y: 0 };
      case "right":
        return { x: "100%", y: 0 };
      case "top":
        return { x: 0, y: "-100%" };
      case "bottom":
        return { x: 0, y: "100%" };
      default:
        return { x: "-100%", y: 0 };
    }
  };

  const getExit = () => {
    switch (direction) {
      case "left":
        return { x: "100%", y: 0 };
      case "right":
        return { x: "-100%", y: 0 };
      case "top":
        return { x: 0, y: "100%" };
      case "bottom":
        return { x: 0, y: "-100%" };
      default:
        return { x: "100%", y: 0 };
    }
  };

  return (
    <div className="relative flex items-center justify-center overflow-hidden text-white font-bold text-2xl sm:text-4xl p-10">
      <AnimatePresence mode="sync">
        <motion.div
          key={color + bgKey}
          className={`absolute inset-0 ${color}`}
          initial={getInitial()}
          animate={{ x: 0, y: 0 }}
          exit={getExit()}
          transition={{ duration: 0.8 }}
        />
      </AnimatePresence>

      <span className="relative z-10">{typedText}</span>
    </div>
  );
};

const CardGrid: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const randIndex = Math.floor(Math.random() * data.length);
      setActiveIndex(randIndex);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="grid w-full h-[90vh] "
      style={{
        gridTemplateColumns: `repeat(4, minmax(0, 1fr))`,
        gridAutoRows: "1fr",
      }}
    >
      {data.map((item, index) => (
        <Card key={index} text={item} isActive={index === activeIndex} />
      ))}
    </div>
  );
};

const Page: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="w-full min-h-screen bg-gray-100">
        <CardGrid />
      </div>
    </DashboardLayout>
  );
};

export default Page;
