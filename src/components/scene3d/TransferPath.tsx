import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useLibraryStore } from '../../store';
import type { Position3D, HotBookPrediction } from '../../../shared/types';

interface FlowMaterialProps {
  speed?: number;
  color?: string;
}

function FlowMaterial({ speed = 2, color = '#22c55e' }: FlowMaterialProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uSpeed: { value: 1 / speed },
    }),
    [color, speed]
  );

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uSpeed;
    varying vec2 vUv;

    void main() {
      float flow = fract(vUv.x - uTime * uSpeed);
      float pulse = sin(flow * 3.14159) * 0.5 + 0.5;
      float alpha = smoothstep(0.0, 0.3, flow) * smoothstep(1.0, 0.7, flow) * 0.8;
      alpha += pulse * 0.3;
      vec3 glow = uColor * (1.0 + pulse * 0.5);
      gl_FragColor = vec4(glow, alpha);
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

interface SinglePathProps {
  path: Position3D[];
}

function SinglePath({ path }: SinglePathProps) {
  const curve = useMemo(() => {
    const points = path.map((p) => new THREE.Vector3(p.x, p.y, p.z));
    return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
  }, [path]);

  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 128, 0.08, 16, false);
  }, [curve]);

  return (
    <mesh geometry={tubeGeometry}>
      <FlowMaterial speed={2} color="#22c55e" />
    </mesh>
  );
}

export default function TransferPath() {
  const hotPredictions = useLibraryStore((state) => state.hotPredictions);

  const inTransitPredictions = useMemo(
    () => hotPredictions.filter((p: HotBookPrediction) => p.transferStatus === 'in_transit'),
    [hotPredictions]
  );

  return (
    <group>
      {inTransitPredictions.map((prediction) => (
        <SinglePath key={prediction.bookId} path={prediction.transferPath} />
      ))}
    </group>
  );
}
