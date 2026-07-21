"use client";

import {
  useId,
  useOptimistic,
  useRef,
  useState,
  useTransition,
  type SubmitEvent,
} from "react";
import { TrashIcon } from "@/components/icons/trash";
import { PlusIcon } from "@/components/icons/plus";
import { Modal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { TextInput } from "@/components/ui/text-input";
import { AccountMenu } from "./account-menu";
import { maskAccountNumber } from "@/lib/utils";
import { ACCOUNT_NUMBER_LENGTH, BANKS } from "@/data/constants";
import {
  removePayoutAccount,
  savePayoutAccount,
  setAutoPayout,
} from "../actions";
import type { BankAccount } from "@/types";
import type { FormErrors, FormMode, PayoutAccountCardProps } from "../types";

const EMPTY_FORM: BankAccount = {
  bank: "",
  accountName: "",
  accountNumber: "",
};

function validate(values: BankAccount): FormErrors {
  const errors: FormErrors = {};

  if (!values.bank) errors.bank = "Select your bank.";

  if (values.accountNumber.length !== ACCOUNT_NUMBER_LENGTH) {
    errors.accountNumber = `Enter your ${ACCOUNT_NUMBER_LENGTH}-digit account number.`;
  }

  if (values.accountName.trim().length < 2) {
    errors.accountName = "Enter the account holder’s name.";
  }

  return errors;
}

export function PayoutAccountCard({
  account,
  autoPayout,
}: PayoutAccountCardProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("add");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [values, setValues] = useState<BankAccount>(EMPTY_FORM);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  // Holds the optimistic switch value until the action's revalidated props
  // land, so the switch never flashes back to the stale value; reverts
  // automatically if the action fails.
  const [autoPayoutShown, setOptimisticAutoPayout] = useOptimistic(
    Boolean(account) && autoPayout,
  );
  const [autoPayoutPending, startAutoPayoutTransition] = useTransition();

  const uid = useId();
  const bankFieldRef = useRef<HTMLSelectElement>(null);
  const cancelDeleteRef = useRef<HTMLButtonElement>(null);

  const clientErrors = validate(values);
  const errors: FormErrors = submitAttempted
    ? { ...clientErrors, ...serverErrors }
    : {};

  function openAdd() {
    setFormMode("add");
    setValues(EMPTY_FORM);
    setSubmitAttempted(false);
    setServerErrors({});
    setFormOpen(true);
  }

  function openEdit() {
    if (!account) return;
    setFormMode("edit");
    setValues(account);
    setSubmitAttempted(false);
    setServerErrors({});
    setFormOpen(true);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitAttempted(true);
    setServerErrors({});
    if (Object.keys(clientErrors).length > 0 || saving) return;

    setSaving(true);
    const result = await savePayoutAccount({
      bank: values.bank,
      accountNumber: values.accountNumber,
      accountName: values.accountName.trim(),
    });
    setSaving(false);

    if (result.errors) {
      setServerErrors(result.errors);
      return;
    }

    setFormOpen(false);
  }

  async function confirmDelete() {
    if (removing) return;
    setRemoving(true);
    await removePayoutAccount();
    setRemoving(false);
    setDeleteOpen(false);
  }

  function toggleAutoPayout(enabled: boolean) {
    startAutoPayoutTransition(async () => {
      setOptimisticAutoPayout(enabled);
      const result = await setAutoPayout(enabled);
      if (result.error) console.error(result.error);
    });
  }

  return (
    <>
      <article className="mt-4 rounded-surface bg-white shadow-surface">
        {account ? (
          <div className="flex items-center justify-between gap-3 px-4.5 py-4">
            <div className="min-w-0">
              <span className="block text-ui-sm text-muted-text">
                Payout account
              </span>
              <strong className="mt-0.5 block truncate text-[15px] font-medium text-main-heading">
                {account.bank} · {account.accountName} ·{" "}
                {maskAccountNumber(account.accountNumber)}
              </strong>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="rounded-full bg-success-soft px-2.5 py-1 text-xs font-medium text-success">
                Verified
              </span>
              <AccountMenu
                onEdit={openEdit}
                onRemove={() => setDeleteOpen(true)}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center px-5 py-7 text-center">
            <h3 className="text-[15px] font-medium text-main-heading">
              No payout account yet
            </h3>
            <p className="mt-1 max-w-70 text-ui-sm leading-normal text-muted-text">
              Add a bank account so we can send your tips every Friday.
            </p>
            <Button size="sm" className="mt-4" onClick={openAdd}>
              <PlusIcon className="size-4" />
              Add bank account
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-line px-4.5 py-4">
          <div className="min-w-0">
            <span className="block text-ui-sm text-muted-text">
              Automatic payout
            </span>
            <strong className="mt-0.5 block text-[15px] font-medium text-main-heading">
              {!account
                ? "Add an account to enable"
                : autoPayoutShown
                  ? "Every Friday · automatic"
                  : "Off · withdraw manually"}
            </strong>
          </div>
          <Switch
            checked={autoPayoutShown}
            onCheckedChange={toggleAutoPayout}
            disabled={!account || autoPayoutPending}
            aria-label="Automatic weekly payout"
          />
        </div>
      </article>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        dismissible={!saving}
        labelledBy={`${uid}-form-title`}
        describedBy={`${uid}-form-desc`}
        initialFocusRef={bankFieldRef}
        className="w-full max-w-105 rounded-[20px] bg-white p-5.5 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.4)]">
        <h2
          className="text-xl font-medium tracking-display text-main-heading"
          id={`${uid}-form-title`}>
          {formMode === "add" ? "Add bank account" : "Edit bank account"}
        </h2>
        <p
          className="mt-1.5 text-sm leading-normal text-body-text"
          id={`${uid}-form-desc`}>
          Payouts are sent here automatically. You can keep one account on file.
        </p>

        <form
          className="mt-5 flex flex-col gap-3.5"
          onSubmit={handleSubmit}
          noValidate>
          <Select
            ref={bankFieldRef}
            id={`${uid}-bank`}
            label="Bank"
            placeholder="Select bank"
            value={values.bank}
            error={errors.bank}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                bank: event.target.value,
              }))
            }>
            {BANKS.map(({ name }) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>

          <TextInput
            id={`${uid}-number`}
            label="Account number"
            controlClassName="min-h-12"
            className="tabular-nums"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="10-digit account number"
            maxLength={ACCOUNT_NUMBER_LENGTH}
            value={values.accountNumber}
            error={errors.accountNumber}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                accountNumber: event.target.value
                  .replace(/\D/g, "")
                  .slice(0, ACCOUNT_NUMBER_LENGTH),
              }))
            }
          />

          <TextInput
            id={`${uid}-name`}
            label="Account name"
            controlClassName="min-h-12"
            type="text"
            autoComplete="off"
            placeholder="Name on the account"
            maxLength={80}
            value={values.accountName}
            error={errors.accountName}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                accountName: event.target.value,
              }))
            }
          />

          <div className="mt-1.5 grid grid-cols-2 gap-2.5">
            <Button
              variant="secondary"
              className="min-h-11"
              disabled={saving}
              onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button
              className="min-h-11"
              type="submit"
              loading={saving}
              loadingText="Saving…">
              {formMode === "add" ? "Add account" : "Save changes"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        dismissible={!removing}
        labelledBy={`${uid}-delete-title`}
        describedBy={`${uid}-delete-desc`}
        initialFocusRef={cancelDeleteRef}
        className="w-full max-w-95 rounded-[20px] bg-white p-5.5 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.4)]">
        <span
          className="mx-auto flex size-12 items-center justify-center rounded-full bg-danger-soft text-danger"
          aria-hidden="true">
          <TrashIcon className="size-5" />
        </span>
        <h2
          className="mt-4 text-center text-xl font-medium tracking-display text-main-heading"
          id={`${uid}-delete-title`}>
          Remove bank account?
        </h2>
        <p
          className="mt-1.5 text-center text-sm leading-normal text-body-text"
          id={`${uid}-delete-desc`}>
          Payouts will pause until you add a new account. You can add one again
          at any time.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <Button
            ref={cancelDeleteRef}
            variant="secondary"
            className="min-h-11"
            disabled={removing}
            onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <button
            className="major-button major-button-danger inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-danger px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
            type="button"
            disabled={removing}
            onClick={confirmDelete}>
            {removing ? "Removing…" : "Remove"}
          </button>
        </div>
      </Modal>
    </>
  );
}
