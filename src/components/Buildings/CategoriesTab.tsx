import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Tag, Building2, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddCategoryModal } from "./AddCategoryModal";
import { CategoryDetailsModal } from "./CategoryDetailsModal";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { formatDate } from "@/utils/dateUtils";
import { apiService } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export function CategoriesTab({
  isAddCategoryModalOpen,
  setIsAddCategoryModalOpen,
}) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("all");

  const [categoryDetailsModal, setCategoryDetailsModal] = useState<{
    isOpen: boolean;
    category: any;
  }>({
    isOpen: false,
    category: null,
  });

  const { categories, buildings } = useReferenceData();
  const activeBuildings = buildings.filter((b) => !b.archived);
  const totalBuildings = activeBuildings.length;

  const handleCategoryClick = (category: any) => {
    setCategoryDetailsModal({ isOpen: true, category });
  };

  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.label
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesBuilding =
      selectedBuildingId === "all" ||
      (category.buildingIds &&
        category.buildingIds.some((b) => b._id === selectedBuildingId));
    return matchesSearch && matchesBuilding;
  });

  return (
    <div className="space-y-6 ">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t("buildings.search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Select
            value={selectedBuildingId}
            onValueChange={setSelectedBuildingId}
          >
            <SelectTrigger className="w-full sm:w-48 relative hover:bg-accent/50">
              <SelectValue placeholder={t("buildings.linkedToBuildings")} />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="all">{t("buildings.allBuildingsFilter")}</SelectItem>
              {activeBuildings.map((building) => (
                <SelectItem key={building._id} value={building._id}>
                  {building.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>{t("buildings.name")}</TableHead>
              <TableHead>{t("buildings.linkedToBuildings")}</TableHead>
              <TableHead>{t("buildings.createdAt")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <TableRow
                  key={category._id}
                  className="p-4 hover:bg-accent/50 bg-background  cursor-pointer"
                  onClick={() => handleCategoryClick(category)}
                >
                  <TableCell style={{ paddingLeft: "1.2rem" }}>
                    <div className="bg-[#F1F5FE] w-10 h-10 rounded-md flex items-center justify-center">
                      <Tag className="w-6 h-6" color="#4D81ED" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium first-letter:uppercase">
                    {category?.label}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                      {category?.buildingIds?.filter((b: any) => !b.archived)
                        .length || 0}
                      /{totalBuildings}
                    </span>
                  </TableCell>
                  <TableCell className="first-letter:uppercase">
                    {formatDate(category.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={14}
                  className="text-center py-12 text-muted-foreground"
                >
                  <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>{t("buildings.noCategoriesFound")}</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
      />

      <CategoryDetailsModal
        isOpen={categoryDetailsModal.isOpen}
        onClose={() =>
          setCategoryDetailsModal({ isOpen: false, category: null })
        }
        category={categoryDetailsModal.category}
      />
    </div>
  );
}
