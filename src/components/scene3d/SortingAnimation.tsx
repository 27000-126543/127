import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useLibraryStore } from '../../store';
import type { Position3D } from '../../../shared/types';

function getPositionOnPath(path: Position3D[], progress: number): Position3D {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const totalIndex = (path.length - 1) * clampedProgress;
  const index = Math.floor(totalIndex);
  const t = totalIndex - index;

  const current = path[Math.min(index, path.length - 1)];
  const next = path[Math.min(index + 1, path.length - 1)];

  return {
    x: current.x + (next.x - current.x) * t,
    y: current.y + (next.y - current.y) * t,
    z: current.z + (next.z - current.z) * t,
  };
}

interface SortingBookProps {
  bookData: {
    book: {
      id: string;
      title: string;
      coverColor: string;
    };
    path: Position3D[];
    progress: number;
  };
}

function SortingBook({ bookData }: SortingBookProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const bounceRef = useRef(0);
  const hasArrivedRef = useRef(false);

  const size = useMemo(() => ({
    width: 0.15 + Math.random() * 0.05,
    height: 0.2 + Math.random() * 0.05,
    depth: 0.03 + Math.random() * 0.02,
  }), []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const pos = getPositionOnPath(bookData.path, bookData.progress);
    let yOffset = 0;

    if (bookData.progress >= 1 && !hasArrivedRef.current) {
      hasArrivedRef.current = true;
      bounceRef.current = 0;
    }

    if (hasArrivedRef.current) {
      bounceRef.current += delta * 4;
      const bounce = Math.sin(bounceRef.current) * Math.exp(-bounceRef.current * 0.5) * 0.1;
      yOffset = Math.max(0, bounce);
    }

    meshRef.current.position.set(pos.x, pos.y + yOffset, pos.z);
    meshRef.current.rotation.y = Math.sin(bounceRef.current) * 0.1;
  });

  return (
    <mesh ref={meshRef} castShadow>
      <boxGeometry args={[size.width, size.height, size.depth]} />
      <meshLambertMaterial color={bookData.book.coverColor} emissive={bookData.book.coverColor} emissiveIntensity={0.2} />
    </mesh>
  );
}

export default function SortingAnimation() {
  const sortingBooks = useLibraryStore((state) => state.sortingBooks);

  return (
    <group>
      {sortingBooks.map((sb) => (
        <SortingBook
          key={sb.book.id + sb.progress}
          bookData={{
            book: sb.book,
            path: sb.path,
            progress: sb.progress,
          }}
        />
      ))}
    </group>
  );
}
