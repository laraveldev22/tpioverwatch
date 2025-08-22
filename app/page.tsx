

"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from 'nextjs-toploader/app';
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import Cookies from "js-cookie";

export default function SignInPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          setError(data.error || "Username and password are required");
        } else if (response.status === 401) {
          setError(data.error || "Invalid credentials");
        } else {
          setError("An error occurred during login");
        }
        return;
      }

      // Store token and user data in localStorage (client-side)
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Store token in cookie (for middleware/server-side)
      Cookies.set("token", data.token, { expires: 7, path: "/" }); // Expires in 7 days

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError("Network error. Please check your connection.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Blue background with logo */}
      <div className="flex-1 bg-gradient-to-br from-[#004682] to-[#000F1C] flex items-center justify-center p-4 lg:p-8 animate-fadeIn">
        <div className="text-center transform hover:scale-105 transition-transform duration-300">
          <Image
            src="/mainLogo.png"
            alt="TPI Logo"
            width={400}
            height={300}
            className="mx-auto animate-slideInLeft"
          />
        </div>
      </div>

      {/* Right side - Sign in form */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center p-4 lg:p-8 animate-fadeIn">
        <div className="w-full bg-slate-100 rounded-2xl shadow-lg p-6 lg:p-10 max-w-md space-y-6 transform hover:shadow-xl transition-all duration-300 animate-slideInRight">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-600">Welcome back please enter your details</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            {error && (
              <div className="text-red-500 text-sm mb-4 p-3 bg-red-50 rounded animate-slideInDown">{error}</div>
            )}
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
{/* 
            <div className="text-right">
              <Link href="#" className="text-sm text-[#416380] hover:text-blue-500">
                Forgot password
              </Link>
            </div> */}

            <Button
              type="submit"
              className="w-full bg-[#1e4a72] hover:bg-[#1a3f63] transform hover:scale-105 transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>

            {/*             <Button
              type="button"
              variant="outline"
              className="w-full bg-[#D5ECFF] hover:bg-[#B8E0FF] transform hover:scale-105 transition-all duration-200"
              onClick={() => router.push("/add-user")}
            >
              Add New User
            </Button> */}
          </form>
        </div>
      </div>
    </div>
  )
}
; <style jsx global>{`
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideInLeft {
    from { transform: translateX(-100px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideInRight {
    from { transform: translateX(100px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes slideInDown {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.8s ease-out;
  }
  
  .animate-slideInLeft {
    animation: slideInLeft 0.8s ease-out;
  }
  
  .animate-slideInRight {
    animation: slideInRight 0.8s ease-out;
  }

  .animate-slideInDown {
    animation: slideInDown 0.3s ease-out;
  }
`}</style>
