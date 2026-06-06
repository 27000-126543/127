import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useLibraryStore } from '../../store';
import type { EmergencyRoute, Position3D } from '../../../shared/types';

interface DashedLineMaterialProps {
  color: string;
  interval?: number;
}

function DashedLineMaterial({ color, interval = 1 }: DashedLineMaterialProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uInterval: { value: interval },
    }),
    [color, interval]
  );

  const vertexShader = `
    varying float vDistance;
    void main() {
      vDistance = position.x;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uInterval;
    varying float vDistance;

    void main() {
      float dashPattern = sin(vDistance * 20.0 - uTime * 3.14159 / uInterval) * 0.5 + 0.5;
      float dash = step(0.5, dashPattern);
      float blink = sin(uTime * 3.14159 / uInterval) * 0.5 + 0.5;
      float alpha = dash * (0.3 + blink * 0.7);
      gl_FragColor = vec4(uColor, alpha);
    }
  `;

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
    }
  });

  return (
    <shaderMaterial
      ref={materialRef}
      uniforms={uniforms}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      transparent
      side={THREE.DoubleSide}
      blending={THREE.AdditiveBlending}
      depthWrite={false}
    />
  );
}

interface RouteLineProps {
  route: EmergencyRoute;
  color: string;
}

function RouteLine({ route, color }: RouteLineProps) {
  const points = useMemo(() => {
    const positions: Position3D[] = [];
    const pathPoints = route.points;

    for (let i = 0; i < pathPoints.length - 1; i++) {
      const start = pathPoints[i];
      const end = pathPoints[i + 1];
      for (let t = 0; t <= 1; t += 0.02) {
        positions.push({
          x: start.x + (end.x - start.x) * t,
          y: start.y + (end.y - start.y) * t,
          z: start.z + (end.z - start.z) * t,
        });
      }
    }

    const vectors = positions.map((p) => new THREE.Vector3(p.x, p.y, p.z));
    const geometry = new THREE.BufferGeometry().setFromPoints(vectors);
    return geometry;
  }, [route]);

  return (
    <lineSegments geometry={points}>
      <DashedLineMaterial color={color} interval={1} />
    </lineSegments>
  );
}

interface RouteTubeProps {
  route: EmergencyRoute;
  color: string;
}

function RouteTube({ route, color }: RouteTubeProps) {
  const curve = useMemo(() => {
    const points = route.points.map((p) => new THREE.Vector3(p.x, p.y, p.z));
    return new THREE.CatmullRomCurve3(points, false, 'centripetal', 0);
  }, [route]);

  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 128, 0.06, 12, false);
  }, [curve]);

  return (
    <mesh geometry={tubeGeometry}>
      <DashedLineMaterial color={color} interval={1} />
    </mesh>
  );
}

export default function EmergencyRoutes() {
  const emergencyEvent = useLibraryStore((state) => state.emergencyEvent);

  if (!emergencyEvent || emergencyEvent.status !== 'active') {
    return null;
  }

  return (
    <group>
      {emergencyEvent.escapeRoutes.map((route, index) => (
        <group key={`escape-${index}`}>
          <RouteLine route={route} color="#22c55e" />
          <RouteTube route={route} color="#22c55e" />
        </group>
      ))}
      {emergencyEvent.rescueRoutes.map((route, index) => (
        <group key={`rescue-${index}`}>
          <RouteLine route={route} color="#f97316" />
          <RouteTube route={route} color="#f97316" />
        </group>
      ))}
    </group>
  );
}
