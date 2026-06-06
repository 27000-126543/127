import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useLibraryStore } from '@/store';

interface MonitorCenterProps {
  position?: [number, number, number];
}

export default function MonitorCenter({ position = [0, 0, -8] }: MonitorCenterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  const envData = useLibraryStore((state) => state.envData);
  const devices = useLibraryStore((state) => state.devices);
  const robots = useLibraryStore((state) => state.robots);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + 0.1 + Math.sin(timeRef.current * 0.5) * 0.02;
    }
    if (screenRef.current) {
      const material = screenRef.current.material as THREE.MeshLambertMaterial;
      material.emissiveIntensity = 0.5 + Math.sin(timeRef.current * 2) * 0.2;
    }
  });

  const onlineDevices = devices.filter(d => d.status === 'on').length;
  const activeRobots = robots.filter(r => r.status === 'scanning').length;
  const latestEnv = envData.length > 0 ? envData[envData.length - 1] : null;

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, 1.8, 0]} castShadow>
        <boxGeometry args={[3.2, 2.2, 0.2]} />
        <meshLambertMaterial color="#1f2937" />
      </mesh>

      <mesh ref={screenRef} position={[0, 1.8, 0.11]}>
        <planeGeometry args={[3, 1.875]} />
        <meshLambertMaterial
          color="#0f172a"
          emissive="#0ea5e9"
          emissiveIntensity={0.5}
        />
      </mesh>

      <mesh position={[0, 2.5, 0.12]}>
        <boxGeometry args={[2.5, 0.15, 0.02]} />
        <meshLambertMaterial
          color="#1e3a5f"
          emissive="#0ea5e9"
          emissiveIntensity={0.6}
        />
      </mesh>

      <mesh position={[-1, 1.8, 0.12]}>
        <boxGeometry args={[0.8, 0.8, 0.02]} />
        <meshLambertMaterial
          color="#1e293b"
          emissive="#22c55e"
          emissiveIntensity={0.3}
        />
      </mesh>

      <mesh position={[1, 1.8, 0.12]}>
        <boxGeometry args={[0.8, 0.8, 0.02]} />
        <meshLambertMaterial
          color="#1e293b"
          emissive="#3b82f6"
          emissiveIntensity={0.3}
        />
      </mesh>

      <mesh position={[-1, 1, 0.12]}>
        <boxGeometry args={[0.8, 0.5, 0.02]} />
        <meshLambertMaterial
          color="#1e293b"
          emissive="#f59e0b"
          emissiveIntensity={0.3}
        />
      </mesh>

      <mesh position={[1, 1, 0.12]}>
        <boxGeometry args={[0.8, 0.5, 0.02]} />
        <meshLambertMaterial
          color="#1e293b"
          emissive="#ef4444"
          emissiveIntensity={0.3}
        />
      </mesh>

      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[3.5, 0.4, 0.3]} />
        <meshLambertMaterial color="#374151" />
      </mesh>

      <mesh position={[-1.5, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 0.6, 16]} />
        <meshLambertMaterial color="#4b5563" />
      </mesh>

      <mesh position={[1.5, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 0.6, 16]} />
        <meshLambertMaterial color="#4b5563" />
      </mesh>

      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[4, 0.2, 0.8]} />
        <meshLambertMaterial color="#1f2937" />
      </mesh>

      <pointLight position={[0, 2, 0.5]} intensity={1} color="#60a5fa" distance={3} />
    </group>
  );
}
