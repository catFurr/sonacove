/**
 * Represents a feature section, typically used to describe
 * product highlights with text, bullets, and an image.
 */
export interface Feature {
  /**
   * The main title of the feature.
   */
  title: string;

  /**
   * A short description of the feature.
   */
  description: string;

  /**
   * An optional title to introduce the bullet list.
   */
  bulletTitle?: string;

  /**
   * An optional list of bullet points highlighting details.
   */
  bullets?: string[];

  /**
   * The image associated with this feature.
   */
  image: {
    /**
     * The image source path.
     */
    img: { src: string };

    /**
     * The alt text for accessibility.
     */
    alt: string;
  };

  /**
   * Additional optional text, displayed below
   * the main description or bullets.
   */
  extraText?: string;
}
