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
        camera={{ position: [15, 15, 15], fov: 60 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#1a1a2e']} />
        <fog attach="fog" args={['#1a1a2e', 20, 50]} />

        <ambientLight intensity={0.4 * lightIntensity} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.2 * lightIntensity}
        />
        <pointLight position={[0, 5, 0]} intensity={0.6 * lightIntensity} color="#ffd700" />
        <pointLight position={[-10, 5, -5]} intensity={0.4 * lightIntensity} color="#87ceeb" />
        <pointLight position={[10, 5, -5]} intensity={0.4 * lightIntensity} color="#87ceeb" />

        <Suspense fallback={null}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <meshLambertMaterial color="#2d2d44" />
          </mesh>

          <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[40, 40]} />
            <meshLambertMaterial
              color="#3d3d5c"
              transparent
              opacity={0.3}
            />
          </mesh>

          <gridHelper
            args={[50, 50, '#4a4a6a', '#3a3a5a']}
            position={[0, 0.01, 0]}
          />

          {shelves.slice(0, 10).map(shelf => (
            <ShelfGroup key={shelf.id} shelf={shelf} />
          ))}

          <ReadingArea seats={seats.filter(s => s.areaId === 'reading-1')} />
          <ReadingArea seats={seats.filter(s => s.areaId === 'reading-2')} />

          {kioskDevices.map(device => (
            <KioskMachine key={device.id} device={device} />
          ))}

          {conveyorDevices.map(device => (
            <ConveyorBelt key={device.id} device={device} />
          ))}

          <MonitorCenter position={[0, 3, -12] as [number, number, number]} />

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
            minDistance={5}
            maxDistance={40}
            maxPolarAngle={Math.PI / 2.1}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
