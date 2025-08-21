"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AddUserPage() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    retypePassword: "",
    accountType: "",
  })
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
    // Redirect back to sign in
    router.push("/")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Blue background with logo */}
      <div className="flex-1 bg-[#1e4a72] flex items-center justify-center p-4 lg:p-8 animate-fadeIn">
        <div className="text-center transform hover:scale-105 transition-transform duration-300">
          <Image 
            src="/Group 304.svg" 
            alt="TPI Logo" 
            width={400} 
            height={300} 
            className="mx-auto animate-slideInLeft" 
          />
        </div>
      </div>

      {/* Right side - Add user form */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center p-4 lg:p-8 animate-fadeIn">
        <div className="w-full bg-slate-100 shadow-lg p-6 lg:p-10 max-w-md space-y-6 transform hover:shadow-xl transition-all duration-300 animate-slideInRight">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Add New User</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="mt-1 transition-all duration-200 focus:scale-105"
                required
              />
            </div>

            <div>
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
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
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="mt-1 transition-all duration-200 focus:scale-105"
                required
              />
            </div>

            <div>
              <Label htmlFor="retypePassword" className="text-sm font-medium text-gray-700">
                Retype Password
              </Label>
              <Input
                id="retypePassword"
                type="password"
                placeholder="Retype Password"
                value={formData.retypePassword}
                onChange={(e) => handleInputChange("retypePassword", e.target.value)}
                className="mt-1 transition-all duration-200 focus:scale-105"
                required
              />
            </div>

            <div>
              <Label htmlFor="accountType" className="text-sm font-medium text-gray-700">
                Account Type
              </Label>
              <Select onValueChange={(value) => handleInputChange("accountType", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Account Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="newsletter">Newsletter User</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full bg-[#1e4a72] hover:bg-[#1a3f63] transform hover:scale-105 transition-all duration-200">
              Create new user
            </Button>

            <Button type="button" variant="outline" className="w-full bg-[#D5ECFF] hover:bg-[#B8E0FF] transform hover:scale-105 transition-all duration-200" onClick={() => router.push("/")}>
              Back to Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
