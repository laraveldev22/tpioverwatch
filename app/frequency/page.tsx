"use client";

import React, { useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import axios from "axios";

const Page = () => {
    const [frequency, setFrequency] = useState("");
    const [customDays, setCustomDays] = useState(""); // new custom input
    const [numArticles, setNumArticles] = useState(10);
    const [maxSize, setMaxSize] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const frequencyOptions = ["Daily", "Weekly", "Monthly", "Custom"];

    const handleSaveSettings = async () => {
        if (!frequency) {
            setMessage("Please select a frequency.");
            return;
        }
        if (frequency === "Custom" && (!customDays || Number(customDays) <= 0)) {
            setMessage("Please enter a valid number of days for custom frequency.");
            return;
        }
        if (!numArticles || numArticles <= 0) {
            setMessage("Please enter a valid number of articles.");
            return;
        }

        const payload = {
            frequency: frequency.toLowerCase(),
            custom_days:
                frequency === "Custom" ? Number(customDays) : null, // send number if custom
            num_articles: numArticles,
            max_size: maxSize,
        };

        setLoading(true);
        setMessage("");

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
            setMessage("Settings saved successfully!");
        } catch (error) {
            console.error(error);
            setMessage("Failed to save settings.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="flex items-center justify-center mt-40">
                <div className="bg-white shadow-xl rounded-2xl p-10 w-[500px]">
                    <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                        Newsletter Settings
                    </h2>

                    {/* Frequency Dropdown */}
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Frequency</label>
                        <select
                            title="DAS"
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

                    {/* Custom Days Input (only if Custom) */}
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
                        <label className="block text-gray-700 mb-2">Number of Articles</label>
                        <input
                            title="das"
                            type="number"
                            min={1}
                            value={numArticles}
                            onChange={(e) => setNumArticles(Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    {/* Max Size */}
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Advertisement</label>
                        <input
                            title="asda"
                            type="text"
                            min={1}
                            value={maxSize}
                            onChange={(e) => setMaxSize(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    {/* Save Button */}
                    <button
                        title="asd"
                        type="button"
                        onClick={handleSaveSettings}
                        disabled={loading}
                        className="mt-6 w-full text-white py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
                        style={{ backgroundColor: "#171A39" }}
                    >
                        {loading ? "Saving..." : "Save Settings"}
                    </button>

                    {message && (
                        <div className="mt-4 text-center text-sm text-gray-700">{message}</div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Page;
