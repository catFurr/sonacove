
type Runtime = import('@astrojs/cloudflare').Runtime<CloudflareEnv>;

declare namespace App {
  interface Locals extends Runtime {
    // otherLocals: {
    //   test: string;
    // };
  }
}

interface Window {
  plans: any;
}
