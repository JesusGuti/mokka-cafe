import Image from "next/image";

export const Hero = () => {
  return (
    <section className="relative">
      <Image
        alt=""
        className="hidden lg:block object-cover"
        fill={true}
        priority
        sizes="50vw"
        src="/brand/hero-no-wordmark-gradient.webp"
      />
    </section>
  );
};
