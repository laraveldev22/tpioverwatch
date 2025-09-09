"use client";

import { useState } from "react";
import {
  FaGlobe,
  FaCalendarAlt,
  FaFolderOpen,
  FaHashtag,
  FaSortAmountDown,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function Filters() {
  const [regionFilter, setRegionFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortFilter, setSortFilter] = useState("relevance");

  // Track which dropdown is currently open
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const handleOpenChange = (menu: string, isOpen: boolean) => {
    setOpenMenu(isOpen ? menu : null);
  };

  return (
    <div className="flex space-x-3 flex-wrap">
      {/* Region Dropdown */}
      <DropdownMenu onOpenChange={(open) => handleOpenChange("region", open)}>
        <DropdownMenuTrigger asChild>
          <Button className="flex items-center justify-between px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 w-44">
            <span className="flex items-center">
              <FaGlobe className="mr-2" /> {regionFilter}
            </span>
            {openMenu === "region" ? <FaChevronUp /> : <FaChevronDown />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-44">
          <DropdownMenuRadioGroup
            value={regionFilter}
            onValueChange={setRegionFilter}
          >
            <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="Australia">Australia</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="USA">USA</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="India">India</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Time Dropdown */}
      <DropdownMenu onOpenChange={(open) => handleOpenChange("time", open)}>
        <DropdownMenuTrigger asChild>
          <Button className="flex items-center justify-between px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 w-44">
            <span className="flex items-center">
              <FaCalendarAlt className="mr-2" /> {timeFilter}
            </span>
            {openMenu === "time" ? <FaChevronUp /> : <FaChevronDown />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-44">
          <DropdownMenuRadioGroup
            value={timeFilter}
            onValueChange={setTimeFilter}
          >
            <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="Past 24 hours">Past 24 hours</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="Past 48 hours">Past 48 hours</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="Past week">Past week</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Category Dropdown */}
      <DropdownMenu onOpenChange={(open) => handleOpenChange("category", open)}>
        <DropdownMenuTrigger asChild>
          <Button className="flex items-center justify-between px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 w-44">
            <span className="flex items-center">
              <FaFolderOpen className="mr-2" /> {categoryFilter}
            </span>
            {openMenu === "category" ? <FaChevronUp /> : <FaChevronDown />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-44">
          <DropdownMenuRadioGroup
            value={categoryFilter}
            onValueChange={setCategoryFilter}
          >
            <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="Business">Business</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="Technology">Technology</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="Sports">Sports</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="Entertainment">Entertainment</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Type Dropdown */}
      <DropdownMenu onOpenChange={(open) => handleOpenChange("type", open)}>
        <DropdownMenuTrigger asChild>
          <Button className="flex items-center justify-between px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 w-44">
            <span className="flex items-center">
              <FaHashtag className="mr-2" /> {typeFilter}
            </span>
            {openMenu === "type" ? <FaChevronUp /> : <FaChevronDown />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-44">
          <DropdownMenuRadioGroup
            value={typeFilter}
            onValueChange={setTypeFilter}
          >
            <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="Top Trend">Top Trend</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="Hot">Hot</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="Rising">Rising</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort Dropdown */}
      <DropdownMenu onOpenChange={(open) => handleOpenChange("sort", open)}>
        <DropdownMenuTrigger asChild>
          <Button className="flex items-center justify-between px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 w-44">
            <span className="flex items-center">
              <FaSortAmountDown className="mr-2" />
              {sortFilter === "relevance"
                ? "By relevance"
                : sortFilter === "latest"
                ? "Latest"
                : "Popular"}
            </span>
            {openMenu === "sort" ? <FaChevronUp /> : <FaChevronDown />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-44">
          <DropdownMenuRadioGroup
            value={sortFilter}
            onValueChange={setSortFilter}
          >
            <DropdownMenuRadioItem value="relevance">By relevance</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="latest">Latest</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="popular">Most Popular</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
