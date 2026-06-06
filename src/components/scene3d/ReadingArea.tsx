import { useMemo } from 'react'
import type { Seat } from '../../../shared/types'
import SeatModel from './SeatModel'

interface ReadingAreaProps {
  seats: Seat[]
}

export default function ReadingArea({ seats }: ReadingAreaProps) {
  const areaStats = useMemo(() => {
    const total = seats.length
    const available = seats.filter(s => s.status === 'available').length
    const occupied = seats.filter(s => s.status === 'occupied').length
    const reserved = seats.filter(s => s.status === 'reserved').length
    const utilization = total > 0 ? ((total - available) / total * 100).toFixed(1) : '0'
    return { total, available, occupied, reserved, utilization }
  }, [seats])

  const tables = useMemo(() => {
    const tableMap = new Map<string, Seat[]>()
    seats.forEach(seat => {
      const key = `${seat.areaId}-table-${Math.floor(seat.col / 2)}`
      if (!tableMap.has(key)) {
        tableMap.set(key, [])
      }
      tableMap.get(key)!.push(seat)
    })
    return Array.from(tableMap.entries())
  }, [seats])

  const areaId = seats[0]?.areaId || 'reading-1'
  const areaName = seats[0]?.areaName || '阅览区'
  const baseX = areaId === 'reading-1' ? -10 : 10
  const baseZ = -2

  return (
    <group position={[baseX, 0, baseZ]}>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[7, 5]} />
        <meshLambertMaterial color="#1e293b" />
      </mesh>

      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.8, 4.8]} />
        <meshLambertMaterial color="#334155" />
      </mesh>

      {tables.map(([tableKey, tableSeats], tableIdx) => {
        const rowIdx = Math.floor(tableIdx / 2)
        const colIdx = tableIdx % 2
        const tableX = (colIdx - 0.5) * 2.5
        const tableZ = (rowIdx - 0.5) * 2

        return (
          <group key={tableKey} position={[tableX, 0, tableZ]}>
            <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.8, 0.08, 0.8]} />
              <meshLambertMaterial color="#78350f" />
            </mesh>

            <mesh position={[-0.7, 0.15, 0]} castShadow>
              <boxGeometry args={[0.08, 0.3, 0.08]} />
              <meshLambertMaterial color="#451a03" />
            </mesh>
            <mesh position={[0.7, 0.15, 0]} castShadow>
              <boxGeometry args={[0.08, 0.3, 0.08]} />
              <meshLambertMaterial color="#451a03" />
            </mesh>

            <mesh position={[0, 0.42, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.3, 8]} />
              <meshLambertMaterial color="#64748b" />
            </mesh>
            <mesh position={[0, 0.58, 0]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshLambertMaterial
                color="#fbbf24"
                emissive="#fbbf24"
                emissiveIntensity={0.6}
                transparent
                opacity={0.9}
              />
            </mesh>
            <pointLight position={[0, 0.8, 0]} intensity={0.5} color="#fbbf24" distance={3} />

            {tableSeats.map((seat, seatIdx) => {
              const seatSide = seatIdx % 2 === 0 ? -1 : 1
              const seatOffset = Math.floor(seatIdx / 2) * 0.6 - 0.3
              return (
                <group key={seat.id} position={[seatOffset, 0, seatSide * 0.9]}>
                  <SeatModel seat={seat} />
                </group>
              )
            })}
          </group>
        )
      })}

      <mesh position={[0, 0.1, -1.5]}>
        <boxGeometry args={[4, 0.03, 0.15]} />
        <meshLambertMaterial
          color="#1e40af"
          emissive="#1e40af"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  )
}
