"use client";

import {
  useOptimistic,
  useState,
  useTransition,
  type SubmitEvent,
} from "react";
import { play } from "cuelume";
import { validatePresets } from "../utils";
import {
  resetTipPresets,
  setAllowCustomAmount,
  updateTipPresets,
} from "../actions";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AmountInput } from "@/components/ui/amount-input";
import { TextInput } from "@/components/ui/text-input";
import { MAXIMUM_TIP } from "@/data/constants";
import {
  POPULAR_PRESET_INDEX,
  PRESET_LABEL_MAX_LENGTH,
} from "@/modules/profile/data";
import type { TipPreset } from "@/types";
import type { PresetFormErrors, TipPresetsCardProps } from "../types";

export function TipPresetsCard({
  presets,
  usingDefaults,
  allowCustomAmount,
}: TipPresetsCardProps) {
  const [values, setValues] = useState<TipPreset[]>(
    presets.map(({ amount, label }) => ({ amount, label })),
  );
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState<PresetFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resetting, setResetting] = useState(false);
  // Holds the optimistic switch value until the action's revalidated props
  // land, so the switch never flashes back to the stale value; reverts
  // automatically if the action fails.
  const [customAmountShown, setOptimisticCustomAmount] =
    useOptimistic(allowCustomAmount);
  const [togglePending, startToggleTransition] = useTransition();

  const clientErrors = validatePresets(values);
  const errors: PresetFormErrors = submitAttempted
    ? {
        slots: { ...clientErrors.slots, ...serverErrors.slots },
        form: clientErrors.form ?? serverErrors.form,
      }
    : {};
  const hasClientErrors =
    Boolean(clientErrors.form) ||
    Object.keys(clientErrors.slots ?? {}).length > 0;

  const isDirty = values.some(
    ({ amount, label }, index) =>
      amount !== presets[index].amount ||
      label.trim() !== presets[index].label.trim(),
  );

  function setSlot(index: number, patch: Partial<TipPreset>) {
    setSaved(false);
    setValues((current) =>
      current.map((slot, slotIndex) =>
        slotIndex === index ? { ...slot, ...patch } : slot,
      ),
    );
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitAttempted(true);
    setServerErrors({});
    if (!isDirty) return;
    if (hasClientErrors || saving) return;

    setSaving(true);
    const result = await updateTipPresets(
      values.map(({ amount, label }) => ({ amount, label: label.trim() })),
    );
    setSaving(false);

    if (result.errors) {
      play("error");
      setServerErrors(result.errors);
      return;
    }

    play("success");
    setSaved(true);
  }

  async function handleReset() {
    if (resetting) return;
    setResetting(true);
    await resetTipPresets();
    setResetting(false);
  }

  function toggleCustomAmount(enabled: boolean) {
    startToggleTransition(async () => {
      setOptimisticCustomAmount(enabled);
      const result = await setAllowCustomAmount(enabled);
      if (result.error) console.error(result.error);
    });
  }

  return (
    <article className="mt-3 rounded-surface bg-card-bg shadow-surface">
      <form className="p-4.5" onSubmit={handleSubmit} noValidate>
        <p className="text-ui-sm text-muted-text">
          The four amounts supporters see on your page.
          {usingDefaults ? " You’re using your category’s defaults." : ""}
        </p>

        <div className="mt-4 flex flex-col gap-4">
          {values.map((slot, index) => (
            <div key={index}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-text">
                  Preset {index + 1}
                </span>
                {index === POPULAR_PRESET_INDEX && (
                  <span className="rounded-full bg-soft px-2 py-0.5 text-xs leading-none font-medium text-body-text">
                    Popular
                  </span>
                )}
              </div>
              <div className="mt-1.5 grid grid-cols-2 gap-2.5 max-phone:grid-cols-1">
                <AmountInput
                  label={`Preset ${index + 1} amount`}
                  visuallyHideLabel
                  controlClassName="mt-0 min-h-12"
                  className="text-sm"
                  value={slot.amount}
                  onValueChange={(amount) => setSlot(index, { amount })}
                  max={MAXIMUM_TIP}
                  error={errors.slots?.[index]?.amount}
                />
                <TextInput
                  label={`Preset ${index + 1} label`}
                  controlClassName="min-h-12"
                  visuallyHideLabel
                  type="text"
                  autoComplete="off"
                  placeholder="Label"
                  maxLength={PRESET_LABEL_MAX_LENGTH}
                  value={slot.label}
                  error={errors.slots?.[index]?.label}
                  onChange={(event) =>
                    setSlot(index, { label: event.target.value })
                  }
                />
              </div>
            </div>
          ))}
        </div>

        {errors.form && (
          <p className="mt-3 text-xs text-danger" role="alert">
            {errors.form}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            size="sm"
            disabled={!isDirty || saving}
            loading={saving}
            loadingText="Saving…">
            Save presets
          </Button>
          {!usingDefaults && (
            <button
              className="cursor-pointer text-ui-sm font-medium text-muted-text transition-colors duration-100 hover:text-body-text disabled:cursor-default disabled:opacity-60"
              type="button"
              disabled={resetting}
              onClick={handleReset}>
              {resetting ? "Resetting…" : "Use category defaults"}
            </button>
          )}
          {saved && (
            <span aria-live="polite" className="text-ui-sm text-success">
              Saved
            </span>
          )}
        </div>
      </form>

      <div className="flex items-center justify-between gap-3 border-t border-divider px-4.5 py-4">
        <div className="min-w-0">
          <span className="block text-ui-sm text-muted-text">
            Custom amount
          </span>
          <strong className="mt-0.5 block text-[15px] font-medium text-main-heading">
            {customAmountShown
              ? "Supporters can type any amount"
              : "Preset amounts only"}
          </strong>
        </div>
        <Switch
          checked={customAmountShown}
          onCheckedChange={toggleCustomAmount}
          disabled={togglePending}
          aria-label="Let supporters enter a custom amount"
        />
      </div>
    </article>
  );
}
