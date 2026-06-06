import { useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { Book } from '../../../shared/types'

interface BookModelProps {
  book: Book
  position: [number, number, number]
  onClick?: () => void
}

const statusColors: Record<string, string> = {
  available: '#4ade80',
  borrowed: '#f87171',
  reserved: '#60a5fa',
  misshelved: '#fbbf24',
}

const statusLabels: Record<string, string> = {
  available: '可借阅',
  borrowed: '已借出',
  reserved: '已预约',
  misshelved: '错架',
}

export default function BookModel({ book, position, onClick }: BookModelProps) {
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (meshRef.current && groupRef.current) {
      const targetY = hovered ? position[1] + 0.15 : position[1]
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.15
    }
  })

  const bookWidth = 0.08
  const bookHeight = 0.25
  const bookDepth = 0.35

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'auto'
      }}
    >
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[bookWidth, bookHeight, bookDepth]} />
        <meshLambertMaterial
          color={book.coverColor}
          emissive={hovered ? book.coverColor : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>

      <mesh position={[0, 0, bookDepth / 2 + 0.001]}>
        <planeGeometry args={[bookWidth - 0.01, bookHeight - 0.02]} />
        <meshLambertMaterial color="#ffffff" />
      </mesh>

      <mesh
        position={[bookWidth / 2 + 0.001, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[bookDepth, bookHeight]} />
        <meshLambertMaterial color={book.coverColor} />
      </mesh>

      {hovered && (
        <Html
          position={[0, bookHeight / 2 + 0.2, 0]}
          center
          distanceFactor={6}
          zIndexRange={[100, 0]}
        >
          <div className="bg-gray-900/95 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap border border-gray-700 shadow-lg">
            <div className="font-bold text-sm mb-1">{book.title}</div>
            <div className="text-gray-300">作者: {book.author}</div>
            <div className="text-gray-300">ISBN: {book.isbn}</div>
            <div
              className="mt-1 px-2 py-0.5 rounded-full text-center font-medium"
              style={{ backgroundColor: statusColors[book.status], color: '#000' }}
            >
              {statusLabels[book.status]}
            </div>
          </div>
        </Html>
      )}

      <mesh
        position={[0, -bookHeight / 2 - 0.02, 0]}
        scale={hovered ? 1.2 : 1}
      >
        <cylinderGeometry args={[0.01, 0.01, 0.005, 8]} />
        <meshLambertMaterial
          color={statusColors[book.status]}
          emissive={statusColors[book.status]}
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  )
}
