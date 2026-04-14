import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useGalleryPhotos } from "../hooks/useQueries";

export function GalleryPage() {
  const { data: photos, isLoading, refetch } = useGalleryPhotos();

  // Immediately refetch when admin broadcasts a gallery update
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("gallery-update");
      channel.onmessage = (e: MessageEvent<{ type: string }>) => {
        if (e.data?.type === "gallery-updated") {
          void refetch();
        }
      };
    } catch {
      // BroadcastChannel not supported — polling via refetchInterval is the fallback
    }
    return () => {
      channel?.close();
    };
  }, [refetch]);

  const [selected, setSelected] = useState<string | null>(null);

  const allPhotos = (photos ?? [])
    .filter((p) => !p.caption.startsWith("__story_"))
    .map((p) => ({
      id: p.id,
      src: p.imageUrl.getDirectURL(),
      caption: p.caption,
    }));

  const selectedPhoto = allPhotos.find((p) => p.id === selected);

  return (
    <main className="min-h-screen">
      <section className="py-16 px-4 sm:px-6 bg-muted/20 text-center">
        <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">
          Visual Journey
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground">
          Gallery
        </h1>
        <p className="font-body text-muted-foreground mt-3 max-w-md mx-auto">
          Glimpses of our handmade world — from craft table to wrist.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Skeleton key={n} className="aspect-square rounded-2xl" />
            ))}
          </div>
        ) : allPhotos.length === 0 ? (
          <div className="text-center py-20" data-ocid="gallery.empty_state">
            <Sparkles className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <p className="font-body text-muted-foreground">
              Gallery coming soon! Photos added from the admin panel will appear
              here.
            </p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {allPhotos.map((photo, i) => (
              <button
                type="button"
                key={photo.id}
                className="relative break-inside-avoid rounded-2xl overflow-hidden cursor-pointer group shadow-soft w-full text-left"
                onClick={() => setSelected(photo.id)}
                data-ocid={`gallery.item.${i + 1}`}
              >
                <img
                  src={photo.src}
                  alt={photo.caption}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-all duration-300 flex items-end">
                  <p className="font-body text-sm text-background opacity-0 group-hover:opacity-100 transition-opacity p-4 leading-snug">
                    {photo.caption}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox */}
      {selected && selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
          onKeyDown={(e) => e.key === "Escape" && setSelected(null)}
          tabIndex={-1}
          data-ocid="gallery.modal"
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-background hover:text-background/70"
            onClick={() => setSelected(null)}
            data-ocid="gallery.close_button"
          >
            <X className="h-8 w-8" />
          </button>
          <div
            className="max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.src}
              alt={selectedPhoto.caption}
              className="w-full max-h-[80vh] object-contain rounded-2xl"
            />
            {selectedPhoto.caption && (
              <p className="font-body text-sm text-background/70 text-center mt-4">
                {selectedPhoto.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
