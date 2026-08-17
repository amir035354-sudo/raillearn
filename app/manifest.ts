import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "RailLearn",
        short_name: "RailLearn",
        description: "Railway Learning Platform",
        start_url: "/",
        display: "standalone",
        background_color: "#030305",
        theme_color: "#a855f7",
        orientation: "portrait",
        icons: [
            {
                src: "/icon.svg",
                sizes: "any",
                type: "image/svg+xml",
                purpose: "any",
            },
        ],
    };
}