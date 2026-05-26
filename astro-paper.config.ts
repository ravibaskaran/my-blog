import { defineAstroPaperConfig } from "./src/types/config";
import { authorProfile } from "./src/data/author.js";

export default defineAstroPaperConfig({
  site: {
    url: "https://blog.tochops.in/",
    title: "Cranium to Chops",
    description: "Notes, essays, and experiments from Ravi Baskaran.",
    author: authorProfile.name,
    profile: new URL(authorProfile.profilePath, "https://blog.tochops.in/").href,
    ogImage: "default-og.jpg",
    lang: "en",
    timezone: "Asia/Bangkok",
    dir: "ltr",
  },
  posts: {
    perPage: 4,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: false,
    showBackButton: true,
    editPost: {
      enabled: false,
      url: "https://github.com/ravibaskaran/my-blog/edit/main/",
    },
    search: false,
  },
  socials: [],
  shareLinks: [
    { name: "whatsapp", url: "https://wa.me/?text=" },
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    { name: "x",        url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "pinterest", url: "https://pinterest.com/pin/create/button/?url=" },
    { name: "mail",     url: "mailto:?subject=See%20this%20post&body=" },
  ],
});
