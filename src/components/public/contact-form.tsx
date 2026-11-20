"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WhatsAppIcon } from "@/components/icons/whatsapp";
import { toast } from "sonner";
import { generalWhatsAppUrl } from "@/lib/whatsapp";

interface FormValues {
  name: string;
  phone: string;
  email: string;
  message: string;
}

type FieldName = keyof FormValues;
type FieldErrors = Partial<Record<FieldName, string>>;

const PHONE_REGEX = /^[+0-9()\s-]{7,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY_FORM: FormValues = { name: "", phone: "", email: "", message: "" };

function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (values.name.trim().length < 2) {
    errors.name = "Please enter your name (at least 2 characters).";
  }
  if (!PHONE_REGEX.test(values.phone.trim())) {
    errors.phone = "Please enter a valid phone number.";
  }
  if (values.email.trim() && !EMAIL_REGEX.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (values.message.trim().length < 10) {
    errors.message = "Please tell us a bit more (at least 10 characters).";
  }
  return errors;
}

type ContactFormProps = {
  whatsappNumber: string;
};

/** Public contact form — posts to /api/inquiries with inline validation. */
export function ContactForm({ whatsappNumber }: ContactFormProps) {
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (field: FieldName, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          phone: values.phone.trim(),
          email: values.email.trim() || undefined,
          message: values.message.trim(),
        }),
      });
      const data: { error?: string } = await res.json().catch(() => ({}));

      if (res.status === 201) {
        toast.success("Message sent! We will get back to you shortly.");
        setValues(EMPTY_FORM);
        setErrors({});
      } else {
        toast.error(
          data.error ??
            "Failed to send your message. Please try again or reach us on WhatsApp."
        );
      }
    } catch (error) {
      console.error("Failed to submit inquiry:", error);
      toast.error("Something went wrong. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldError = (field: FieldName) =>
    errors[field] ? (
      <p id={`${field}-error`} className="text-xs text-destructive">
        {errors[field]}
      </p>
    ) : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="contact-name">
          Name <span className="text-destructive" aria-hidden="true">*</span>
        </Label>
        <Input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Your full name"
          value={values.name}
          onChange={(e) => setField("name", e.target.value)}
          className="h-11"
          aria-required="true"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {fieldError("name")}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-phone">
          Phone <span className="text-destructive" aria-hidden="true">*</span>
        </Label>
        <Input
          id="contact-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+255 7XX XXX XXX"
          value={values.phone}
          onChange={(e) => setField("phone", e.target.value)}
          className="h-11"
          aria-required="true"
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "phone-error" : undefined}
        />
        {fieldError("phone")}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-email">Email (optional)</Label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={(e) => setField("email", e.target.value)}
          className="h-11"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {fieldError("email")}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">
          Message <span className="text-destructive" aria-hidden="true">*</span>
        </Label>
        <Textarea
          id="contact-message"
          name="message"
          rows={5}
          placeholder="How can we help you? Tell us about the vehicle you are looking for..."
          value={values.message}
          onChange={(e) => setField("message", e.target.value)}
          className="min-h-32 resize-y"
          aria-required="true"
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        {fieldError("message")}
      </div>

      <div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full bg-charcoal text-white hover:bg-charcoal/90 sm:w-auto sm:px-8"
          aria-label="Send message to Elly Magari"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Sending...
            </>
          ) : (
            "Send Message"
          )}
        </Button>
        <p className="mt-3 text-sm text-muted-foreground">
          Prefer instant replies?{" "}
          <a
            href={generalWhatsAppUrl(whatsappNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-gold underline-offset-2 hover:underline"
          >
            <WhatsAppIcon className="size-3.5" aria-hidden="true" />
            WhatsApp us instead
          </a>
        </p>
      </div>
    </form>
  );
}
