import { createFileRoute } from "@tanstack/react-router";
import PlayDog from "@/game/PlayDog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PlayDog — Arcade 2D Bone Shooter" },
      {
        name: "description",
        content:
          "PlayDog: gioco arcade 2D in landscape. Spara ossa, elimina i Nyan Cat e batti il tuo record.",
      },
      { property: "og:title", content: "PlayDog — Arcade 2D Bone Shooter" },
      {
        property: "og:description",
        content: "Spara ossa, elimina i Nyan Cat e batti il tuo record in PlayDog.",
      },
    ],
  }),
  component: PlayDog,
});
