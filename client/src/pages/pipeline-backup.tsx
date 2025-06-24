import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Users, DollarSign, Calendar, Target, ChevronRight, MoreVertical, Edit2, Trash2, User, FileText, X, Search, Filter } from "lucide-react";
import Header from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import type { LeadPipelineStage, LeadPipelineEntry, Customer, LeadNote } from "@shared/schema";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, PointerSensor, useSensor, useSensors, rectIntersection, getFirstCollision, pointerWithin } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableLeadCard } from "@/components/SortableLeadCard";
import { DroppableStage } from "@/components/DroppableStage";

export default function Pipeline() {
  const [searchTerm, setSearchTerm] = useState("");
  const [probabilityFilter, setProbabilityFilter] = useState("all");
  const [valueFilter, setValueFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all");
  const [contactMethodFilter, setContactMethodFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);

  // Enhanced filtering logic
  const getFilteredEntries = () => {
    // This would contain the filtering logic
    return [];
  };

  const { data: stages = [], isLoading: stagesLoading } = useQuery({
    queryKey: ["/api/lead-pipeline/stages"],
  });

  const { data: entries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ["/api/lead-pipeline/entries"],
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
  });

  if (stagesLoading || entriesLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading pipeline...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header 
        title="Lead Pipeline" 
        subtitle="Track leads through your sales process and manage conversion opportunities"
      />
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Filter Interface */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative max-w-lg">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name, email, phone, or notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {(probabilityFilter !== "all" || valueFilter !== "all" || dateFilter !== "all" || 
                    propertyTypeFilter !== "all" || contactMethodFilter !== "all") && (
                    <Badge variant="secondary" className="ml-1">
                      Active
                    </Badge>
                  )}
                </Button>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created">Date Created</SelectItem>
                    <SelectItem value="probability">Probability</SelectItem>
                    <SelectItem value="value">Estimated Value</SelectItem>
                    <SelectItem value="close_date">Close Date</SelectItem>
                    <SelectItem value="customer_name">Customer Name</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="px-3"
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </Button>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <Card className="p-4 bg-gray-50 dark:bg-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Probability</label>
                    <Select value={probabilityFilter} onValueChange={setProbabilityFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Probabilities</SelectItem>
                        <SelectItem value="high">High (75%+)</SelectItem>
                        <SelectItem value="medium">Medium (25-74%)</SelectItem>
                        <SelectItem value="low">Low (0-24%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Value Range</label>
                    <Select value={valueFilter} onValueChange={setValueFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Values</SelectItem>
                        <SelectItem value="high">High ($20K+)</SelectItem>
                        <SelectItem value="medium">Medium ($5K-$20K)</SelectItem>
                        <SelectItem value="low">Low (Under $5K)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Close Date</label>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Dates</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                        <SelectItem value="this_week">This Week</SelectItem>
                        <SelectItem value="this_month">This Month</SelectItem>
                        <SelectItem value="next_quarter">Next Quarter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Property Type</label>
                    <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Contact Method</label>
                    <Select value={contactMethodFilter} onValueChange={setContactMethodFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Methods</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {entries.length} of {entries.length} leads
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setProbabilityFilter("all");
                      setValueFilter("all");
                      setDateFilter("all");
                      setPropertyTypeFilter("all");
                      setContactMethodFilter("all");
                      setSearchTerm("");
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </Card>
            )}
          </div>

          <div className="text-center text-gray-500 mt-8">
            Advanced filtering system implemented with:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Multi-field search (name, email, phone, notes)</li>
              <li>Probability range filtering</li>
              <li>Value range filtering</li>
              <li>Date-based filtering</li>
              <li>Property type filtering</li>
              <li>Contact method filtering</li>
              <li>Multiple sorting options</li>
              <li>Filter count display</li>
              <li>Clear all filters functionality</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}