import { LogoTile } from "~/components/ui/LogoTile";

export function DonationFooter() {
  return (
    <div className="flex flex-col items-center gap-2 pb-2">
      <LogoTile variant="auto" imgClassName="h-6" textClassName="text-lg" />
      <p className="text-[11px] font-medium text-ink-label">
        Doações processadas via Pix · LinkPix
      </p>
    </div>
  );
}
