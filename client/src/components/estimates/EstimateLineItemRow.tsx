import React, { useEffect, useMemo, useCallback } from 'react';
import { Control, Controller, Path, UseFieldArrayRemove, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import Big from 'big.js';
import { GripVertical, Sparkles, Trash2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TableCell, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { EstimateLineItem } from '@/lib/api/estimates/api'; // Assuming this is the base type

// Define a specific type for the form values of a line item
// This might differ slightly from EstimateLineItem if e.g. numbers are stored as strings in form
export interface LineItemFormValues {
  id?: string; // Existing ID or undefined for new
  tempId?: string; // Client-side temporary ID for new items
  description: string;
  category: string;
  quantity: string; // Stored as string in form, parsed to number
  unit: string;
  unitPrice: string; // Stored as string in form, parsed to number
  markupPct: string; // Stored as string in form, parsed to number
  total: string; // Calculated, stored as string
  sortOrder: number;
}

// Define the shape of the entire estimate form values for context
interface EstimateFormValues {
  lineItems: LineItemFormValues[];
  // ... other estimate fields
}

interface EstimateLineItemRowProps {
  control: Control<EstimateFormValues>;
  index: number;
  remove: UseFieldArrayRemove;
  fieldId: string; // The `id` from useFieldArray's field object, for React key
  dragHandleProps?: any; // From dnd-kit useSortable
  isDragging?: boolean;  // From dnd-kit useSortable
  isFormSubmitting?: boolean;
  onGenerateAIDescription?: (index: number) => void;
  isGeneratingAIDescription?: boolean;
  watchField: UseFormWatch<EstimateFormValues>; // Pass watch from the main form
  setValueField: UseFormSetValue<EstimateFormValues>; // Pass setValue from the main form
}

const TABLE_CELL_STYLING = "p-2 align-top";

const calculateLineItemTotal = (
  quantityStr: string | number,
  unitPriceStr: string | number,
  markupPctStr: string | number
): Big => {
  try {
    const quantity = Big(Number(quantityStr) || 0);
    const unitPrice = Big(Number(unitPriceStr) || 0);
    const markupPct = Big(Number(markupPctStr) || 0);

    if (quantity.lt(0) || unitPrice.lt(0)) {
      return Big(0);
    }

    const baseTotal = quantity.times(unitPrice);
    const markupAmount = baseTotal.times(markupPct.div(100));
    return baseTotal.plus(markupAmount);
  } catch (e) {
    return Big(0);
  }
};

export const EstimateLineItemRow: React.FC<EstimateLineItemRowProps> = ({
  control,
  index,
  remove,
  fieldId,
  dragHandleProps,
  isDragging,
  isFormSubmitting,
  onGenerateAIDescription,
  isGeneratingAIDescription,
  watchField,
  setValueField,
}) => {
  const qtyValue = watchField(`lineItems.${index}.quantity` as Path<EstimateFormValues>);
  const priceValue = watchField(`lineItems.${index}.unitPrice` as Path<EstimateFormValues>);
  const markupValue = watchField(`lineItems.${index}.markupPct` as Path<EstimateFormValues>);

  const calculatedTotal = useMemo(() => {
    return calculateLineItemTotal(qtyValue, priceValue, markupValue);
  }, [qtyValue, priceValue, markupValue]);

  useEffect(() => {
    setValueField(`lineItems.${index}.total` as Path<EstimateFormValues>, calculatedTotal.toFixed(2));
  }, [calculatedTotal, index, setValueField]);

  const handleGenerateDescription = useCallback(() => {
    if (onGenerateAIDescription) {
      onGenerateAIDescription(index);
    }
  }, [onGenerateAIDescription, index]);

  return (
    <TableRow
      key={fieldId}
      className={cn(
        "group",
        isDragging && "opacity-50 bg-blue-100 dark:bg-blue-900/30",
        "hover:bg-slate-50 dark:hover:bg-slate-800/50"
      )}
    >
      <TableCell className={cn(TABLE_CELL_STYLING, "w-10 text-center cursor-grab p-0")}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-full w-full hover:bg-slate-200 dark:hover:bg-slate-700 rounded-none"
                {...dragHandleProps}
                disabled={isFormSubmitting}
                aria-label="Drag to reorder line item"
              >
                <GripVertical className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Drag to reorder</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>

      <TableCell className={cn(TABLE_CELL_STYLING, "min-w-[200px] w-2/5")}>
        <Controller
          name={`lineItems.${index}.description` as Path<EstimateFormValues>}
          control={control}
          defaultValue=""
          render={({ field, fieldState }) => (
            <div>
              <Textarea
                {...field}
                placeholder="Line item description"
                className="min-h-[40px] resize-none text-sm border-slate-300 dark:border-slate-600 focus:border-primary dark:focus:border-primary"
                rows={2}
                disabled={isFormSubmitting}
              />
              {fieldState.error && <p className="text-xs text-destructive mt-1">{fieldState.error.message}</p>}
            </div>
          )}
        />
      </TableCell>

      <TableCell className={cn(TABLE_CELL_STYLING, "min-w-[120px] w-[12%]")}>
        <Controller
          name={`lineItems.${index}.category` as Path<EstimateFormValues>}
          control={control}
          defaultValue=""
          render={({ field, fieldState }) => (
            <div>
              <Input
                {...field}
                placeholder="Category"
                className="text-sm border-slate-300 dark:border-slate-600 focus:border-primary dark:focus:border-primary"
                disabled={isFormSubmitting}
              />
              {fieldState.error && <p className="text-xs text-destructive mt-1">{fieldState.error.message}</p>}
            </div>
          )}
        />
      </TableCell>

      <TableCell className={cn(TABLE_CELL_STYLING, "min-w-[80px] w-[8%]")}>
        <Controller
          name={`lineItems.${index}.quantity` as Path<EstimateFormValues>}
          control={control}
          defaultValue="1"
          render={({ field, fieldState }) => (
            <div>
              <Input
                {...field}
                type="number"
                placeholder="Qty"
                className="text-sm text-right border-slate-300 dark:border-slate-600 focus:border-primary dark:focus:border-primary"
                min="0"
                step="0.01" // Allow decimals for hours, etc.
                disabled={isFormSubmitting}
                onChange={e => field.onChange(e.target.value === '' ? '' : e.target.value)} // Keep as string for RHF
              />
              {fieldState.error && <p className="text-xs text-destructive mt-1">{fieldState.error.message}</p>}
            </div>
          )}
        />
      </TableCell>
      
      <TableCell className={cn(TABLE_CELL_STYLING, "min-w-[80px] w-[8%]")}>
        <Controller
          name={`lineItems.${index}.unit` as Path<EstimateFormValues>}
          control={control}
          defaultValue=""
          render={({ field, fieldState }) => (
            <div>
              <Input
                {...field}
                placeholder="Unit"
                className="text-sm border-slate-300 dark:border-slate-600 focus:border-primary dark:focus:border-primary"
                disabled={isFormSubmitting}
              />
              {fieldState.error && <p className="text-xs text-destructive mt-1">{fieldState.error.message}</p>}
            </div>
          )}
        />
      </TableCell>

      <TableCell className={cn(TABLE_CELL_STYLING, "min-w-[100px] w-[10%]")}>
        <Controller
          name={`lineItems.${index}.unitPrice` as Path<EstimateFormValues>}
          control={control}
          defaultValue="0"
          render={({ field, fieldState }) => (
            <div>
              <Input
                {...field}
                type="number"
                placeholder="Unit Price"
                className="text-sm text-right border-slate-300 dark:border-slate-600 focus:border-primary dark:focus:border-primary"
                min="0"
                step="0.01"
                disabled={isFormSubmitting}
                onChange={e => field.onChange(e.target.value === '' ? '' : e.target.value)}
              />
              {fieldState.error && <p className="text-xs text-destructive mt-1">{fieldState.error.message}</p>}
            </div>
          )}
        />
      </TableCell>

      <TableCell className={cn(TABLE_CELL_STYLING, "min-w-[90px] w-[9%]")}>
        <Controller
          name={`lineItems.${index}.markupPct` as Path<EstimateFormValues>}
          control={control}
          defaultValue="0"
          render={({ field, fieldState }) => (
            <div>
              <Input
                {...field}
                type="number"
                placeholder="Markup %"
                className="text-sm text-right border-slate-300 dark:border-slate-600 focus:border-primary dark:focus:border-primary"
                min="0"
                step="0.1"
                disabled={isFormSubmitting}
                onChange={e => field.onChange(e.target.value === '' ? '' : e.target.value)}
              />
              {fieldState.error && <p className="text-xs text-destructive mt-1">{fieldState.error.message}</p>}
            </div>
          )}
        />
      </TableCell>

      <TableCell className={cn(TABLE_CELL_STYLING, "min-w-[100px] w-[10%] text-right font-medium")}>
        {formatCurrency(calculatedTotal.toNumber())}
      </TableCell>

      <TableCell className={cn(TABLE_CELL_STYLING, "w-20 text-right")}>
        <div className="flex items-center justify-end space-x-1">
          {onGenerateAIDescription && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    onClick={handleGenerateDescription}
                    disabled={isFormSubmitting || isGeneratingAIDescription}
                    aria-label="Generate description with AI"
                  >
                    {isGeneratingAIDescription ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>AI Assist Description</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive/80"
                  onClick={() => remove(index)}
                  disabled={isFormSubmitting}
                  aria-label="Delete line item"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete Line Item</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </TableCell>
    </TableRow>
  );
};
