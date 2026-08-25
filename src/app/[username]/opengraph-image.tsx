import { ImageResponse } from "next/og";
import sharp from "sharp";
import { getCreatorByUsername } from "@/modules/profile/queries";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Tip this creator on Tippy";

const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

async function avatarDataUri(url: string | null): Promise<string | null> {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    if (
      parsed.protocol !== "https:" ||
      !parsed.hostname.endsWith(BLOB_HOST_SUFFIX) ||
      !parsed.pathname.startsWith("/avatars/")
    ) {
      return null;
    }

    const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!response.ok) return null;

    const png = await sharp(Buffer.from(await response.arrayBuffer()), {
      limitInputPixels: 1_000_000,
    })
      .resize(160, 160, { fit: "cover" })
      .png()
      .toBuffer();

    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const tipCreator = await getCreatorByUsername(username);

  if (!tipCreator) return new Response("Not found", { status: 404 });

  const avatar = await avatarDataUri(tipCreator.avatarUrl);
  const initial = tipCreator.displayName.trim().charAt(0).toUpperCase();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        padding: 60,
        backgroundColor: "#f5f5f5",
      }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 56,
          padding: "72px 80px",
          borderRadius: 36,
          backgroundColor: "#ffffff",
          position: "relative",
        }}>
        {avatar ? (
          <img
            src={avatar}
            width={160}
            height={160}
            alt=""
            style={{ borderRadius: 9999 }}
          />
        ) : (
          <div
            style={{
              width: 160,
              height: 160,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 9999,
              backgroundColor: "#0b2239",
              color: "#ffffff",
              fontSize: 72,
              fontWeight: 600,
            }}>
            {initial}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 700,
              color: "#0b2239",
            }}>
            {tipCreator.displayName}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              marginTop: 12,
              color: "#274c5e",
            }}>
            @{tipCreator.username} · {tipCreator.categoryName}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              marginTop: 36,
              color: "#274c5e",
            }}>
            Tip {tipCreator.displayName} on Tippy
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 48,
            right: 64,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
          <svg
            viewBox="0 0 24 24"
            width="40"
            height="40"
            fill="none"
            stroke="#064E5B"
            strokeWidth="1.5">
            <path
              d="M20 8C20 9.93293 18.433 11.5 16.5 11.5C14.567 11.5 13 9.93293 13 8C13 6.067 14.567 4.5 16.5 4.5C18.433 4.5 20 6.067 20 8Z"
              strokeLinecap="square"
            />
            <path
              d="M14.8311 4.92276C14.3768 3.51685 13.0571 2.5 11.5 2.5C9.567 2.5 8 4.067 8 6C8 7.93293 9.567 9.5 11.5 9.5C12.1043 9.5 12.6728 9.34684 13.1689 9.07723"
              strokeLinecap="round"
            />
            <path
              d="M4 13.5H6.39482C6.68897 13.5 6.97908 13.5663 7.24217 13.6936L9.28415 14.6816C9.54724 14.8089 9.83735 14.8751 10.1315 14.8751H11.1741C12.1825 14.8751 13 15.6662 13 16.642C13 16.6814 12.973 16.7161 12.9338 16.7269L10.3929 17.4295C9.93707 17.5555 9.449 17.5116 9.025 17.3064L6.84211 16.2503M13 16L17.5928 14.5889C18.407 14.3352 19.2871 14.636 19.7971 15.3423C20.1659 15.8529 20.0157 16.5842 19.4785 16.8942L11.9629 21.2305C11.4849 21.5063 10.9209 21.5736 10.3952 21.4176L4 19.5199"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              fontWeight: 600,
              color: "#064e5b",
            }}>
            tippy.
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
