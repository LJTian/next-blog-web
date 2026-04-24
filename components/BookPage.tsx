"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";
import type { BookPage as BookPageData } from "@/lib/content";

type BookPageProps = {
  active: boolean;
  index: number;
  page: BookPageData;
};

export default function BookPage({ active, index, page }: BookPageProps) {
  const ref = useRef<Mesh>(null);

  useFrame(() => {
    if (!ref.current) {
      return;
    }

    const target = active ? -2.62 : 0;
    ref.current.rotation.y += (target - ref.current.rotation.y) * 0.09;
  });

  return (
    <mesh ref={ref} castShadow receiveShadow position={[index * 0.018, 0, index * 0.012]}>
      <boxGeometry args={[2.42, 3.28, 0.026]} />
      <meshStandardMaterial color={page.kind === "cover" ? "#292621" : "#f8f4ec"} roughness={0.88} metalness={0.02} />
    </mesh>
  );
}
