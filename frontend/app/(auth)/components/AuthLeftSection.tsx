import Image from "next/image";
import { Background } from "../../../public/images";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AuthLeftSection() {
  return (
    <div className="w-[679.27px] rounded-3xl">
      <div className="flex w-full rounded-3xl overflow-hidden shadow-lg w-full h-full hidden lg:flex flex-col  justify-between relative m-2 r-[18px]">
        {/* Background Image */}
        <Image
          src={Background || "/placeholder.svg"}
          alt="auth logo"
          fill
          className="object-cover"
          priority
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20 rounded-l-3xl"></div>

        {/* Content */}
        <div className="flex flex-col justify-between h-full p-12 relative z-10">
          {/* Logo */}
          <Card className="bg-transparent border-none shadow-none w-fit">
            <CardContent className="p-0">
              <div className="text-2xl font-bold tracking-wide text-white">
                LetterCraft
              </div>
            </CardContent>
          </Card>

          {/* Bottom text */}
          <Card className="bg-transparent border-none shadow-none mt-auto">
            <CardHeader className="p-0 pb-4">
              <h1 className="text-4xl font-bold leading-tight text-white">
                Your credit history, <br /> simplified and verified.
              </h1>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-white/90 text-base leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur <br />
                adipiscing elit. Pellentesque at.
              </p>
            </CardContent>
          </Card>

          {/* Slider dots */}
          <div className="flex gap-2 mt-10">
            <span className="w-8 h-2 rounded-full bg-white"></span>
            <span className="w-2 h-2 rounded-full bg-white/40"></span>
            <span className="w-2 h-2 rounded-full bg-white/40"></span>
          </div>
        </div>
      </div>
    </div>
  );
}