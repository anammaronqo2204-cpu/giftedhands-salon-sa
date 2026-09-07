export type GalleryItem = {
  src: string;
  alt: string;
  style: string;
  tall?: boolean;
};

const px = (id: number, w = 900, h = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=${h}&w=${w}`;

export const GALLERY: GalleryItem[] = [
  { src: "/images/hero.jpg", alt: "Waist-length goddess braids with soft curls", style: "Goddess Braids", tall: true },
  { src: "/images/services/french-curl.jpg", alt: "French curl braids with bouncy ends", style: "French Curl" },
  { src: px(36426407), alt: "Neat knotless braids styled with elegant attire", style: "Knotless Braids" },
  { src: "/images/services/riverlocks.jpg", alt: "Boho Riverlocks with flowing waves", style: "Riverlocks" },
  { src: px(18909778), alt: "Long braids against a dark background", style: "Waist Length Braids", tall: true },
  { src: "/images/services/spring-twist.jpg", alt: "Shoulder-length spring twists", style: "Spring Twist" },
  { src: "/images/services/goddess-human.jpg", alt: "Human hair goddess braids", style: "Human Hair Goddess" },
  { src: px(14399530), alt: "Long braids worn down outdoors", style: "Knotless Braids" },
  { src: "/images/services/twists.jpg", alt: "Bra-length passion twists", style: "Twists", tall: true },
  { src: px(15136190), alt: "Smiling girl with beaded braids", style: "Kids Braids" },
  { src: "/images/services/goddess-synthetic.jpg", alt: "Boho goddess braids with synthetic curls", style: "Goddess Braids" },
  { src: px(39201803), alt: "Close-up of braided hair with jewellery", style: "Braids & Accessories" },
  { src: px(38169882), alt: "Sleek braided hairstyle portrait", style: "Knotless Braids", tall: true },
  { src: px(16563139), alt: "Intricate braided bun from above", style: "Updo" },
  { src: px(28383173), alt: "Braiding in progress", style: "In the chair" },
  { src: px(36930354), alt: "Eyelash extension application", style: "Lashes" },
];

export const PROCESS_IMAGE = px(7078204, 1000, 1250);
