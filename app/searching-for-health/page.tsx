"use client";

import { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Tooltip } from "react-tooltip";
import DashboardLayout from "../layout/DashboardLayout";

const geoUrl = "/australian-suburbs.geojson";

// Dummy data for Search Interest (interactive mode)
const searchInterestData: Record<string, number> = {
    CA: 120,
    TX: 80,
    NY: 200,
    FL: 95,
    IL: 150,
    PA: 180,
    OH: 130,
    GA: 170,
    NC: 110,
    MI: 140,
};

// Dummy data for Mortality Rate (static visual mode)
const mortalityRateData: Record<string, number> = {
    CA: 160,
    TX: 200,
    NY: 120,
    FL: 180,
    IL: 140,
    PA: 190,
    OH: 170,
    GA: 150,
    NC: 135,
    MI: 155,
};

export default function MyMap() {
    const [tooltipContent, setTooltipContent] = useState<string>("");
    const [showHealthMap, setShowHealthMap] = useState<boolean>(true);

    // Select appropriate dataset based on mode
    const currentData = showHealthMap ? searchInterestData : mortalityRateData;

    return (
        <DashboardLayout>
            <div className=" mx-auto p-6 space-y-8 bg-[#171A39]">

                <h1 className="text-3xl font-bold text-white">Health Data | Cancer Data Visualization</h1>

                <div className="w-full h-[550px] my-8 relative bg-[#171A39]">
                    <ComposableMap projection="geoMercator"
                        projectionConfig={{
                            scale: 1000, // adjust as needed
                            center: [133, -25], // roughly center of Australia [longitude, latitude]
                        }} className="w-full h-full">
                        <Geographies geography={geoUrl}>
                            {({ geographies }) =>
                                geographies.map((geo) => {
                                    const stateName = geo.properties.name as string;
                                    const stateCode = geo.properties.iso_3166_2?.replace("US-", "") ?? "";
                                    const value = currentData[stateCode] || 0;

                                    // Color scale adjusted based on data type
                                    const color =
                                        value > 180 ? "#800026" :       // dark red
                                            value > 160 ? "#BD0026" :       // red
                                                value > 140 ? "#E31A1C" :       // lighter red
                                                    value > 120 ? "#FC4E2A" :       // orange-red
                                                        value > 100 ? "#FD8D3C" :       // orange
                                                            value > 80 ? "#CBDCEB" :       // light green (replacing yellow)
                                                                value > 60 ? "#CBDCEB" :       // green (replacing darker yellow)
                                                                    "#54587B";         // dark green (replacing lightest yellow)
                                    return (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            fill={color}
                                            stroke="#fff"
                                            data-tooltip-id={showHealthMap ? "map-tooltip" : undefined}
                                            data-tooltip-content={showHealthMap ? `${stateName}: ${value}` : undefined}
                                            onMouseEnter={showHealthMap ? () => setTooltipContent(`${stateName}: ${value}`) : undefined}
                                            onMouseLeave={showHealthMap ? () => setTooltipContent("") : undefined}
                                            style={{
                                                default: { outline: "none" },
                                                hover: { fill: showHealthMap ? "#4da6ff" : undefined, outline: "none" },
                                            }}
                                        />
                                    );
                                })
                            }
                        </Geographies>
                    </ComposableMap>

                    {showHealthMap && <Tooltip id="map-tooltip" />}
                </div>

                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-xl font-semibold">Legend (Value)</h2>
                    <div className="flex flex-wrap gap-4 mt-4">
                        <div className="flex flex-wrap gap-4 mt-4">
                            {[
                                { color: "#800026", label: "> 180" },
                                { color: "#BD0026", label: "161–180" },
                                { color: "#E31A1C", label: "141–160" },
                                { color: "#FC4E2A", label: "121–140" },
                                { color: "#FD8D3C", label: "101–120" },
                                { color: "#66C266", label: "81–100" },    
                                { color: "#33A833", label: "61–80" },    
                                { color: "#1A7D1A", label: "<= 60" },    
                            ].map(({ color, label }) => (
                                <div key={label} className="flex items-center space-x-2">
                                    <div className="w-6 h-6" style={{ backgroundColor: color }}></div>
                                    <span className="text-gray-700">{label}</span>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
