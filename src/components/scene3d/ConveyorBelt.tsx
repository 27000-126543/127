import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { Device } from '../../../shared/types'
import { useLibraryStore } from '@/store'

interface ConveyorBeltProps {
  device: Device
}

export default function ConveyorBelt({ device }: ConveyorBeltProps) {
  const beltRef = useRef<THREE.Mesh>(null)
  const rollersRef = useRef<THREE.Group>(null)
  const { sortingBooks, books } = useLibraryStore()

  const beltLength = 10
  const beltWidth = 1.2
  const rollerCount = 12

  const rollers = useMemo(() => {
    return Array.from({ length: rollerCount }).map((_, i) => ({
      position: [-beltLength / 2 + (i / (rollerCount - 1)) * beltLength, 0.1, 0],
    }))
  }, [])

  useFrame(() => {
    if (beltRef.current && device.status === 'on') {
      const material = beltRef.current.material as THREE.MeshLambertMaterial
      material.emissiveIntensity = 0.2 + Math.sin(Date.now() * 0.005) * 0.1
    }
    if (rollersRef.current && device.status === 'on') {
      rollersRef.current.children.forEach((roller) => {
        roller.rotation.x += 0.05
      })
    }
  })

  const renderSortingBooks = () => {
    return sortingBooks.map((sb) => {
      const pathIndex = Math.floor(sb.progress * sb.path.length)
      const currentPos = sb.path[Math.min(pathIndex, sb.path.length - 1)]
      const nextPos = sb.path[Math.min(pathIndex + 1, sb.path.length - 1)]
      const t = (sb.progress * sb.path.length) % 1

      const interpolatedPos = {
        x: currentPos.x + (nextPos.x - currentPos.x) * t,
        y: currentPos.y + (nextPos.y - currentPos.y) * t,
        z: currentPos.z + (nextPos.z - currentPos.z) * t,
      }

      const book = books.find(b => b.id === sb.book.id) || sb.book

      return (
        <group key={sb.book.id} position={[interpolatedPos.x, interpolatedPos.y, interpolatedPos.z]}>
          <mesh castShadow>
            <boxGeometry args={[0.08, 0.25, 0.35]} />
            <meshLambertMaterial
              color={book.coverColor}
              emissive={book.coverColor}
              emissiveIntensity={0.3}
            />
          </mesh>
          <pointLight
            position={[0, 0.5, 0]}
            color={book.coverColor}
            intensity={0.5}
            distance={2}
          />
        </group>
      )
    })
  }

  return (
    <group position={[device.position.x, device.position.y, device.position.z]}>
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[beltLength + 0.4, 0.1, beltWidth + 0.4]} />
        <meshLambertMaterial color="#111827" />
      </mesh>

      <group ref={rollersRef}>
        {rollers.map((roller, idx) => (
          <mesh key={idx} position={roller.position as [number, number, number]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, beltWidth, 16]} />
            <meshLambertMaterial color="#4b5563" />
          </mesh>
        ))}
      </group>

      <mesh ref={beltRef} position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[beltLength, beltWidth]} />
        <meshLambertMaterial
          color="#1f2937"
          emissive="#374151"
          emissiveIntensity={0.1}
        />
      </mesh>

      <mesh position={[-beltLength / 2 - 0.1, 0.5, 0]} castShadow>
        <boxGeometry args={[0.2, 0.6, beltWidth + 0.2]} />
        <meshLambertMaterial color="#374151" />
      </mesh>
      <mesh position={[beltLength / 2 + 0.1, 0.5, 0]} castShadow>
        <boxGeometry args={[0.2, 0.6, beltWidth + 0.2]} />
        <meshLambertMaterial color="#374151" />
      </mesh>

      <mesh position={[0, 0.5, -beltWidth / 2 - 0.1]} castShadow>
        <boxGeometry args={[beltLength, 0.6, 0.2]} />
        <meshLambertMaterial color="#374151" />
      </mesh>
      <mesh position={[0, 0.5, beltWidth / 2 + 0.1]} castShadow>
        <boxGeometry args={[beltLength, 0.6, 0.2]} />
        <meshLambertMaterial color="#374151" />
      </mesh>

      {renderSortingBooks()}

      <group position={[-beltLength / 2 - 0.1, 0.9, 0]}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.1, 0.15, 16]} />
          <meshLambertMaterial
            color={device.status === 'on' ? '#22c55e' : device.status === 'error' ? '#ef4444' : '#6b7280'}
            emissive={device.status === 'on' ? '#16a34a' : device.status === 'error' ? '#dc2626' : '#4b5563'}
            emissiveIntensity={0.6}
          />
        </mesh>
        <pointLight
          position={[0, 0.3, 0]}
          color={device.status === 'on' ? '#22c55e' : device.status === 'error' ? '#ef4444' : '#6b7280'}
          intensity={device.status !== 'off' ? 0.5 : 0}
          distance={2}
        />
      </group>

      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[3, 0.02, 0.02]} />
        <meshLambertMaterial
          color={device.status === 'on' ? '#22c55e' : '#6b7280'}
          emissive={device.status === 'on' ? '#16a34a' : '#000000'}
          emissiveIntensity={0.5}
        />
      </mesh>

      <group position={[beltLength / 2 + 0.5, 0.4, 0]}>
        <mesh position={[0, 0, 0.3]}>
          <boxGeometry args={[0.02, 0.8, 0.6]} />
          <meshLambertMaterial
            color={device.status === 'on' ? '#0ea5e9' : '#374151'}
            emissive={device.status === 'on' ? '#0284c7' : '#000000'}
            emissiveIntensity={device.status === 'on' ? 0.4 : 0}
          />
        </mesh>
      </group>

      {sortingBooks.length > 0 && (
        <Html
          position={[0, 1.5, 0]}
          center
          distanceFactor={10}
          zIndexRange={[100, 0]}
        >
          <div className="bg-gray-900/95 text-white px-4 py-2 rounded-lg text-xs whitespace-nowrap border border-cyan-600 shadow-lg">
            <div className="font-bold text-cyan-400 mb-1">分拣进行中</div>
            <div className="text-gray-300">
              正在分拣: {sortingBooks.length} 本图书
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}
