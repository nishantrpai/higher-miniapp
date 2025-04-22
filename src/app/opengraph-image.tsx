import { ImageResponse } from "next/og";

export const alt = process.env.NEXT_PUBLIC_FRAME_NAME || "Frames V2 Demo";
export const size = {
  width: 600,
  height: 400,
};

export const contentType = "image/png";
const openGraphimage = '/opengraph.jpg';

// dynamically generated OG image for frame preview
export default async function Image() {
  return new ImageResponse(
    (
      <div tw="h-full w-full flex flex-col justify-center items-center relative bg-black">
        <img
          src={openGraphimage}
          alt="Higher"
          width={size.width}
          height={size.height}
          tw="absolute inset-0 object-cover"
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
