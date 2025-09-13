import React, { useEffect, useState } from "react";
import Button from "../../components/Button";
import Header from "../../components/Header";

const hints = [
  "You can pin participants by clicking on their thumbnails.",
  'You can tell others you have something to say by using the "Raise Hand" feature',
  "You can learn about key shortcuts by pressing Shift+?",
  "You can learn more about the state of everyone's connection by hovering on the bars in their thumbnail",
  "You can hide all thumbnails by using the button in the bottom right corner",
];

const ClosePage: React.FC = () => {
  const [hint, setHint] = useState<string>("");

  useEffect(() => {
    const l = hints.length - 1;
    const n = Math.floor(Math.random() * (l + 1));
    setHint(hints[n]);
  }, []);

  const handleClick = () => {
    window.location.href = '/meet'
  }

  return (
    <>
      <Header pageType="landing" />
      <div className="flex flex-col w-full items-center justify-center px-4 py-[12.5vh]">
        <div className="rounded-xl p-10 max-w-3xl w-full text-center">
          <h1 className="text-4xl font-bold mb-8 text-accent-700 md:whitespace-nowrap">
            Thank you for using Sonacove Meets
          </h1>

          <hr className="h-px border-none bg-accent-700" />

          <p className="text-lg text-accent-700 my-6">
            <span className="font-bold">Did you know? </span>
            <span id="hintMessage" className="font-medium">
              {hint}
            </span>
          </p>

          <div className="py-12">
            <Button variant="primary" onClick={handleClick}>
              Go to Home Page
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClosePage;
