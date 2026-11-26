/**
 * Royal Moments — Central Configuration File
 * 
 * Customize couple details, dates, images, and gallery limits in this single file
 * without modifying UI components.
 */

export const siteConfig = {
  // Couple Information
  couple: {
    partnerOne: "Prabhudas",
    partnerTwo: "Somya",
    get fullName() {
      return `${this.partnerOne} & ${this.partnerTwo}`;
    },
    monogram: "P & S",
    engagementDate: "November 22, 2026",
  },

  // Hero & Visual Identity
  hero: {
    heading: "Engagement Ceremony",
    subtitle: "Every picture tells a beautiful story of two hearts united in joy.",
    primaryCta: "Explore Our Memories",
    secondaryCta: "Share Your Moments",
    // Real couple engagement photograph
    coverImage: "/couple-cover.jpg",
    coverImageAlt: "Prabhudas & Somya Engagement Hands with Garland & Ring",
  },

  // Gallery Configuration
  gallery: {
    title: "Our Memories",
    subtitle: "A beautiful tapestry of laughter, candid glances, and unforgettable celebrations with our dearest family and friends.",
    pageSize: 24,
    defaultSort: "newest", // 'newest' | 'oldest'
  },

  // Upload Limits & Validations
  upload: {
    title: "Add to Our Story",
    subtitle: "Capture a smile? Snap a candid video? Please upload your photos and videos to immortalize this day with us.",
    maxImageSizeMB: 20,
    maxVideoSizeMB: 100,
    allowedImageTypes: ["image/jpeg", "image/png", "image/webp", "image/heic"],
    allowedVideoTypes: ["video/mp4", "video/quicktime"],
    requirePasscode: false,
    passcodePrompt: "Enter family passcode to upload (if required):",
  },

  // Favourites
  favourites: {
    title: "Cherished Moments",
    description: "Your personally saved moments. Note: Favourites are kept in your current browser device.",
    emptyMessage: "You haven't saved any favourites yet. Tap the heart icon on any memory to collect it here.",
  },

  // Download Album
  download: {
    title: "Download Full Album",
    description: "Download all full-resolution photographs and videos into a single organized ZIP archive.",
    warningThresholdCount: 200,
    warningMemoryNotice: "For very large albums (>200 items), downloading in batches or selecting favorites is recommended.",
  },

  // Footer & Brand
  footer: {
    quote: "Made with love, shared with family.",
    copyrightNotice: "All rights reserved. Dedicated to the celebration of Prabhudas & Somya.",
  }
};
