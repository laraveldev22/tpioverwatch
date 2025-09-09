"use client";
import React, { useState, useEffect } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import {
    FaEnvelope,
    FaQrcode,
    FaFacebookF,
    FaTwitter,
    FaInstagram,
    FaGlobe,
} from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";
import { authenticator } from "otplib";
import toast from "react-hot-toast";

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState<"social" | "twofactor">("social");
    const [emailCodeSent, setEmailCodeSent] = useState(false);
    const [emailEnabled, setEmailEnabled] = useState(false); // Enable button clicked
    // Social Media state
    const [socials, setSocials] = useState({
        facebook: { enabled: false, apiKey: "", accountName: "" },
        twitter: { enabled: false, apiKey: "", accountName: "" },
        instagram: { enabled: false, apiKey: "", accountName: "" },
        other: { enabled: false, apiKey: "", accountName: "" },
    });

    // Two-Factor states
    const [showQR, setShowQR] = useState(false);
    const [otp, setOtp] = useState("");
    const [secret, setSecret] = useState<string | null>(null);
    const [otpAuthUrl, setOtpAuthUrl] = useState("");
    const [isVerified, setIsVerified] = useState(false);

    // Email 2FA
    const [emailCode, setEmailCode] = useState("");
    const [emailVerified, setEmailVerified] = useState(false);

    useEffect(() => {
        const generatedSecret = authenticator.generateSecret();
        setSecret(generatedSecret);

        const otpauth = authenticator.keyuri(
            "user@example.com",
            "MyApp",
            generatedSecret
        );
        setOtpAuthUrl(otpauth);
    }, []);

    const handleVerify = () => {
        if (!otp || !secret) return;
        const verified = authenticator.check(otp, secret);
        if (verified) {
            setIsVerified(true);
            setShowQR(false);
            localStorage.setItem(
                "twoFactorAuth",
                JSON.stringify({
                    twoFactorEnabled: true,
                    twoFactorSecret: secret,
                    twoFactorMethod: "authenticator",
                })
            );
            alert("✅ Two-Factor Authentication Enabled!");
        } else {
            alert("❌ Invalid Code, try again");
        }
    };


    const handleSendEmailCode = () => {
        console.log("Sending 6-digit code to email...");
        alert("✅ Email code sent! Check your inbox.");
        setEmailCodeSent(true); // now input + verify becomes visible
    };

    const handleEnable = () => {
        setEmailEnabled(true);
        setEmailCodeSent(true);

        // Simulate sending code
        console.log("Sending verification code...");
        toast.success("✅ Code sent! Please verify."); // optional toast function
    };

    const handleEmailVerify = () => {
        if (emailCode === "123456") {
            setEmailVerified(true);
            alert("✅ Email 2FA Enabled!");
        } else {
            alert("❌ Invalid Email Code");
        }
    };

    const handleSocialChange = (
        platform: string,
        field: "apiKey" | "accountName",
        value: string
    ) => {
        setSocials({
            ...socials,
            [platform]: {
                ...socials[platform as keyof typeof socials],
                [field]: value,
            },
        });
    };


    const handleSocialToggle = (platform: string) => {
        setSocials({
            ...socials,
            [platform]: {
                ...socials[platform as keyof typeof socials],
                enabled: !socials[platform as keyof typeof socials].enabled,
            },
        });
    };

    const handleSocialSave = () => {
        console.log("Saved social credentials:", socials);
        alert("✅ Social media credentials saved!");
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
                {/* Tabs */}
                <div className="flex border-b mb-6">
                    <button
                        onClick={() => setActiveTab("social")}
                        className={`px-4 py-2 -mb-px font-semibold border-b-2 ${activeTab === "social"
                            ? "border-blue-500 text-blue-500"
                            : "border-transparent text-gray-500"
                            }`}
                    >
                        Social Media Settings
                    </button>
                    <button
                        onClick={() => setActiveTab("twofactor")}
                        className={`px-4 py-2 -mb-px font-semibold border-b-2 ${activeTab === "twofactor"
                            ? "border-purple-500 text-purple-500"
                            : "border-transparent text-gray-500"
                            }`}
                    >
                        Two-Factor Authentication
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === "social" && (
                    <div className="space-y-4">
                        {[
                            { name: "facebook", icon: <FaFacebookF className="text-blue-600 text-2xl" /> },
                            { name: "twitter", icon: <FaTwitter className="text-blue-400 text-2xl" /> },
                            { name: "instagram", icon: <FaInstagram className="text-pink-500 text-2xl" /> },
                            { name: "other", icon: <FaGlobe className="text-gray-600 text-2xl" /> },
                        ].map((platform) => (
                            <div
                                key={platform.name}
                                className="flex flex-col border rounded-lg p-4 hover:shadow-md transition"
                            >
                                <div className="flex items-center justify-between ">
                                    <div className="flex items-center gap-3">
                                        {platform.icon}
                                        <h3 className="font-medium capitalize">{platform.name}</h3>
                                    </div>
                                    {/* Toggle Switch */}
                                    <label className="inline-flex relative items-center cursor-pointer ">
                                        <input
                                            title="input"
                                            type="checkbox"
                                            checked={socials[platform.name as keyof typeof socials].enabled}
                                            onChange={() => handleSocialToggle(platform.name)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-blue-600 transition-all"></div>
                                        <div
                                            className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5"
                                        ></div>
                                    </label>
                                </div>

                                {/* Credential Inputs */}
                                {socials[platform.name as keyof typeof socials].enabled && (
                                    <div className="space-y-2  mt-5">
                                        <input
                                            type="text"
                                            placeholder="Enter API Key"
                                            value={socials[platform.name as keyof typeof socials].apiKey}
                                            onChange={(e) => handleSocialChange(platform.name, "apiKey", e.target.value)}
                                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Optional Account Name"
                                            value={socials[platform.name as keyof typeof socials].accountName}
                                            onChange={(e) => handleSocialChange(platform.name, "accountName", e.target.value)}
                                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}

                        <button
                            onClick={handleSocialSave}
                            className="mt-4 px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
                        >
                            Save
                        </button>
                    </div>
                )}


                {activeTab === "twofactor" && (
                    <div className="space-y-6">
                        {/* Email 2FA */}

                        <div className="flex flex-col border rounded-lg p-4 hover:shadow-md transition">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <FaEnvelope className="text-blue-500 text-2xl" />
                                    <div>
                                        <h3 className="font-medium">Email Verification</h3>
                                        <p className="text-sm text-gray-500">
                                            Enter 6-digit code sent to your email.
                                        </p>
                                    </div>
                                </div>

                                {/* Enable Button on the right */}
                                {!emailEnabled && !emailVerified && (
                                    <button
                                        onClick={() => {
                                            setEmailEnabled(true);
                                            setEmailCodeSent(true);
                                            console.log("Code sent!");
                                        }}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-500 transition"
                                    >
                                        Enable
                                    </button>
                                )}

                                {/* Enabled label */}
                                {emailVerified && (
                                    <span className="text-green-600 font-medium">Enabled</span>
                                )}
                            </div>

                            {/* Input + Verify (shown after Enable clicked) */}
                            {emailEnabled && !emailVerified && (
                                <div className="flex gap-2 items-center mt-2">
                                    <input
                                        type="text"
                                        value={emailCode}
                                        onChange={(e) => setEmailCode(e.target.value)}
                                        placeholder="Enter 6-digit code"
                                        className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                                    />
                                    <button
                                        onClick={handleEmailVerify}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                                    >
                                        Verify
                                    </button>
                                </div>
                            )}

                            {/* Code sent message */}
                            {emailCodeSent && !emailVerified && emailEnabled && (
                                <p className="mt-2 text-sm text-blue-600">✅ Code sent! Please verify.</p>
                            )}
                        </div>



                        {/* Google Authenticator */}
                        <div className="flex items-center justify-between border rounded-lg p-4 hover:shadow-md transition">
                            <div className="flex items-center gap-3">
                                <FaQrcode className="text-purple-500 text-2xl" />
                                <div>
                                    <h3 className="font-medium">Google Authenticator</h3>
                                    <p className="text-sm text-gray-500">
                                        Scan a QR code with Google Authenticator or Authy app.
                                    </p>
                                </div>
                            </div>
                            <button
                                disabled={isVerified}
                                onClick={() => setShowQR(true)}
                                className={`px-4 py-2 rounded-lg text-white ${isVerified
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-purple-500 hover:bg-purple-600"
                                    }`}
                            >
                                {isVerified ? "Enabled" : "Enable"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* QR Code Modal */}
            {showQR && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
                        <h3 className="text-xl font-semibold mb-4">Scan this QR Code</h3>
                        <div className="flex justify-center mb-4">
                            {otpAuthUrl && <QRCodeCanvas value={otpAuthUrl} size={180} />}
                        </div>
                        <p className="text-sm text-gray-500 mb-4 text-center">
                            Scan with Google Authenticator or Authy app and enter the code below.
                        </p>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter 6-digit code"
                            className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring focus:ring-purple-200"
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowQR(false)}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleVerify}
                                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                            >
                                Verify
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default SettingsPage;
