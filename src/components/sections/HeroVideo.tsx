// Full-bleed autoplay video background for page hero sections. Local videos in
// /public/assets/video are same-origin, so no images.remotePatterns needed.
export function HeroVideo({
  src = "/assets/video/bg2.mp4",
  overlay = "bg-ivory/50",
}: {
  src?: string;
  overlay?: string;
}) {
  return (
    <>
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        src={src}
      />
      <div className={`absolute inset-0 ${overlay}`} />
    </>
  );
}