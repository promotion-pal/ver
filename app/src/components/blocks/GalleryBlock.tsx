import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger as DialogTriggerPrimitive,
} from "@/components/ui/dialog";
import type { Block } from "@/data/types";

export function GalleryBlock({ block }: { block: Extract<Block, { type: "gallery" }> }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {block.items.map((item) => (
        <Dialog key={item.src}>
          <figure className="overflow-hidden rounded-lg border bg-card">
            <DialogTrigger src={item.src} caption={item.caption} />
            <figcaption className="space-y-0.5 px-3 py-2.5">
              <div className="text-sm font-medium">{item.caption}</div>
              {item.description ? (
                <p className="text-xs text-muted-foreground">{item.description}</p>
              ) : null}
            </figcaption>
          </figure>
          <DialogContent
            showCloseButton
            className="max-w-[min(90vw,64rem)] gap-2 p-2 sm:max-w-[min(90vw,64rem)]"
          >
            <DialogTitle className="sr-only">{item.caption}</DialogTitle>
            {item.description ? (
              <DialogDescription className="sr-only">{item.description}</DialogDescription>
            ) : null}
            <img
              src={item.src}
              alt={item.caption}
              className="max-h-[80vh] w-full rounded-md object-contain"
            />
            <div className="px-2 pb-1">
              <div className="text-sm font-medium">{item.caption}</div>
              {item.description ? (
                <p className="text-xs text-muted-foreground">{item.description}</p>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}

function DialogTrigger({ src, caption }: { src: string; caption: string }) {
  return (
    <DialogTriggerPrimitive
      render={
        <button type="button" className="block w-full cursor-zoom-in">
          <img src={src} alt={caption} className="w-full border-b" />
        </button>
      }
    />
  );
}
