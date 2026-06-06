import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useLibraryStore } from '../../store';
import type { InventoryRobot as RobotType, Position3D, MisshelvedBook } from '../../../shared/types';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function getPositionOnPath(path: Position3D[], progress: number): Position3D {
  if (path.length === 0) return { x: 0, y: 0, z: 0 };
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

function getPathLength(path: Position3D[]): number {
  let length = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const dx = path[i + 1].x - path[i].x;
    const dy = path[i + 1].y - path[i].y;
    const dz = path[i + 1].z - path[i].z;
    length += Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  return length;
}

interface RobotProps {
  robot: RobotType;
}

function Robot({ robot }: RobotProps) {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.Mesh>(null);
  const scanRef = useRef<THREE.Mesh>(null);
  const scanMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const timeRef = useRef(0);
  const lastMisshelvedCheck = useRef(0);

  const pathLength = useMemo(() => getPathLength(robot.currentPath), [robot.currentPath]);
  const speed = 0.3;

  const updateRobotPosition = useLibraryStore((state) => state.updateRobotPosition);
  const addMisshelvedBook = useLibraryStore((state) => state.addMisshelvedBook);
  const books = useLibraryStore((state) => state.books);
  const shelves = useLibraryStore((state) => state.shelves);

  useFrame((_, delta) => {
    if (!groupRef.current || !lightRef.current || !scanRef.current) return;

    timeRef.current += delta;

    let newProgress = robot.progress;
    if (robot.status === 'scanning' && robot.currentPath.length > 0) {
      const progressPerSecond = speed / Math.max(pathLength, 0.1);
      newProgress = (robot.progress + progressPerSecond * delta) % 1;
    }

    const pos = getPositionOnPath(robot.currentPath, newProgress);

    groupRef.current.position.set(pos.x, pos.y, pos.z);

    if (robot.status === 'scanning' && robot.currentPath.length > 1) {
      const nextPos = getPositionOnPath(robot.currentPath, Math.min(newProgress + 0.01, 1));
      const angle = Math.atan2(nextPos.x - pos.x, nextPos.z - pos.z);
      groupRef.current.rotation.y = angle;
    }

    if (lightRef.current) {
      const blink = Math.sin(timeRef.current * 4) * 0.5 + 0.5;
      const material = lightRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.3 + blink * 0.7;
      material.color.setHex(blink > 0.5 ? 0x22c55e : 0xeab308);
    }

    if (scanRef.current && scanMaterialRef.current) {
      scanRef.current.rotation.y += delta * 2;
      const scanPulse = Math.sin(timeRef.current * 3) * 0.5 + 0.5;
      scanMaterialRef.current.opacity = 0.1 + scanPulse * 0.3;
      scanRef.current.scale.setScalar(1 + scanPulse * 0.1);
    }

    if (newProgress !== robot.progress) {
      updateRobotPosition(robot.id, pos, newProgress);
    }

    if (robot.status === 'scanning') {
      lastMisshelvedCheck.current += delta;
      if (lastMisshelvedCheck.current > 3) {
        lastMisshelvedCheck.current = 0;
        if (Math.random() < 0.1) {
          const misshelvedBook = books.find((b) => b.status === 'available');
          const wrongShelf = shelves[Math.floor(Math.random() * shelves.length)];
          const correctShelf = shelves.find((s) => s.id === misshelvedBook?.location.shelfId) || shelves[0];

          if (misshelvedBook && wrongShelf.id !== correctShelf.id) {
            const newMisshelved: MisshelvedBook = {
              id: generateId(),
              bookId: misshelvedBook.id,
              bookTitle: misshelvedBook.title,
              currentShelfId: wrongShelf.id,
              currentShelfName: wrongShelf.name,
              targetShelfId: correctShelf.id,
              targetShelfName: correctShelf.name,
              detectedTime: new Date().toISOString(),
              status: 'pending',
            };
            addMisshelvedBook(newMisshelved);
          }
        }
      }
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.25, 0.3, 16]} />
        <meshLambertMaterial color="#3b82f6" />
      </mesh>

      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 0.15, 16]} />
        <meshLambertMaterial color="#1e40af" />
      </mesh>

      <mesh position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.15, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshLambertMaterial color="#60a5fa" />
      </mesh>

      <mesh ref={lightRef} position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.8} />
      </mesh>

      <mesh ref={scanRef} position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.8, 32]} />
        <meshBasicMaterial
          ref={scanMaterialRef}
          color="#3b82f6"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[-0.15, 0.05, 0]}>
        <boxGeometry args={[0.08, 0.08, 0.08]} />
        <meshLambertMaterial color="#1f2937" />
      </mesh>

      <mesh position={[0.15, 0.05, 0]}>
        <boxGeometry args={[0.08, 0.08, 0.08]} />
        <meshLambertMaterial color="#1f2937" />
      </mesh>
    </group>
  );
}

export default function InventoryRobot() {
  const robots = useLibraryStore((state) => state.robots);

  useEffect(() => {
    robots.forEach((robot) => {
      if (robot.currentPath.length === 0) {
        console.warn(`Robot ${robot.id} has empty path`);
      }
    });
  }, [robots]);

  return (
    <group>
      {robots.map((robot) => (
        <Robot key={robot.id} robot={robot} />
      ))}
    </group>
  );
}
