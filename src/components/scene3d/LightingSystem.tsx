import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useLibraryStore } from '../../store';
import type { Device } from '../../../shared/types';

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

interface LightDeviceProps {
  device: Device;
  globalIntensity: number;
}

function LightDevice({ device, globalIntensity }: LightDeviceProps) {
  const lightRef = useRef<THREE.PointLight>(null);
  const currentIntensityRef = useRef(0);
  const targetIntensityRef = useRef(0);

  useEffect(() => {
    const deviceValue = device.value ?? 100;
    const statusMultiplier = device.status === 'on' ? 1 : 0;
    targetIntensityRef.current = (deviceValue / 100) * globalIntensity * statusMultiplier;
  }, [device, globalIntensity]);

  useFrame((_, delta) => {
    if (!lightRef.current) return;

    currentIntensityRef.current = lerp(
      currentIntensityRef.current,
      targetIntensityRef.current,
      Math.min(delta * 2, 1)
    );

    lightRef.current.intensity = currentIntensityRef.current;
  });

  return (
    <pointLight
      ref={lightRef}
      position={[device.position.x, device.position.y, device.position.z]}
      color="#fff8e7"
      distance={6}
      decay={2}
    />
  );
}

export default function LightingSystem() {
  const { scene } = useThree();

  const ambientRef = useRef<THREE.AmbientLight>(null);
  const directionalRef = useRef<THREE.DirectionalLight>(null);
  const currentAmbientRef = useRef(0.5);
  const currentDirectionalRef = useRef(1);

  const lightIntensity = useLibraryStore((state) => state.lightIntensity);
  const devices = useLibraryStore((state) => state.devices);
  const envData = useLibraryStore((state) => state.envData);
  const thresholds = useLibraryStore((state) => state.thresholds);
  const setLightIntensity = useLibraryStore((state) => state.setLightIntensity);

  const lightDevices = useMemo(
    () => devices.filter((d: Device) => d.type === 'light').slice(0, 8),
    [devices]
  );

  useEffect(() => {
    if (envData.length > 0) {
      const latestEnv = envData[envData.length - 1];
      const { illumination } = latestEnv;
      const { min, max } = thresholds.illumination;

      if (illumination < min) {
        const targetIntensity = 1.0 + ((min - illumination) / min) * 0.5;
        setLightIntensity(Math.min(targetIntensity, 1.5));
      } else if (illumination > max) {
        const targetIntensity = 0.3 - ((illumination - max) / max) * 0.2;
        setLightIntensity(Math.max(targetIntensity, 0.1));
      } else {
        const normalized = (illumination - min) / (max - min);
        setLightIntensity(1.0 - normalized * 0.5);
      }
    }
  }, [envData, thresholds, setLightIntensity]);

  useFrame((_, delta) => {
    if (ambientRef.current) {
      const targetAmbient = 0.3 + lightIntensity * 0.4;
      currentAmbientRef.current = lerp(currentAmbientRef.current, targetAmbient, Math.min(delta * 1.5, 1));
      ambientRef.current.intensity = currentAmbientRef.current;
    }

    if (directionalRef.current) {
      const targetDirectional = lightIntensity;
      currentDirectionalRef.current = lerp(currentDirectionalRef.current, targetDirectional, Math.min(delta * 1.5, 1));
      directionalRef.current.intensity = currentDirectionalRef.current;
    }

    if (scene.fog && scene.fog instanceof THREE.FogExp2) {
      const targetDensity = 0.02 + (1 - lightIntensity) * 0.03;
      scene.fog.density = lerp(scene.fog.density || 0, targetDensity, Math.min(delta, 1));
    }
  });

  return (
    <group>
      <ambientLight ref={ambientRef} intensity={0.5} color="#ffffff" />

      <directionalLight
        ref={directionalRef}
        position={[10, 15, 10]}
        intensity={1}
        color="#fff5e6"
      />

      <hemisphereLight args={['#87ceeb', '#3a5f3a', 0.3]} intensity={0.3} />

      {lightDevices.map((device) => (
        <LightDevice key={device.id} device={device} globalIntensity={lightIntensity} />
      ))}
    </group>
  );
}
