export interface Feature {
  title: string;
  description: string;
  bulletTitle?: string;
  bullets?: string[];
  image: {
    img: { src: string };
    alt: string;
  };
  extraText?: string;
}
