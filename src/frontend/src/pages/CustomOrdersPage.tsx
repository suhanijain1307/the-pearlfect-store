import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useSubmitCustomOrder } from "../hooks/useQueries";

export function CustomOrdersPage() {
  const submit = useSubmitCustomOrder();
  const [submitted, setSubmitted] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: "",
    contactNumber: "",
    designDescription: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let imageBlob: ExternalBlob | null = null;
    if (imageFile) {
      const buffer = await imageFile.arrayBuffer();
      imageBlob = ExternalBlob.fromBytes(new Uint8Array(buffer));
    }
    try {
      await submit.mutateAsync({
        name: form.name,
        contactNumber: form.contactNumber,
        designDescription: form.designDescription,
        inspirationImageUrl: imageBlob,
      });
      setSubmitted(true);
    } catch {
      toast.error("Failed to submit. Please try again.");
    }
  };

  if (submitted) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-4"
        data-ocid="custom-order.success_state"
      >
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-medium text-foreground mb-3">
            Request Received!
          </h1>
          <p className="font-body text-muted-foreground leading-relaxed">
            Thank you for reaching out. We'll review your custom design and get
            in touch with you soon.
          </p>
          <Button
            className="mt-8 rounded-full font-body bg-foreground text-background hover:bg-foreground/90"
            onClick={() => {
              setSubmitted(false);
              setForm({ name: "", contactNumber: "", designDescription: "" });
              setImageFile(null);
            }}
            data-ocid="custom-order.button"
          >
            Submit Another Request
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <section className="py-16 px-4 sm:px-6 bg-muted/20">
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">
            Bespoke Creation
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground mb-4">
            Custom Orders
          </h1>
          <p className="font-body text-muted-foreground leading-relaxed">
            Have a unique vision? We'd love to bring it to life. Share your
            design idea and we'll craft a one-of-a-kind piece just for you.
          </p>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-card rounded-3xl p-8 shadow-soft">
          <h2 className="font-display text-2xl font-medium text-foreground mb-6">
            Tell Us Your Vision
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label
                htmlFor="cust-name"
                className="font-body text-sm mb-1.5 block"
              >
                Your Name
              </Label>
              <Input
                id="cust-name"
                required
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Your full name"
                className="rounded-xl font-body"
                data-ocid="custom-order.input"
              />
            </div>
            <div>
              <Label
                htmlFor="cust-phone"
                className="font-body text-sm mb-1.5 block"
              >
                Contact Number
              </Label>
              <Input
                id="cust-phone"
                required
                type="tel"
                value={form.contactNumber}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactNumber: e.target.value }))
                }
                placeholder="+91 XXXXX XXXXX"
                className="rounded-xl font-body"
                data-ocid="custom-order.input"
              />
            </div>
            <div>
              <Label
                htmlFor="cust-desc"
                className="font-body text-sm mb-1.5 block"
              >
                Describe Your Design
              </Label>
              <Textarea
                id="cust-desc"
                required
                value={form.designDescription}
                onChange={(e) =>
                  setForm((f) => ({ ...f, designDescription: e.target.value }))
                }
                placeholder="Tell us about the colours, style, beads, occasion — anything you have in mind!"
                className="rounded-xl font-body min-h-[120px]"
                data-ocid="custom-order.textarea"
              />
            </div>
            <div>
              <Label
                htmlFor="cust-image"
                className="font-body text-sm mb-1.5 block"
              >
                Inspiration Image{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <label
                htmlFor="cust-image"
                className="flex items-center gap-3 p-4 border border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors"
                data-ocid="custom-order.dropzone"
              >
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="font-body text-sm text-muted-foreground">
                  {imageFile ? imageFile.name : "Upload an inspiration photo"}
                </span>
              </label>
              <input
                id="cust-image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
                data-ocid="custom-order.upload_button"
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-full font-body bg-foreground text-background hover:bg-foreground/90 py-3"
              disabled={submit.isPending}
              data-ocid="custom-order.submit_button"
            >
              {submit.isPending ? "Submitting..." : "Submit Custom Request"}
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
