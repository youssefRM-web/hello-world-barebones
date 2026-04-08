
import React from "react";
import { Home, MapPin, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const Rooms = () => {
  const mockRooms = [
    {
      id: 1,
      name: "Office 101",
      type: "Office",
      floor: "1st Floor",
      capacity: 4,
      assets: 12,
      status: "Occupied",
      area: "25 m²"
    },
    {
      id: 2,
      name: "Conference Room A",
      type: "Meeting Room",
      floor: "2nd Floor",
      capacity: 12,
      assets: 8,
      status: "Available",
      area: "40 m²"
    },
    {
      id: 3,
      name: "Storage Room",
      type: "Storage",
      floor: "Basement",
      capacity: 0,
      assets: 25,
      status: "Maintenance",
      area: "15 m²"
    },
    {
      id: 4,
      name: "Kitchen",
      type: "Common Area",
      floor: "1st Floor",
      capacity: 8,
      assets: 15,
      status: "Available",
      area: "30 m²"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800";
      case "Occupied":
        return "bg-customBlue text-blue-800";
      case "Maintenance":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
          Rooms & Assets
        </h1>
        <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Room
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search rooms..." className="pl-9" />
        </div>
        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
          <option>All Floors</option>
          <option>1st Floor</option>
          <option>2nd Floor</option>
          <option>Basement</option>
        </select>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockRooms.map((room) => (
          <div key={room.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-customBlue rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{room.name}</h3>
                  <p className="text-sm text-gray-600">{room.type}</p>
                </div>
              </div>
              <Badge className={getStatusColor(room.status)}>
                {room.status}
              </Badge>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                {room.floor}
              </div>
              <div className="text-sm text-gray-600">
                Area: {room.area}
              </div>
              {room.capacity > 0 && (
                <div className="text-sm text-gray-600">
                  Capacity: {room.capacity} people
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {room.assets} assets
              </span>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rooms;
