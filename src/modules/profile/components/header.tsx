import { CheckBadgeIcon } from "@/components/icons/check-badge";
import { CreatorAvatar } from "@/components/ui/creator-avatar";
import { sampleCreator } from "@/data";

export function Header() {
  return (
    <header className="text-center mx-auto max-w-130">
      <CreatorAvatar
        name={sampleCreator.name}
        photoUrl={sampleCreator.profilePhotoUrl}
      />
      <div className="mt-4 flex items-center justify-center">
        <h1 className="text-lg font-medium">{sampleCreator.name}</h1>

        <div className="pt-1">
          <CheckBadgeIcon />
        </div>
      </div>
      <p className="mt-0.7 mb-3 text-sm text-muted-text">
        {sampleCreator.handle} <span aria-hidden="true">·</span>{" "}
        {sampleCreator.category}
      </p>
      <p className="mx-auto max-w-82 font-medium text-sm leading-normal text-pretty">
        {sampleCreator.bio}
      </p>
    </header>
  );
}
