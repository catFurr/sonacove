
type Runtime = import('@astrojs/cloudflare').Runtime<CloudflareEnv>;

declare namespace App {
  interface Locals extends Runtime {
    // otherLocals: {
    //   test: string;
    // };
  }
}

interface Window {
  plans: Array<{
    title: string;
    features: string[];
    highlighted: boolean;
    footer: {
      message: string;
      buttonText: string;
      buttonLink: string;
    };
    priceWithDiscount?: string | null;
    price?: string;
    discount?: number;
  }>;
}
