"use client";
import React, { useState } from "react";
import {
    FaSearch,
    FaFileExport,
} from "react-icons/fa";
import { TrendingUp, ArrowUp, ArrowDown } from "lucide-react"; // ✅ nice trending icons
import DashboardLayout from "../layout/DashboardLayout";
import { LineChart, Line, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import Filters from "./Filters";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Trend {
    trend: string;
    region: string;
    time: string;
    category: string;
    type: string;
    volume: string;
    started: string;
    breakdown: string[];
    graphData: number[];
    delta: number; // ✅ % change
}

const generateDummyData = (): Trend[] => {
    const trends: Trend[] = [];
    for (let i = 1; i <= 60; i++) {
        trends.push({
            trend: `Trend ${i}`,
            region: i % 2 === 0 ? "Australia" : "Global",
            time: i % 3 === 0 ? "Past 48 hours" : "Past week",
            category: i % 4 === 0 ? "Business" : "Tech",
            type: i % 5 === 0 ? "Top Trend" : "Regular Trend",
            volume: `${Math.floor(Math.random() * 100 + 1)}K+`,
            started: `${Math.floor(Math.random() * 24 + 1)} hours ago`,
            breakdown: [`Detail A${i}`, `Detail B${i}`, `Detail C${i}`],
            graphData: Array.from({ length: 8 }, () => Math.floor(Math.random() * 30 + 1)),
            delta: Math.floor(Math.random() * 2000 - 500), // -500% to +1500%
        });
    }
    return trends;
};

const trendsData: Trend[] = generateDummyData();

const Sparkline: React.FC<{ data: number[] }> = ({ data }) => {
    const chartData = data.map((value, idx) => ({ idx, value }));
    return (
        <div className="w-40 h-10">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <XAxis dataKey="idx" hide />
                    <Tooltip formatter={(value: number) => `${value}`} />
                    <Bar dataKey="value" fill="#3b82f6" barSize={4} />
                    <Line type="monotone" dataKey="value" stroke="#1e40af" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const Page: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);

    const filteredData = trendsData.filter((item) =>
        item.trend.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="bg-gray-100 min-h-screen">
                {/* Filter Bar */}
                <div className="flex flex-wrap items-center justify-between bg-white p-5 rounded-lg shadow-md mb-6">
                    <Filters />
                    <div className="flex items-center space-x-4 mt-3 md:mt-0">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search trends..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
                        </div>
                        <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                            <FaFileExport className="mr-2" /> Export
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg shadow-lg">
                        <thead className="bg-[#171a39] text-white text-lg rounded-t-lg">
                            <tr>
                                <th className="px-6 py-3 text-left rounded-tl-lg">Trends</th>
                                <th className="px-6 py-3 text-left">Impressions</th>
                                <th className="px-6 py-3 text-left">Started</th>
                                <th className="px-6 py-3 text-left">Trend Breakdown</th>
                                <th className="px-6 py-3 text-left rounded-tr-lg">Past 48 Hours</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item, idx) => (
                                <tr
                                    key={idx}
                                    className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                                    onClick={() => setSelectedTrend(item)} // ✅ open side panel
                                >
                                    <td className="px-6 py-4 rounded-l-lg font-medium">{item.trend}</td>

                                    {/* ✅ Volume + Arrow + % */}
                                    <td className="px-6 py-4 flex gap-2 flex-col">
                                        {item.volume}
                                        {item.delta > 0 ? (
                                            <span className="text-green-600 flex items-center  text-sm font-medium">
                                                <ArrowUp className="w-4 h-4 mr-1" />
                                                {item.delta}%
                                            </span>
                                        ) : (
                                            <span className="text-red-600 flex items-center text-sm font-medium">
                                                <ArrowDown className="w-4 h-4 mr-1" />
                                                {Math.abs(item.delta)}%
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4">{item.started}  <span className="text-green-600 flex items-center  text-sm font-medium">
                                        <TrendingUp className="w-4 h-4 mr-1" />
                                        Active
                                    </span></td>
                                    <td className="px-6 py-4">{item.breakdown.join(", ")}</td>
                                    <td className="px-6 py-4 rounded-r-lg">
                                        <Sparkline data={item.graphData} />
                                    </td>
                                </tr>
                            ))}

                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center p-6 text-gray-500">
                                        No trends match your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Right Side Panel */}
                <Sheet open={!!selectedTrend} onOpenChange={() => setSelectedTrend(null)}>
                    <SheetContent side="right" className="w-[400px]">
                        {selectedTrend && (
                            <>
                                <SheetHeader>
                                    <SheetTitle>{selectedTrend.trend}</SheetTitle>
                                    <SheetDescription>
                                        {selectedTrend.category} • {selectedTrend.region}
                                    </SheetDescription>
                                </SheetHeader>

                                {/* Trend Details */}
                                <div className="mt-4 space-y-4">
                                    <p>
                                        <strong>Volume:</strong> {selectedTrend.volume}
                                    </p>
                                    <p>
                                        <strong>Started:</strong> {selectedTrend.started}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <strong>Change:</strong>
                                        {selectedTrend.delta > 0 ? (
                                            <span className="text-green-600 flex items-center">
                                                <ArrowUp className="w-4 h-4 mr-1" /> {selectedTrend.delta}%
                                            </span>
                                        ) : (
                                            <span className="text-red-600 flex items-center">
                                                <ArrowDown className="w-4 h-4 mr-1" /> {selectedTrend.delta}%
                                            </span>
                                        )}
                                    </p>

                                    {/* ✅ Full-width Graph */}
                                    <div className="w-full">
                                        <Sparkline data={selectedTrend.graphData}   />
                                    </div>
                                </div>

                                {/* ✅ Accordion for Today Match */}
                                <div className="mt-6">
                                    <Accordion type="single" collapsible>
                                        <AccordionItem value="today-match">
                                            <AccordionTrigger>Today Match</AccordionTrigger>
                                            <AccordionContent>
                                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                                    <li>Today Asia Cup Match</li>
                                                    <li>Afghanistan vs Hong Kong (AFG vs HK)</li>
                                                    <li>Nizakat Khan</li>
                                                    <li>Asia Cup Match Schedule</li>
                                                    <li>Asia Cup Time Table</li>
                                                    <li>Cricket Match Updates</li>
                                                </ul>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>

                                {/* ✅ News Cards */}
                                <div className="mt-6 space-y-4">
                                    {[
                                        {
                                            img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5HYVQR4pmup8ff7vw-vOAW6tU-f6MqfIhxKlOHqshRfz0ix8jF_l23OKu55A",
                                            title: "Afghanistan vs Hong Kong: Asia Cup Clash Today",
                                            time: "2h ago",
                                            tag: "In the News",
                                        },
                                        {
                                            img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5HYVQR4pmup8ff7vw-vOAW6tU-f6MqfIhxKlOHqshRfz0ix8jF_l23OKu55A",
                                            title: "Asia Cup 2025 Schedule Released",
                                            time: "5h ago",
                                            tag: "Cricket",
                                        },
                                    ].map((news, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-white rounded-xl shadow p-3 flex flex-col gap-2"
                                        >
                                            <img
                                                src={news.img}
                                                alt={news.title}
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                            <h3 className="font-semibold text-sm">{news.title}</h3>
                                            <div className="flex justify-between items-center text-xs text-gray-500">
                                                <span>{news.time}</span>
                                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px]">
                                                    {news.tag}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </SheetContent>
                </Sheet>

            </div>
        </DashboardLayout>
    );
};

export default Page;
