import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import type { IndividualPlan } from "@/hooks/queries/useIndividualPlansQuery";

interface CreateIndividualPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  existingPlans: IndividualPlan[];
  editPlan?: IndividualPlan | null;
}

export default function CreateIndividualPlanModal({
  open,
  onOpenChange,
  customerId,
  existingPlans,
  editPlan,
}: CreateIndividualPlanModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const usedCycles = existingPlans
    .filter((p) => !editPlan || p._id !== editPlan._id)
    .map((p) => p.billingCycle);

  const [billingCycle, setBillingCycle] = useState<string>(
    editPlan?.billingCycle || ""
  );
  const [displayPrice, setDisplayPrice] = useState(
    editPlan?.displayPrice?.toString() || ""
  );
  const [maxBuildings, setMaxBuildings] = useState(
    editPlan?.maxBuildings?.toString() || ""
  );

  const availableCycles = (["monthly", "yearly"] as const).filter(
    (c) => !usedCycles.includes(c)
  );

  const handleSubmit = async () => {
    if (!billingCycle || !displayPrice || !maxBuildings) return;

    setIsSubmitting(true);
    try {
      const payload = {
        customerId,
        displayPrice: parseFloat(displayPrice),
        billingCycle,
        maxBuildings: parseInt(maxBuildings, 10),
      };

      if (editPlan) {
        await apiService.patch(`/plans/individual/${editPlan._id}`, payload);
        toast({ title: "Plan updated successfully", variant: "success" as any });
      } else {
        await apiService.post("/plans/individual", payload);
        toast({ title: "Plan created successfully", variant: "success" as any });
      }

      queryClient.invalidateQueries({ queryKey: ["individualPlans", customerId] });
      onOpenChange(false);
      resetForm();
    } catch (err: any) {
      console.error("Plan error:", err);
      toast({
        title: editPlan ? "Failed to update plan" : "Failed to create plan",
        description: err?.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setBillingCycle("");
    setDisplayPrice("");
    setMaxBuildings("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editPlan ? "Edit Plan" : "Create Individual Plan"}</DialogTitle>
          <DialogDescription>
            {editPlan
              ? "Modify the plan parameters for this customer."
              : "Create a new individual pricing plan for this customer."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Billing Cycle *</Label>
            <Select
              value={billingCycle}
              onValueChange={setBillingCycle}
              disabled={!!editPlan}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select billing cycle" />
              </SelectTrigger>
              <SelectContent>
                {(editPlan
                  ? [editPlan.billingCycle]
                  : availableCycles
                ).map((cycle) => (
                  <SelectItem key={cycle} value={cycle}>
                    {cycle === "monthly" ? "Monthly" : "Yearly"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableCycles.length === 0 && !editPlan && (
              <p className="text-xs text-destructive">
                Both billing cycles are already in use.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Monthly Display Price (€) *</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 149"
              value={displayPrice}
              onChange={(e) => setDisplayPrice(e.target.value)}
            />
            {billingCycle === "yearly" && displayPrice && (
              <p className="text-xs text-muted-foreground">
                Yearly charge: €{(parseFloat(displayPrice) * 12).toFixed(2)} (
                {displayPrice} × 12)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Max. Buildings *</Label>
            <Input
              type="number"
              min="1"
              placeholder="e.g. 10"
              value={maxBuildings}
              onChange={(e) => setMaxBuildings(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !billingCycle ||
              !displayPrice ||
              !maxBuildings ||
              isSubmitting
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {editPlan ? "Updating..." : "Creating..."}
              </>
            ) : editPlan ? (
              "Update Plan"
            ) : (
              "Create Plan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
