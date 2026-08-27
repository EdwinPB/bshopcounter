import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Barbershop Counter",
    short_name: "BShop Counter",
    description: "Consulta y administra la espera de tu barbería.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#16283f",
    theme_color: "#16283f",
    icons: [
      {
        src: "/pwa-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/pwa-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/pwa-icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
