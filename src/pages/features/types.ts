export interface Feature {
  title: string;
  description: string;
  bulletTitle?: string;
  bullets?: string[];
  image: {
    img: { src: string }; // Assuming the image object from Astro has a src property
    alt: string;
  };
  extraText?: string;
}
