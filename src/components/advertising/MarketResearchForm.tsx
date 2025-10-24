import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface FormData {
  companyName: string;
  companyWebsite: string;
  competitor1: string;
  competitor2: string;
  competitor3: string;
  productDescription: string;
  clientAvatarDescription: string;
}

interface MarketResearchFormProps {
  onSubmitSuccess: (reportId: string) => void;
}

export const MarketResearchForm = ({ onSubmitSuccess }: MarketResearchFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    companyWebsite: "",
    competitor1: "",
    competitor2: "",
    competitor3: "",
    productDescription: "",
    clientAvatarDescription: "",
  });

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.companyName.trim()) {
      toast({
        title: "Validation Error",
        description: "Company name is required",
        variant: "destructive",
      });
      return;
    }

    if (!validateUrl(formData.companyWebsite)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid company website URL",
        variant: "destructive",
      });
      return;
    }

    if (!validateUrl(formData.competitor1) || !validateUrl(formData.competitor2) || !validateUrl(formData.competitor3)) {
      toast({
        title: "Validation Error",
        description: "Please enter valid URLs for all three competitors",
        variant: "destructive",
      });
      return;
    }

    if (formData.productDescription.trim().length < 50) {
      toast({
        title: "Validation Error",
        description: "Product description must be at least 50 characters",
        variant: "destructive",
      });
      return;
    }

    if (formData.clientAvatarDescription.trim().length < 50) {
      toast({
        title: "Validation Error",
        description: "Client avatar description must be at least 50 characters",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to create a market research report");
      }

      // Create the report record
      const { data: report, error: insertError } = await supabase
        .from("market_research_reports")
        .insert({
          user_id: user.id,
          company_name: formData.companyName,
          company_website: formData.companyWebsite,
          competitor_links: [formData.competitor1, formData.competitor2, formData.competitor3],
          product_description: formData.productDescription,
          client_avatar_description: formData.clientAvatarDescription,
          status: "pending",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Trigger the edge function to process the research
      const { error: functionError } = await supabase.functions.invoke("market-research", {
        body: {
          reportId: report.id,
          companyName: formData.companyName,
          companyWebsite: formData.companyWebsite,
          competitorLinks: [formData.competitor1, formData.competitor2, formData.competitor3],
          productDescription: formData.productDescription,
          clientAvatarDescription: formData.clientAvatarDescription,
        },
      });

      if (functionError) {
        console.error("Function error:", functionError);
        toast({
          title: "Processing Error",
          description: "Failed to start research processing. The report was created but processing could not begin.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Research Started",
          description: "Your market research report is being generated. This will take 5-10 minutes.",
        });
      }

      onSubmitSuccess(report.id);
      
      // Reset form
      setFormData({
        companyName: "",
        companyWebsite: "",
        competitor1: "",
        competitor2: "",
        competitor3: "",
        productDescription: "",
        clientAvatarDescription: "",
      });

    } catch (error) {
      console.error("Error creating market research report:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create market research report",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name *</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            placeholder="e.g., Acme Corporation"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyWebsite">Company Website *</Label>
          <Input
            id="companyWebsite"
            type="url"
            value={formData.companyWebsite}
            onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
            placeholder="https://example.com"
            required
          />
        </div>

        <div className="space-y-4">
          <Label>Top 3 Competitor Websites *</Label>
          <Input
            value={formData.competitor1}
            onChange={(e) => setFormData({ ...formData, competitor1: e.target.value })}
            placeholder="Competitor 1: https://competitor1.com"
            required
          />
          <Input
            value={formData.competitor2}
            onChange={(e) => setFormData({ ...formData, competitor2: e.target.value })}
            placeholder="Competitor 2: https://competitor2.com"
            required
          />
          <Input
            value={formData.competitor3}
            onChange={(e) => setFormData({ ...formData, competitor3: e.target.value })}
            placeholder="Competitor 3: https://competitor3.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="productDescription">Product/Service Description * (min 50 characters)</Label>
          <Textarea
            id="productDescription"
            value={formData.productDescription}
            onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
            placeholder="Describe your product or service in detail. What problems does it solve? What makes it unique?"
            rows={4}
            required
          />
          <p className="text-sm text-muted-foreground">
            {formData.productDescription.length} / 50 minimum characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientAvatarDescription">Ideal Client Avatar Description * (min 50 characters)</Label>
          <Textarea
            id="clientAvatarDescription"
            value={formData.clientAvatarDescription}
            onChange={(e) => setFormData({ ...formData, clientAvatarDescription: e.target.value })}
            placeholder="Describe your ideal customer in detail. Who are they? What do they care about? What are their pain points?"
            rows={4}
            required
          />
          <p className="text-sm text-muted-foreground">
            {formData.clientAvatarDescription.length} / 50 minimum characters
          </p>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Research Report...
            </>
          ) : (
            "Generate Market Research Report"
          )}
        </Button>
      </form>
    </Card>
  );
};