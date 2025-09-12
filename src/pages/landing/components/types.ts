export interface Plan {
  title: string;
  price: string;
  billingInfo: string;
  icon: React.ReactNode | string;
  features: string[];
  highlighted: boolean;
  button: { text: string; link: string };
  discount?: number;
  priceWithDiscount?: string | null;
}