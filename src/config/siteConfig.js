/**
 * Royal Moments — Central Configuration File
 */

export const siteConfig = {
  // Couple Information
  couple: {
    partnerOne: "Prabhudas",
    partnerTwo: "Soumya",
    get fullName() {
      return `${this.partnerOne} & ${this.partnerTwo}`;
    },
    monogram: "P & S",
    engagementDate: "Sunday, November 22, 2026",
  },

  // Hero & Visual Identity
  hero: {
    heading: "Engagement Ceremony",
    subtitle: "Two hearts united in love, celebrated with family.",
    primaryCta: "Explore Memories",
    secondaryCta: "Upload Photos",
    // Real couple engagement photograph (complete hands, garland & rings)
    coverImage: "/couple-cover.jpg",
    coverImageAlt: "Prabhudas & Soumya Engagement Hands with Garland & Ring",
  },

  // Gallery Configuration
  gallery: {
    title: "Our Memories",
    subtitle: "A cherished collection of laughter, smiles, and celebrations with our dearest family and friends.",
    pageSize: 24,
    defaultSort: "oldest", // 'oldest' (insertion order: first uploaded stays first) | 'newest'
  },

  // Upload Configuration (No size limits, photos only)
  upload: {
    title: "Add to Our Memories",
    subtitle: "Tap below to upload your photos from the engagement ceremony.",
    allowedImageTypes: ["image/jpeg", "image/png", "image/webp", "image/heic"],
  },

  // Favourites
  favourites: {
    title: "Cherished Moments",
    description: "Your personally saved moments on this device.",
    emptyMessage: "You haven't saved any favourites yet. Tap the heart icon on any photo to save it here.",
  },

  // Download Album
  download: {
    title: "Download Full Album",
    description: "Download all original quality photographs into a single organized ZIP archive.",
  },

  // Footer & Brand
  footer: {
    quote: "Made with love, shared with family.",
    copyrightNotice: "All rights reserved. Dedicated to the celebration of Prabhudas & Soumya.",
  }
};
