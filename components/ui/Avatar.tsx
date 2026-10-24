import Image from "next/image";
import { initials } from "@/lib/format";
import { publicImageUrl } from "@/lib/storage";

interface AvatarProps {
  name: string;
  photoPath: string | null;
  photoAlt?: string | null;
  size?: number;
  className?: string;
}

// Trustee portrait, or an elegant monogram when no photo is available.
export function Avatar({ name, photoPath, photoAlt, size = 96, className = "" }: AvatarProps) {
  const url = publicImageUrl(photoPath);
  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full ring-1 ring-line ${className}`}
      style={{ width: size, height: size }}
    >
      {url ? (
        <Image
          src={url}
          alt={photoAlt || `Portrait of ${name}`}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="grid h-full w-full place-items-center bg-brand-50 font-display font-medium text-brand"
          style={{ fontSize: size * 0.34 }}
        >
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
            <path d="M14 70 A 40 40 0 0 1 50 10" fill="none" stroke="#3189d5" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />
            <path d="M86 70 A 40 40 0 0 0 50 10" fill="none" stroke="#8bcb55" strokeOpacity="0.6" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="relative">{initials(name)}</span>
        </span>
      )}
    </span>
  );
}
