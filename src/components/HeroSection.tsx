import React from "react";
import Header from "./Header";
import hero_image from "../assets/hero-image.png"; // Assuming your bundler supports image imports

const HeroSection: React.FC = () => {
  return (
    <div className="bg-[#F9FAFB] px-4 py-2">
      {/* Header */}
      <Header pageType="landing" />

      {/* Hero Section */}
      <section className="py-20 text-center md:py-28">
        <div className="mx-auto px-4">
          {/* Responsive Headline */}
          <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl md:text-6xl">
            Teach like never before,
            <br />WelcomeContent
            effortless and fun!
          </h1>

          {/* Sub-headline */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600">
            The only online meeting platform that adapts to your teaching style, not the other way around.
          </p>

          {/* CTA Buttons */}
          <div className="mb-20 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/onboarding"
              className="w-full rounded-full bg-black px-8 py-4 text-center font-semibold text-white transition-transform hover:scale-105 hover:bg-gray-800 sm:w-auto"
            >
              Start Teaching for Free
            </a>
            <a
              href="#how-it-works"
              className="w-full rounded-full bg-gray-100 px-8 py-4 text-center font-semibold text-black transition-transform hover:scale-105 hover:bg-gray-200 sm:w-auto border border-gray-200"
            >
              See How It Works
            </a>
          </div>

          {/* Hero Image */}
          <div className="w-[80%] mx-auto [-webkit-mask-image:linear-gradient(to_top,transparent_0%,black_40%)] [mask-image:linear-gradient(to_top,transparent_0%,black_40%)]">
            <img
              src={hero_image.src}
              alt="Illustration of a teacher conducting an online class with multiple students on screen"
              className="w-full"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeroSection;
