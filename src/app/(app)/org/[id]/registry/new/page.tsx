"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const AI_TYPES = [
  "Machine Learning",
  "Deep Learning",
  "Natural Language Processing",
  "Computer Vision",
  "Generative AI",
  "Robotic Process Automation",
  "Recommendation System",
  "Speech Recognition",
  "Other",
];

export default function NewRegistryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    vendor: "",
    vendorType: "",
    aiType: [] as string[],
    purpose: "",
    department: "",
    businessOwner: "",
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAiType = (type: string) => {
    setForm((prev) => ({
      ...prev,
      aiType: prev.aiType.includes(type)
        ? prev.aiType.filter((t) => t !== type)
        : [...prev.aiType, type],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/org-assessments/${params.id}/systems`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to create AI system");

      router.push(`/org/${params.id}/registry`);
    } catch (error) {
      console.error("Error creating AI system:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">
        Add AI System
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>System Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">System Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g., Customer Support Chatbot"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Describe what this AI system does..."
                required
              />
            </div>

            {/* Vendor */}
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Input
                id="vendor"
                value={form.vendor}
                onChange={(e) => updateField("vendor", e.target.value)}
                placeholder="e.g., OpenAI, Anthropic, Internal"
              />
            </div>

            {/* Vendor Type */}
            <div className="space-y-2">
              <Label>Vendor Type</Label>
              <Select
                value={form.vendorType}
                onValueChange={(value) => updateField("vendorType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INTERNAL">Internal</SelectItem>
                  <SelectItem value="THIRD_PARTY">Third Party</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* AI Type (multi-select checkboxes) */}
            <div className="space-y-3">
              <Label>AI Type</Label>
              <div className="grid grid-cols-2 gap-3">
                {AI_TYPES.map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={form.aiType.includes(type)}
                      onCheckedChange={() => toggleAiType(type)}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <Label>Purpose</Label>
              <Select
                value={form.purpose}
                onValueChange={(value) => updateField("purpose", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DECISION_SUPPORT">
                    Decision Support
                  </SelectItem>
                  <SelectItem value="AUTOMATION">Automation</SelectItem>
                  <SelectItem value="ANALYTICS">Analytics</SelectItem>
                  <SelectItem value="CUSTOMER_FACING">
                    Customer Facing
                  </SelectItem>
                  <SelectItem value="INTERNAL_TOOL">Internal Tool</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={form.department}
                onChange={(e) => updateField("department", e.target.value)}
                placeholder="e.g., Engineering, Marketing, HR"
                required
              />
            </div>

            {/* Business Owner */}
            <div className="space-y-2">
              <Label htmlFor="businessOwner">Business Owner</Label>
              <Input
                id="businessOwner"
                value={form.businessOwner}
                onChange={(e) => updateField("businessOwner", e.target.value)}
                placeholder="e.g., Jane Smith"
                required
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/org/${params.id}/registry`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add AI System"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
