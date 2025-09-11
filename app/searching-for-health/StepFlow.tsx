"use client";

import React from "react";
import { FaFileAlt, FaCloudUploadAlt, FaBookmark, FaFlag } from "react-icons/fa";

const steps = [
  {
    title: "Start Application",
    description: "Begin your first-time adult passport application online.",
    icon: <FaFileAlt size={24} />,
    color: "blue",
  },
  {
    title: "Gather Documents",
    description: "Provide proof of citizenship, ID, and passport photo.",
    icon: <FaCloudUploadAlt size={24} />,
    color: "red",
  },
  {
    title: "We Prepare It",
    description: "Our experts complete and assemble your application package.",
    icon: <FaBookmark size={24} />,
    color: "blue",
  },
  {
    title: "Submit & Receive",
    description: "Application is sent, and your passport is delivered to your address.",
    icon: <FaFlag size={24} />,
    color: "red",
  },
];

const StepFlow = () => {
  return (
    <div className="flex flex-col items-center w-full py-10 bg-white">
      <div className="flex flex-wrap justify-center items-center gap-6 w-full max-w-6xl relative">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center relative">
            {/* Circle with Icon */}
            <div
              className={`flex items-center justify-center w-16 h-16 rounded-full ${
                step.color === "blue" ? "bg-blue-500" : "bg-red-500"
              } text-white shadow-md`}
            >
              {step.icon}
            </div>

            {/* Title */}
            <h3 className="mt-4 text-center font-semibold text-lg">{`Step ${index + 1}: ${step.title}`}</h3>
            
            {/* Description */}
            <p className="mt-2 text-center text-gray-600 max-w-xs">{step.description}</p>

            {/* Connector */}
            {index < steps.length - 1 && (
              <div
                className={`absolute top-8 left-full w-16 h-1 ${
                  steps[index + 1].color === "blue" ? "bg-blue-500" : "bg-red-500"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepFlow;
