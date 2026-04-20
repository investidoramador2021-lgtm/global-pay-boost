import banner1 from "@/assets/affiliate-banner-1-leaderboard.jpg";
import banner2 from "@/assets/affiliate-banner-2-mediumrect-dark.jpg";
import banner3 from "@/assets/affiliate-banner-3-mediumrect-light.jpg";
import banner4 from "@/assets/affiliate-banner-4-skyscraper.jpg";
import banner5 from "@/assets/affiliate-banner-5-social.jpg";
import banner6 from "@/assets/affiliate-banner-6-story.jpg";

export type BannerTheme = "dark" | "light";

export interface BannerSpec {
  id: string;
  image: string;
  width: number;
  height: number;
  theme: BannerTheme;
  filename: string;
  aspect: string;
}

export const bannerSpecs: BannerSpec[] = [
  {
    id: "leaderboard",
    image: banner1,
    width: 1920,
    height: 1080,
    theme: "dark",
    filename: "mrcglobalpay-banner-leaderboard",
    aspect: "aspect-[16/9]",
  },
  {
    id: "medium-rect-dark",
    image: banner2,
    width: 1024,
    height: 1024,
    theme: "dark",
    filename: "mrcglobalpay-banner-mediumrect-dark",
    aspect: "aspect-square",
  },
  {
    id: "medium-rect-light",
    image: banner3,
    width: 1024,
    height: 1024,
    theme: "light",
    filename: "mrcglobalpay-banner-mediumrect-light",
    aspect: "aspect-square",
  },
  {
    id: "skyscraper",
    image: banner4,
    width: 1080,
    height: 1920,
    theme: "dark",
    filename: "mrcglobalpay-banner-skyscraper",
    aspect: "aspect-[9/16]",
  },
  {
    id: "social-1200",
    image: banner5,
    width: 1200,
    height: 628,
    theme: "dark",
    filename: "mrcglobalpay-banner-social",
    aspect: "aspect-[1200/628]",
  },
  {
    id: "story-1080",
    image: banner6,
    width: 1080,
    height: 1920,
    theme: "dark",
    filename: "mrcglobalpay-banner-story",
    aspect: "aspect-[9/16]",
  },
];
