"use client";

import type React from "react";
import { useState, useRef } from "react";
import { useRouter } from "nextjs-toploader/app";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Cookies from "js-cookie";
import { ImSpinner2 } from "react-icons/im";
import { toast } from "react-hot-toast";
import { authenticator } from "otplib";

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);
  const [token, setToken] = useState("")

  const router = useRouter();
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Login failed ❌");
        return;
      }

      if (data.user.two_factor_enabled) {
        setTwoFactorSecret(data.user.two_factor_secret);
        setShow2FA(true);
        setToken(data.token)
        toast("Enter your 2FA code");
      } else {
        Cookies.set("token", data.token, { expires: 1, path: "/" });
        localStorage.setItem("token", data.token);
        toast.success("Login successful 🎉");
        router.refresh();
      }
    } catch (err) {
      toast.error("Network error ❌");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return; // allow only numbers
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // only one digit
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    if (!value && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify2FA = () => {
    if (!twoFactorSecret) return;
    const code = otp.join("");
    const verified = authenticator.check(code, twoFactorSecret);

    if (verified) {
      toast.success("✅ 2FA Verified! You are logged in.");
      localStorage.setItem("token", token);
      Cookies.set("token", token, { expires: 1, path: "/" });
      router.refresh();
    } else {
      toast.error("❌ Invalid 2FA code, try again");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side */}
      <div className="flex-1 bg-gradient-to-br from-[#004682] to-[#000F1C] flex items-center justify-center p-4 lg:p-8 animate-fadeIn">
        <div className="text-center transition-transform duration-300">
          <Image src="/mainLogo.png" alt="TPI Logo" width={400} height={300} className="mx-auto" />
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center p-4 lg:p-8 animate-fadeIn">
        <div className="w-full bg-slate-100 rounded-2xl shadow-lg p-6 lg:p-10 max-w-md space-y-6 transform hover:shadow-xl transition-all duration-300 animate-slideInRight">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {show2FA ? "Two-Factor Authentication" : "Welcome back"}
            </h2>
            <p className="text-gray-600">
              {show2FA
                ? "Enter the 6-digit code from your authenticator app."
                : "Sign in to continue to your account"}
            </p>
          </div>

          {!show2FA ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 transition-all duration-200 focus:scale-105"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#1e4a72] hover:bg-[#1a3f63] flex items-center justify-center gap-2 transform hover:scale-105 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <ImSpinner2 className="animate-spin text-white" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input
                    title="input"
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    ref={(el) => { otpRefs.current[idx] = el; }} // ✅ TS safe
                    className="w-12 h-12 text-center border rounded-lg text-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ))}
              </div>
              <Button
                onClick={handleVerify2FA}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded transition-all duration-200"
              >
                Verify
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
