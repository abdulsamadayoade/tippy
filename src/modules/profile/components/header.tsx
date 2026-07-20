import { CheckBadgeIcon } from "@/components/icons/check-badge";
import { CreatorAvatar } from "@/components/ui/creator-avatar";
import type { PublicCreator } from "../types";

export function Header({ creator }: { creator: PublicCreator }) {
  return (
    <header className="text-center mx-auto max-w-130">
      <CreatorAvatar name={creator.displayName} photoUrl={creator.avatarUrl} />
      <div className="mt-4 flex items-center justify-center">
        <h1 className="text-lg font-medium">{creator.displayName}</h1>

        <div className="pt-1">
          <CheckBadgeIcon />
        </div>
      </div>
      <p className="mt-0.7 mb-3 text-sm text-[#F5F7FA]">
        @{creator.username} <span aria-hidden="true">·</span>{" "}
        {creator.categoryName}
      </p>
      {creator.bio && (
        <p className="mx-auto max-w-82 font-medium text-sm leading-normal text-pretty">
          {creator.bio}
        </p>
      )}
    </header>
  );
}
