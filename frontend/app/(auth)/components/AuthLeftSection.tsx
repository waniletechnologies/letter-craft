import Image from "next/image";
import { Background } from "../../../public/Images";

export default function AuthLeftSection() {
  return (
    <div className="hidden lg:flex flex-col justify-between w-1/2 relative">
      {/* Background Image */}
      <Image
        src={Background || "/placeholder.svg"}
        alt="auth logo"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/20 rounded-l-3xl"></div>

      {/* Content */}
      <div className="flex flex-col justify-between h-full p-12 relative z-10">
        <div className="text-2xl font-bold tracking-wide text-white">
          LetterCraft
        </div>

        {/* Bottom text */}
        <div className="mt-auto">
          <h1 className="text-4xl font-bold mb-4 leading-tight text-white">
            Your credit history, <br /> simplified and verified.
          </h1>
          <p className="text-white/90 text-base leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur <br />
            adipiscing elit. Pellentesque at.
          </p>
        </div>

        {/* Slider dots */}
        <div className="flex gap-2 mt-10">
          <span className="w-8 h-2 rounded-full bg-white"></span>
          <span className="w-2 h-2 rounded-full bg-white/40"></span>
          <span className="w-2 h-2 rounded-full bg-white/40"></span>
        </div>
      </div>
    </div>
  );
}