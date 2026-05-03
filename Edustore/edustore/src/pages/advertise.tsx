import { useState } from "react";
import { submitAdApplication } from "@/hooks/use-ads";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Megaphone, CheckCircle2 } from "lucide-react";

export default function Advertise() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    businessName: "",
    contactEmail: "",
    contactPhone: "",
    adType: "ribbon",
    description: "",
    includeInBooks: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, adType: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, includeInBooks: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitAdApplication({
        ...formData,
        adType: formData.adType as any,
      });
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-lg">
        <CheckCircle2 className="mx-auto h-20 w-20 text-emerald-500 mb-6" />
        <h1 className="text-3xl font-serif font-bold text-foreground mb-4">Application Received</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Thank you for your interest in advertising with EduStore. Our team will review your application and contact you shortly.
        </p>
        <Button onClick={() => setIsSuccess(false)} variant="outline">
          Submit Another Application
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <Megaphone className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Advertise With Us</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Reach thousands of dedicated students and educators by placing your brand on EduStore.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-primary text-primary-foreground border-none">
            <CardHeader>
              <CardTitle className="font-serif">Ad Formats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-bold">Ribbon Ads</h4>
                <p className="text-sm opacity-90">High-visibility banner across the top of all pages.</p>
              </div>
              <div>
                <h4 className="font-bold">Popup Ads</h4>
                <p className="text-sm opacity-90">Modal dialog that captures attention upon entry.</p>
              </div>
              <div>
                <h4 className="font-bold">Redirect Ads</h4>
                <p className="text-sm opacity-90">Clickable cards featured on the homepage.</p>
              </div>
              <div>
                <h4 className="font-bold">In-Book Placements</h4>
                <p className="text-sm opacity-90">Special mention inside printed physical copies.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Why EduStore?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground list-disc pl-4">
                <li>Highly targeted academic audience</li>
                <li>Trusted, curated environment</li>
                <li>Premium physical book buyers</li>
                <li>Flexible pricing models</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Application Form</CardTitle>
              <CardDescription>
                Tell us about your campaign. We'll get back to you with pricing and availability.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input 
                      id="businessName" 
                      name="businessName" 
                      value={formData.businessName} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="adType">Preferred Ad Type</Label>
                    <Select value={formData.adType} onValueChange={handleSelectChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ribbon">Ribbon Ad</SelectItem>
                        <SelectItem value="redirect">Redirect Ad</SelectItem>
                        <SelectItem value="popup">Popup Ad</SelectItem>
                        <SelectItem value="in-book">In-Book Placement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input 
                      id="contactEmail" 
                      name="contactEmail" 
                      type="email" 
                      value={formData.contactEmail} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input 
                      id="contactPhone" 
                      name="contactPhone" 
                      type="tel" 
                      value={formData.contactPhone} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Campaign Description & Goals</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    rows={4} 
                    value={formData.description} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div className="flex items-center space-x-2 border p-4 rounded-lg bg-muted/20">
                  <Checkbox 
                    id="includeInBooks" 
                    checked={formData.includeInBooks} 
                    onCheckedChange={handleCheckboxChange} 
                  />
                  <Label htmlFor="includeInBooks" className="font-normal cursor-pointer leading-snug">
                    I am also interested in having my ad printed directly inside physical books (premium placement).
                  </Label>
                </div>

                <Button type="submit" className="w-full h-12 text-lg hover-elevate" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  Submit Application
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
