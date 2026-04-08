import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCurrentUserQuery, useOrganizationQuery } from "@/hooks/queries";
import { apiUrl } from "@/services/api";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal = ({ isOpen, onClose }: ContactModalProps) => {
  const { data: currentUser } = useCurrentUserQuery();
  const { organization } = useOrganizationQuery();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
  });
  const [isSending, setIsSending] = useState(false);

  // Pre-fill form with user and organization data when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: currentUser?.Name && currentUser?.Last_Name 
          ? `${currentUser.Name} ${currentUser.Last_Name}` 
          : "",
        email: currentUser?.Email || "",
        company: organization?.name || "",
        phone: (currentUser as any)?.phone || "",
        message: "",
      });
    }
  }, [isOpen, currentUser, organization]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    try {
      const response = await fetch(`${apiUrl}/contact-sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: formData.company,
          contactFirstName: formData.name.split(' ')[0] || '',
          contactLastName: formData.name.split(' ').slice(1).join(' ') || '',
          email: formData.email,
          phone: formData.phone,
          description: formData.message,
          source: 'subscription-tab'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }
      
      onClose();
      toast.success("Message Sent!", {
        description: "Thank you for your interest. Our team will contact you within 24 hours.",
      });
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        company: "",
        phone: "",
        message: "",
      });
      
    } catch (error) {
      toast.error("Failed to Send", {
        description: "Please try again or contact us directly.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Contact Us for Enterprise
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@company.com"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="Your Company"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            
            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Tell us about your requirements, number of buildings, and any specific needs..."
                rows={4}
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSending}
              className="flex-1"
            >
              {isSending ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;