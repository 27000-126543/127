import { useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { Device } from '../../../shared/types'
import { useLibraryStore } from '@/store'

interface KioskMachineProps {
  device: Device
}

const statusConfig: Record<string, { color: string; emissive: string; label: string }> = {
  on: { color: '#22c55e', emissive: '#16a34a', label: '运行中' },
  off: { color: '#6b7280', emissive: '#4b5563', label: '已关闭' },
  error: { color: '#ef4444', emissive: '#dc2626', label: '故障' },
}

export default function KioskMachine({ device }: KioskMachineProps) {
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef<THREE.Group>(null)
  const screenRef = useRef<THREE.Mesh>(null)
  const indicatorRef = useRef<THREE.Mesh>(null)
  const { selectedBook, currentUser, borrowBook, returnBook, addNotification } = useLibraryStore()

  const config = statusConfig[device.status]

  useFrame(() => {
    if (indicatorRef.current) {
      const material = indicatorRef.current.material as THREE.MeshLambertMaterial
      material.emissiveIntensity = 0.4 + Math.sin(Date.now() * 0.005) * 0.3
    }
    if (screenRef.current && device.status === 'on') {
      const material = screenRef.current.material as THREE.MeshLambertMaterial
      material.emissiveIntensity = 0.8 + Math.sin(Date.now() * 0.002) * 0.2
    }
  })

  const handleBorrow = () => {
    if (!currentUser || !selectedBook) return
    if (selectedBook.status === 'available') {
      borrowBook(selectedBook.id, currentUser.id)
    } else {
      addNotification({
        title: '无法借阅',
        message: '该书当前不可借阅',
        type: 'warning',
      })
    }
  }

  const handleReturn = () => {
    if (!selectedBook) return
    if (selectedBook.status === 'borrowed') {
      returnBook(selectedBook.id)
    } else {
      addNotification({
        title: '无法归还',
        message: '该书不是借阅状态',
        type: 'warning',
      })
    }
  }

  return (
    <group
      ref={groupRef}
      position={[device.position.x, device.position.y, device.position.z]}
      onPointerOver={() => {
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'auto'
      }}
    >
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.1, 0.8]} />
        <meshLambertMaterial color="#1f2937" />
      </mesh>

      <mesh position={[-0.3, 0.9, 0]} castShadow>
        <boxGeometry args={[0.5, 1.6, 0.6]} />
        <meshLambertMaterial color="#374151" />
      </mesh>

      <mesh position={[0.45, 0.9, 0]} castShadow>
        <boxGeometry args={[0.5, 1.6, 0.6]} />
        <meshLambertMaterial color="#374151" />
      </mesh>

      <mesh position={[0, 1.7, 0]} castShadow>
        <boxGeometry args={[1.2, 0.1, 0.6]} />
        <meshLambertMaterial color="#1f2937" />
      </mesh>

      <mesh ref={screenRef} position={[0, 1.3, 0.31]} rotation={[0.2, 0, 0]}>
        <planeGeometry args={[0.9, 0.6]} />
        <meshLambertMaterial
          color={device.status === 'on' ? '#0ea5e9' : '#1f2937'}
          emissive={device.status === 'on' ? '#0284c7' : '#000000'}
          emissiveIntensity={device.status === 'on' ? 0.8 : 0}
        />
      </mesh>

      <mesh
        position={[-0.3, 0.6, 0.31]}
        onClick={(e) => {
          e.stopPropagation()
          handleBorrow()
        }}
      >
        <boxGeometry args={[0.35, 0.12, 0.02]} />
        <meshLambertMaterial
          color={device.status === 'on' ? '#22c55e' : '#374151'}
          emissive={device.status === 'on' ? '#16a34a' : '#000000'}
          emissiveIntensity={device.status === 'on' ? 0.5 : 0}
        />
      </mesh>

      <mesh
        position={[0.3, 0.6, 0.31]}
        onClick={(e) => {
          e.stopPropagation()
          handleReturn()
        }}
      >
        <boxGeometry args={[0.35, 0.12, 0.02]} />
        <meshLambertMaterial
          color={device.status === 'on' ? '#f97316' : '#374151'}
          emissive={device.status === 'on' ? '#ea580c' : '#000000'}
          emissiveIntensity={device.status === 'on' ? 0.5 : 0}
        />
      </mesh>

      <mesh position={[0, 0.3, 0.31]}>
        <boxGeometry args={[0.5, 0.15, 0.02]} />
        <meshLambertMaterial color="#111827" />
      </mesh>
      <mesh position={[0, 0.3, 0.32]}>
        <boxGeometry args={[0.45, 0.1, 0.01]} />
        <meshLambertMaterial
          color="#1e3a5f"
          emissive="#0ea5e9"
          emissiveIntensity={device.status === 'on' ? 0.3 : 0}
        />
      </mesh>

      <mesh ref={indicatorRef} position={[0, 2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.15, 16]} />
        <meshLambertMaterial
          color={config.color}
          emissive={config.emissive}
          emissiveIntensity={0.6}
        />
      </mesh>

      <pointLight
        position={[0, 2, 0]}
        color={config.color}
        intensity={device.status === 'on' ? 0.5 : 0}
        distance={3}
      />

      {hovered && (
        <Html
          position={[0, 2.5, 0]}
          center
          distanceFactor={8}
          zIndexRange={[100, 0]}
        >
          <div className="bg-gray-900/95 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap border border-gray-700 shadow-lg">
            <div className="font-bold text-sm mb-1">{device.name}</div>
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-gray-300">{config.label}</span>
            </div>
            {device.value !== undefined && (
              <div className="text-gray-300">当前处理: {device.value} 本/小时</div>
            )}
          </div>
        </Html>
      )}
    </group>
  )
}
