import { PillNavigation } from "@/components/ui/pill-navigation";

const links = [
  { href: "/overview", label: "Overview", id: "creator-overview-link" },
  { href: "/tips", label: "Tips", id: "creator-tips-link" },
  { href: "/payouts", label: "Payouts", id: "creator-payouts-link" },
] as const;

export function CreatorNavigation() {
  return (
    <PillNavigation
      links={links}
      ariaLabel="Creator sections"
      className="ml-1.5 max-dashboard:order-3 max-dashboard:ml-0 max-dashboard:w-full max-dashboard:text-center"
    />
  );
}
