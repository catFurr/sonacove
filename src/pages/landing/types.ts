/**
 * Represents a subscription or pricing plan.
 */
export interface Plan {
  /**
   * The display name of the plan (e.g., "Free", "Premium", "Organization").
   */
  title: string;

  /**
   * The price of the plan (formatted string, e.g., "$9.99").
   */
  price: string;

  /**
   * Additional billing information (e.g., "per user/month").
   */
  billingInfo: string;

  /**
   * An icon representing the plan. Can be a React node or a string path.
   */
  icon: React.ReactNode | string;

  /**
   * A list of features included in the plan.
   */
  features: string[];

  /**
   * Whether the plan is highlighted (featured) in the UI.
   */
  highlighted: boolean;

  /**
   * The button associated with the plan (e.g., "Buy now").
   */
  button: {
    /**
     * Button text label.
     */
    text: string;

    /**
     * Button link or action URL.
     */
    link: string;
  };

  /**
   * Optional discount percentage applied to the plan.
   */
  discount?: number;

  /**
   * The plan price after applying the discount, or `null` if not applicable.
   */
  priceWithDiscount?: string | null;
}

/**
 * Represents a user review or testimonial content.
 */
export interface Review {
  /**
   * A short quoted highlight from the review.
   */
  quote: string;

  /**
   * The main body text of the review.
   */
  text: string;

  /**
   * Information about the review’s author.
   */
  author: {
    /**
     * Author’s full name.
     */
    name: string;

    /**
     * Author’s title or role (e.g., "CEO at Acme").
     */
    title: string;

    /**
     * URL or path to the author’s avatar image.
     */
    avatar: string;
  };
}

/**
 * Represents a company with a rating.
 */
export interface Company {
  /**
   * The company’s display name.
   */
  name: string;

  /**
   * The company’s rating (e.g., from 0–5).
   */
  rating: number;
}

/**
 * Represents a testimonial that may include a company reference
 * and the associated review details.
 */
export interface Testimonial {
  /**
   * Optional company associated with the testimonial.
   */
  company?: {
    /**
     * Company name.
     */
    name: string;

    /**
     * Company rating value.
     */
    rating: number;
  };

  /**
   * Quoted highlight from the testimonial.
   */
  quote: string;

  /**
   * The main testimonial text.
   */
  text: string;

  /**
   * Author information for the testimonial.
   */
  author: {
    /**
     * Author’s full name.
     */
    name: string;

    /**
     * Author’s title or role.
     */
    title: string;

    /**
     * Author’s avatar image URL.
     */
    avatar: string;
  };
}

/**
 * Groups a company with its associated review for display purposes.
 */
export interface TestimonialGroup {
  /**
   * The company being reviewed.
   */
  company: Company;

  /**
   * The review associated with the company.
   */
  review: Review;
}
