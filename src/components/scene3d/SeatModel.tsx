import { useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { Seat } from '../../../shared/types'
import { useLibraryStore } from '@/store'

interface SeatModelProps {
  seat: Seat
}

const statusColors: Record<string, { base: string; emissive: string; label: string }> = {
  available: { base: '#22c55e', emissive: '#16a34a', label: '可用' },
  reserved: { base: '#3b82f6', emissive: '#2563eb', label: '已预约' },
  occupied: { base: '#ef4444', emissive: '#dc2626', label: '使用中' },
  maintenance: { base: '#6b7280', emissive: '#4b5563', label: '维护中' },
}

export default function SeatModel({ seat }: SeatModelProps) {
  const [hovered, setHovered] = useState(false)
  const seatRef = useRef<THREE.Group>(null)
  const indicatorRef = useRef<THREE.Mesh>(null)
  const { selectSeat, selectedSeat, currentUser, reserveSeat, checkInSeat, cancelSeatReservation } = useLibraryStore()

  const statusConfig = statusColors[seat.status]
  const isSelected = selectedSeat?.id === seat.id

  useFrame(() => {
    if (indicatorRef.current) {
      const material = indicatorRef.current.material as THREE.MeshLambertMaterial
      material.emissiveIntensity = 0.3 + Math.sin(Date.now() * 0.004) * 0.2
    }
    if (seatRef.current && hovered) {
      seatRef.current.scale.setScalar(1.05)
    } else if (seatRef.current) {
      seatRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1)
    }
  })

  const handleClick = () => {
    if (!currentUser) return

    if (seat.status === 'available' && currentUser.role === 'reader') {
      reserveSeat(seat.id, currentUser.id, 2)
    } else if (seat.status === 'reserved' && seat.currentUserId === currentUser.id) {
      checkInSeat(seat.id, currentUser.id)
    } else if ((seat.status === 'reserved' || seat.status === 'occupied') && seat.currentUserId === currentUser.id) {
      cancelSeatReservation(seat.id)
    }
    selectSeat(isSelected ? null : seat)
  }

  return (
    <group
      ref={seatRef}
      position={[seat.position.x, seat.position.y, seat.position.z]}
      onClick={(e) => {
        e.stopPropagation()
        handleClick()
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
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.22, 0.05, 16]} />
        <meshLambertMaterial
          color={statusConfig.base}
          emissive={hovered || isSelected ? statusConfig.emissive : '#000000'}
          emissiveIntensity={hovered || isSelected ? 0.4 : 0}
        />
      </mesh>

      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.35, 8]} />
        <meshLambertMaterial color="#374151" />
      </mesh>

      <mesh position={[0, 0.025, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.28, 0.3, 0.05, 16]} />
        <meshLambertMaterial color="#1f2937" />
      </mesh>

      <mesh ref={indicatorRef} position={[0, 0.75, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshLambertMaterial
          color={statusConfig.base}
          emissive={statusConfig.emissive}
          emissiveIntensity={0.5}
        />
      </mesh>

      {isSelected && (
        <mesh position={[0, 0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.35, 32]} />
          <meshBasicMaterial
            color={statusConfig.base}
            transparent
            opacity={0.8}
            side={2}
          />
        </mesh>
      )}

      {hovered && (
        <Html
          position={[0, 1.2, 0]}
          center
          distanceFactor={8}
          zIndexRange={[100, 0]}
        >
          <div className="bg-gray-900/95 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap border border-gray-700 shadow-lg min-w-[140px]">
            <div className="font-bold text-sm mb-1">
              {seat.areaName} {seat.row + 1}排{seat.col + 1}座
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: statusConfig.base }}
              />
              <span className="text-gray-300">{statusConfig.label}</span>
            </div>
            {seat.currentUserName && (
              <div className="text-gray-300">使用人: {seat.currentUserName}</div>
            )}
            {seat.reservedUntil && seat.status !== 'available' && (
              <div className="text-gray-400 text-[10px] mt-1">
                至 {new Date(seat.reservedUntil).toLocaleTimeString()}
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  )
}
