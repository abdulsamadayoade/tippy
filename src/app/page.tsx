import { redirect } from "next/navigation";
import { getSessionCreator } from "@/lib/session";
import { Home } from "@/modules/home";

export default async function Page() {
  const { session, creator } = await getSessionCreator();

  if (session) redirect(creator ? "/overview" : "/onboarding");

  return <Home />;
}
