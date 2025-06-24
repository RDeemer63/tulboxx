import React, { useState, useEffect, useCallback } from "react";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Sparkles,
  Wand2,
  PlusCircle,
  Trash2,
  GripVertical,
  ChevronDown,
  Info,
} from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PromptBuilder } from "@/services/ai-prompt-builder";
import { cn, formatCurrency } from "@/lib/utils";

// --- Type Definitions ---
// Assuming the form values are managed by the parent component's FormProvider
// and we can access them via useFormContext.

type LineItem = {
  id: string;
  type: "lineItem";
  description: string;
  quantity: number;
  unitPrice: number;
  taxable: boolean;
  category: string;
};

type SectionHeader = {
  id: string;
  type: "sectionHeader";
  title: string;
};

type EstimateItem = LineItem | SectionHeader;

// --- Sub-Components ---

const SortableItem: React.FC<{
  item: EstimateItem;
  index: number;
  expandedItems: Set<string>;
  toggleExpand: (id: string) => void;
  onDelete: (index: number) => void;
}> = ({ item, index, expandedItems, toggleExpand, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  if (item.type === "sectionHeader") {
    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        <SectionHeaderRow
          index={index}
          listeners={listeners}
          onDelete={onDelete}
        />
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <LineItemRow
        index={index}
        isExpanded={expandedItems.has(item.id)}
        toggleExpand={() => toggleExpand(item.id)}
        listeners={listeners}
        onDelete={onDelete}
      />
    </div>
  );
};

const SectionHeaderRow: React.FC<{
  index: number;
  listeners: any;
  onDelete: (index: number) => void;
}> = ({ index, listeners, onDelete }) => {
  const form = useFormContext();
  return (
    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2 border-b dark:border-slate-700">
      <Button
        variant="ghost"
        size="icon"
        className="cursor-grab h-8 w-8"
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </Button>
      <FormField
        control={form.control}
        name={`lineItems.${index}.title`}
        render={({ field }) => (
          <Input
            {...field}
            placeholder="Section Title (e.g., 'Site Preparation')"
            className="flex-1 font-semibold border-none bg-transparent"
          />
        )}
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive"
        onClick={() => onDelete(index)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

const LineItemRow: React.FC<{
  index: number;
  isExpanded: boolean;
  toggleExpand: () => void;
  listeners: any;
  onDelete: (index: number) => void;
}> = ({ index, isExpanded, toggleExpand, listeners, onDelete }) => {
  const form = useFormContext();
  const item = form.watch(`lineItems.${index}`);
  const total = (item.quantity || 0) * (item.unitPrice || 0);

  return (
    <div
      className={cn(
        "border-b dark:border-slate-700",
        isExpanded && "bg-slate-50 dark:bg-slate-800/50"
      )}
    >
      <div
        className="flex items-center gap-2 p-2 cursor-pointer"
        onClick={toggleExpand}
      >
        <Button
          variant="ghost"
          size="icon"
          className="cursor-grab h-8 w-8"
          {...listeners}
          onClick={(e) => e.stopPropagation()} // Prevent toggle on drag
        >
          <GripVertical className="h-4 w-4" />
        </Button>
        <div className="flex-1 truncate">
          <p className="font-medium">{item.description || "New Item"}</p>
          <p className="text-xs text-muted-foreground">
            {item.quantity || 0} x {formatCurrency(item.unitPrice || 0)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold">
            {formatCurrency(total)}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isExpanded && "rotate-180"
            )}
          />
        </div>
      </div>
      {isExpanded && (
        <div className="p-4 pt-2 space-y-4 border-t dark:border-slate-700">
          <FormField
            control={form.control}
            name={`lineItems.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Detailed service description..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name={`lineItems.${index}.quantity`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`lineItems.${index}.unitPrice`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Price</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onDelete(index)}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete Item
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Component ---

export const DetailedEstimateView: React.FC = () => {
  const form = useFormContext();
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "lineItems",
  });

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [activeItem, setActiveItem] = useState<EstimateItem | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragEndEvent) => {
    const { active } = event;
    setActiveItem(fields.find((field) => field.id === active.id) as EstimateItem);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);
      move(oldIndex, newIndex);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Line Items</h3>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                id: crypto.randomUUID(),
                type: "sectionHeader",
                title: "New Section",
              })
            }
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Add Section
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() =>
              append({
                id: crypto.randomUUID(),
                type: "lineItem",
                description: "",
                quantity: 1,
                unitPrice: 0,
                taxable: true,
                category: "other",
              })
            }
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Add Line Item
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={fields.map((field) => field.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="rounded-lg border dark:border-slate-700">
            {fields.map((item, index) => (
              <SortableItem
                key={item.id}
                item={item as EstimateItem}
                index={index}
                expandedItems={expandedItems}
                toggleExpand={toggleExpand}
                onDelete={remove}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeItem ? (
            <div className="bg-card shadow-lg rounded-lg">
              <SortableItem
                item={activeItem}
                index={-1}
                expandedItems={new Set()}
                toggleExpand={() => {}}
                onDelete={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* PricingSummary will be implemented separately */}
      <div className="pt-6">
        <h3 className="text-lg font-semibold">Pricing Summary</h3>
        <p className="text-muted-foreground text-sm">
          (Pricing summary with totals, tax, and discount controls will go
          here.)
        </p>
      </div>
    </div>
  );
};

export default DetailedEstimateView;
