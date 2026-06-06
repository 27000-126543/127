import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Shelf, Book } from '../../../shared/types'
import { useLibraryStore } from '@/store'
import BookModel from './BookModel'

interface ShelfGroupProps {
  shelf: Shelf
}

export default function ShelfGroup({ shelf }: ShelfGroupProps) {
  const shelfRef = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const { books, selectBook, selectedBook } = useLibraryStore()

  const capacityRate = shelf.currentCount / shelf.capacity
  const isOverloaded = capacityRate > 0.9

  const shelfBooks = useMemo(() => {
    return books.filter(b => b.location.shelfId === shelf.id).slice(0, 8)
  }, [books, shelf.id])

  useFrame(() => {
    if (isOverloaded && glowRef.current) {
      const material = glowRef.current.material as THREE.MeshLambertMaterial
      material.emissiveIntensity = 0.3 + Math.sin(Date.now() * 0.003) * 0.2
    }
  })

  const shelfColor = isOverloaded ? '#ff4444' : '#8b7355'
  const shelfHeight = Math.min(shelf.levels, 3) * 0.4 + 0.2

  const renderShelfLevel = (levelIndex: number) => {
    const levelBooks = shelfBooks.filter(b => b.location.shelfLevel === levelIndex).slice(0, 4)
    const booksPerRow = 8
    const bookWidth = 0.08
    const bookSpacing = 0.09
    const totalWidth = booksPerRow * bookSpacing

    return (
      <group key={levelIndex} position={[0, 0.3 + levelIndex * 0.4, 0]}>
        <mesh position={[0, -0.02, 0]} receiveShadow>
          <boxGeometry args={[2.2, 0.04, 0.5]} />
          <meshLambertMaterial color={shelfColor} />
        </mesh>
        {levelBooks.map((book, idx) => {
          const pos = idx % booksPerRow
          const x = -totalWidth / 2 + pos * bookSpacing + bookSpacing / 2
          return (
            <BookModel
              key={book.id}
              book={book}
              position={[x, 0.15, 0]}
              onClick={() => selectBook(selectedBook?.id === book.id ? null : book)}
            />
          )
        })}
      </group>
    )
  }

  return (
    <group
      ref={shelfRef}
      position={[shelf.position.x, shelf.position.y, shelf.position.z]}
      rotation={[shelf.rotation.x, shelf.rotation.y, shelf.rotation.z]}
    >
      <mesh castShadow receiveShadow position={[0, shelfHeight / 2, 0]}>
        <boxGeometry args={[2.3, shelfHeight, 0.55]} />
        <meshLambertMaterial
          color={shelfColor}
          emissive={isOverloaded ? '#ff0000' : '#000000'}
          emissiveIntensity={isOverloaded ? 0.2 : 0}
        />
      </mesh>

      {isOverloaded && (
        <mesh ref={glowRef} position={[0, shelfHeight / 2, 0]}>
          <boxGeometry args={[2.5, shelfHeight + 0.2, 0.65]} />
          <meshLambertMaterial
            color="#ff4444"
            transparent
            opacity={0.15}
            emissive="#ff0000"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}

      {Array.from({ length: Math.min(shelf.levels, 3) }).map((_, i) => renderShelfLevel(i))}

      <mesh position={[-1.2, shelfHeight / 2, 0]} castShadow>
        <boxGeometry args={[0.1, shelfHeight, 0.55]} />
        <meshLambertMaterial color={shelfColor} />
      </mesh>
      <mesh position={[1.2, shelfHeight / 2, 0]} castShadow>
        <boxGeometry args={[0.1, shelfHeight, 0.55]} />
        <meshLambertMaterial color={shelfColor} />
      </mesh>
    </group>
  )
}
