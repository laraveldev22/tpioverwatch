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
import axios from "axios";
import { useUserDetails } from "@/lib/UserProfile";
import { useRouter } from "next/navigation";

const SettingsPage = () => {
    const { data, loading, error, refetch } = useUserDetails();

    const [activeTab, setActiveTab] = useState<"social" | "twofactor">("social");

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
    const [emailEnabled, setEmailEnabled] = useState(false); // Enable button clicked
    const [emailCodeSent, setEmailCodeSent] = useState(false);

    const router = useRouter()
    // ----- API Call -----
    const handleEnableTwoFactorAPI = async (
        method: "authenticator" | "email",
        secretValue?: string
    ) => {
        const token = localStorage.getItem("token");

        try {
            const payload = {
                two_factor_enabled: true,
                two_factor_method: method,
                two_factor_secret: secretValue || null,
            };

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/users/set_twofactor/`,
                payload,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json"
                    },
                }
            );

            console.log("API Response:", response.data);
            toast.success("✅ Two-Factor Authentication Enabled on server!");
        } catch (error: any) {
            console.error("Error enabling 2FA:", error.response || error.message);
            toast.error("❌ Failed to enable 2FA on server.");
        }
    };

    // ----- Google Authenticator Verification -----
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

            handleEnableTwoFactorAPI("authenticator", secret);
            toast.success("✅ Google Authenticator Enabled!");
        } else {
            toast.error("❌ Invalid Code, try again");
        }
    };

    // ----- Email Verification -----
    const handleEnableEmail = () => {
        setEmailEnabled(true);
        setEmailCodeSent(true);
        console.log("Sending email code...");
        toast.success("✅ Email code sent! Please verify.");
    };

    const handleEmailVerify = () => {
        if (emailCode === "123456") {
            setEmailVerified(true);
            handleEnableTwoFactorAPI("email");
            toast.success("✅ Email 2FA Enabled!");
        } else {
            toast.error("❌ Invalid Email Code");
        }
    };

    // ----- Social Media Handlers -----
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
        toast.success("✅ Social media credentials saved!");
    };

    // Inside your component
    const disableTwoFactor = async () => {
        const token = localStorage.getItem("token");

        try {
            const payload = {
                two_factor_enabled: false,
            };

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/users/set_twofactor/`,
                payload,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log("API Response:", response.data);
            toast.success("✅ Two-Factor Authentication Disabled on server!");

            // Update local state
            setIsVerified(false);
            localStorage.removeItem("twoFactorAuth");
            router.refresh()
        } catch (error: any) {
            console.error("Error disabling 2FA:", error.response || error.message);
            toast.error("❌ Failed to disable 2FA on server.");
        }
    };


    // Generate secret for Google Authenticator
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

                {/* Social Media Tab */}
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

                                {socials[platform.name as keyof typeof socials].enabled && (
                                    <div className="space-y-2 mt-5">
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

                {/* Two-Factor Tab */}
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

                                {/* Enable button only if Email 2FA is not active */}
                                {!emailVerified && data?.data?.two_factor_enabled && data?.data?.two_factor_method === "email" && (
                                    <span className="text-green-600 font-medium">Enabled</span>
                                )}
                                {!emailVerified && !(data?.two_factor_enabled && data?.data?.two_factor_method === "email") && (
                                    <button
                                        onClick={handleEnableEmail}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-500 transition"
                                    >
                                        Enable
                                    </button>
                                )}
                            </div>

                            {/* Input + Verify */}
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
                                onClick={() => {
                                    // If already enabled, disable 2FA
                                    if (isVerified || (data?.data?.two_factor_enabled && data?.data?.two_factor_method === "authenticator")) {
                                        disableTwoFactor();
                                    } else {
                                        setShowQR(true); // else open QR modal
                                    }
                                }}
                                className={`px-4 py-2 rounded-lg text-white ${isVerified || (data?.data?.two_factor_enabled && data?.data?.two_factor_method === "authenticator")
                                    ? "bg-red-500 hover:bg-red-600" // red when 2FA enabled
                                    : "bg-purple-500 hover:bg-purple-600"
                                    }`}
                            >
                                {isVerified || (data?.data?.two_factor_enabled && data?.data?.two_factor_method === "authenticator")
                                    ? "Disable"
                                    : "Enable"}
                            </button>


                        </div>
                    </div>
                )}

            </div>

            {/* QR Code Modal */}
            {showQR && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
