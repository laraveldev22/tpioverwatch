"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import axios from "axios";
import { toast } from "react-hot-toast"; // for toasts

const Page = () => {
    const [frequency, setFrequency] = useState("");
    const [customDays, setCustomDays] = useState("");
    const [numArticles, setNumArticles] = useState<number | undefined>();
    const [maxSize, setMaxSize] = useState("");
    const [loading, setLoading] = useState(false);

    const frequencyOptions = ["Weekly", "Monthly", "Custom"];

    // helper
    const capitalize = (val: string) =>
        val ? val.charAt(0).toUpperCase() + val.slice(1) : val;

    // Fetch existing settings
    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("No token found.");
                    return;
                }

                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/newsletter/settings/`,
                    {
                        headers: { Authorization: `Token ${token}` },
                    }
                );

                if (response.data) {
                    setFrequency(
                        response.data.frequency ? capitalize(response.data.frequency) : ""
                    );
                    setCustomDays(response.data.custom_days || "");
                    setNumArticles(response.data.max_size || 10);
                    setMaxSize(response.data.max_size || "");
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
                toast.error("Failed to load settings.");
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSaveSettings = async () => {
        if (!frequency) {
            toast.error("Please select a frequency.");
            return;
        }
        if (frequency === "Custom" && (!customDays || Number(customDays) <= 0)) {
            toast.error("Enter valid days for custom frequency.");
            return;
        }
        if (!numArticles || numArticles <= 0) {
            toast.error("Enter valid number of articles.");
            return;
        }

        const payload = {
            frequency: frequency.toLowerCase(),
            custom_days: frequency === "Custom" ? Number(customDays) : null,
            num_articles: numArticles,
            max_size: Number(numArticles) || null,
        };

        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/newsletter/settings/`,
                payload,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            toast.success("Settings saved successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save settings.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="flex items-center justify-center mt-40">
                <div className="bg-white shadow-xl rounded-2xl p-10 w-[500px] relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-2xl">
                            <svg className="animate-spin h-16 w-16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#171a39" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="#171a39" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                        </div>
                    )}
{/* 
                    <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                        Newsletter Settings
                    </h2> */}

                    {/* Frequency Dropdown */}
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Frequency</label>
                        <select
                            title="asda"
                            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                        >
                            <option value="">Select Frequency</option>
                            {frequencyOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Custom Days Input */}
                    {frequency === "Custom" && (
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">
                                Enter number of days
                            </label>
                            <input
                                type="number"
                                min={1}
                                value={customDays}
                                onChange={(e) => setCustomDays(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Enter number of days"
                            />
                        </div>
                    )}

                    {/* Number of Articles */}
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Number of Newsletter</label>
                        <input
                            title="sad"
                            type="number"
                            min={1}
                            value={numArticles}
                            onChange={(e) => setNumArticles(Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    {/* Advertisement (disabled) */}
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Advertisement</label>
                        <select
                            disabled
                            className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                            title="Coming Soon"
                        >
                            <option>Coming Soon</option>
                        </select>
                    </div>

                    {/* Save Button */}
                    <button
                        type="button"
                        onClick={handleSaveSettings}
                        disabled={loading}
                        className="mt-6 w-full text-white py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
                        style={{ backgroundColor: "#171A39" }}
                    >
                        {loading ? "Saving..." : "Save Settings"}
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Page;
