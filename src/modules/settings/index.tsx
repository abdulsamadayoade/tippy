import { resolvePresets } from "@/modules/profile/data";
import { ProfileCard } from "./components/profile-card";
import { TipPresetsCard } from "./components/tip-presets-card";
import type { SettingsProps } from "./types";

export function Settings({ creator, categories }: SettingsProps) {
  return (
    <section aria-labelledby="settings-heading">
      <h1
        className="mt-0.5 text-lg leading-page-heading font-medium tracking-display text-main-heading"
        id="settings-heading">
        Settings
      </h1>
      <p className="mt-0.5 text-ui-sm text-muted-text">
        Edit your profile and customise your tip page.
      </p>

      <ProfileCard creator={creator} categories={categories} />

      <div className="mt-7">
        <h2 className="text-base leading-[1.3] font-medium text-main-heading">
          Tip presets
        </h2>
        <TipPresetsCard
          key={`${creator.categoryName}:${JSON.stringify(creator.tipPresets)}`}
          presets={resolvePresets(creator.tipPresets, creator.categoryName)}
          usingDefaults={creator.tipPresets === null}
          allowCustomAmount={creator.allowCustomAmount}
        />
      </div>
    </section>
  );
}
