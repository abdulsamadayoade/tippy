import { InstagramIcon } from "@/components/icons/instagram";
import { WhatsAppIcon } from "@/components/icons/whatsapp";
import { XIcon } from "@/components/icons/x";
import { MINIMUM_WITHDRAWAL } from "@/data/constants";
import { formatNaira } from "@/lib/utils";

const steps = [
  {
    title: "Make it yours",
    body: "Choose your username, add a photo and tell people what you create. Your page lives at tippy.cash/yourname.",
  },
  {
    title: "Share it with your people",
    body: "Put your link in your bio, below a video or at the end of a post. Supporters can send a tip and a note without creating a Tippy account.",
  },
  {
    title: "Receive it in naira",
    body: `Once your available balance reaches ${formatNaira(MINIMUM_WITHDRAWAL)} and your payout account is verified, withdraw to your Nigerian bank account or enable automatic Friday payouts.`,
  },
];

const builderSocialLinks = [
  {
    label: "Message Abdul on WhatsApp",
    title: "WhatsApp",
    href: "https://wa.me/2348108392621",
    icon: WhatsAppIcon,
  },
  {
    label: "Abdul on Instagram",
    title: "Instagram",
    href: "https://www.instagram.com/abdullllsamad_",
    icon: InstagramIcon,
  },
  {
    label: "Abdul on X (formerly Twitter)",
    title: "X",
    href: "https://x.com/abdullllsamad",
    icon: XIcon,
  },
];

export { builderSocialLinks, steps };
