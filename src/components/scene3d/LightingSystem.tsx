import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
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
      distance={8}
      decay={1.5}
      intensity={0.8}
    />
  );
}

export default function LightingSystem() {
  const lightIntensity = useLibraryStore((state) => state.lightIntensity);
  const devices = useLibraryStore((state) => state.devices);
  const envData = useLibraryStore((state) => state.envData);
  const thresholds = useLibraryStore((state) => state.thresholds);
  const setLightIntensity = useLibraryStore((state) => state.setLightIntensity);

  const lightDevices = useMemo(
    () => devices.filter((d: Device) => d.type === 'light').slice(0, 6),
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

  return (
    <group>
      {lightDevices.map((device) => (
        <LightDevice key={device.id} device={device} globalIntensity={lightIntensity} />
      ))}
    </group>
  );
}
