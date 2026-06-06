import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useLibraryStore } from '@/store'
import { Suspense } from 'react'
import ShelfGroup from './ShelfGroup'
import ReadingArea from './ReadingArea'
import KioskMachine from './KioskMachine'
import ConveyorBelt from './ConveyorBelt'
import MonitorCenter from './MonitorCenter'
import SortingAnimation from './SortingAnimation'
import TransferPath from './TransferPath'
import EmergencyRoutes from './EmergencyRoutes'
import InventoryRobot from './InventoryRobot'
import LightingSystem from './LightingSystem'

export default function LibraryScene() {
  const { shelves, seats, devices, lightIntensity, robots, hotPredictions, emergencyEvent, sortingBooks } = useLibraryStore()
  const kioskDevices = devices.filter(d => d.type === 'kiosk')
  const conveyorDevices = devices.filter(d => d.type === 'conveyor')
  const activeTransfers = hotPredictions.filter(p => p.transferStatus === 'in_transit')

  return (
    <div className="w-full h-full" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        camera={{ position: [12, 10, 12], fov: 60 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#2a2a4e']} />
        <fog attach="fog" args={['#2a2a4e', 30, 80]} />

        <ambientLight intensity={0.8} />
        <directionalLight
          position={[10, 15, 10]}
          intensity={1.5}
        />
        <pointLight position={[0, 8, 0]} intensity={1.0} color="#ffd700" />
        <pointLight position={[-10, 6, -5]} intensity={0.6} color="#87ceeb" />
        <pointLight position={[10, 6, -5]} intensity={0.6} color="#87ceeb" />
        <pointLight position={[-10, 6, 5]} intensity={0.6} color="#ffd700" />
        <pointLight position={[10, 6, 5]} intensity={0.6} color="#ffd700" />

        <Suspense fallback={null}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[50, 50]} />
            <meshLambertMaterial color="#3d3d5c" />
          </mesh>

          <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[40, 40]} />
            <meshLambertMaterial
              color="#4d4d6c"
              transparent
              opacity={0.4}
            />
          </mesh>

          <gridHelper
            args={[50, 50, '#6a6a8a', '#5a5a7a']}
            position={[0, 0.01, 0]}
          />

          {shelves.slice(0, 10).map(shelf => (
            <ShelfGroup key={shelf.id} shelf={shelf} />
          ))}

          <ReadingArea seats={seats.filter(s => s.areaId === 'area-reading-1')} />
          <ReadingArea seats={seats.filter(s => s.areaId === 'area-reading-2')} />

          {kioskDevices.map(device => (
            <KioskMachine key={device.id} device={device} />
          ))}

          {conveyorDevices.map(device => (
            <ConveyorBelt key={device.id} device={device} />
          ))}

          <MonitorCenter position={[0, 0, -10] as [number, number, number]} />

          {sortingBooks.length > 0 && <SortingAnimation />}

          {activeTransfers.length > 0 && <TransferPath />}

          {emergencyEvent && emergencyEvent.status === 'active' && (
            <EmergencyRoutes />
          )}

          {robots.length > 0 && <InventoryRobot />}

          <LightingSystem />

          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={3}
            maxDistance={50}
            maxPolarAngle={Math.PI / 2.1}
            target={[0, 1, 0]}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
