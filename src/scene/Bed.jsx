import React, { useRef } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { patients, severityColor } from '../data/hospital.js'
import { useStore } from '../store.js'

// One bed unit. Local space: bed lies flat on x/z, headboard on +z side.
export default function Bed({ bed, position, rotationY = 0, showLabels }) {
  const group = useRef()
  const pulseRef = useRef()
  const patient = bed.patientId ? patients[bed.patientId] : null
  const selected = useStore((s) => s.selectedBedId === bed.id)
  const hovered = useStore((s) => s.hoveredBedId === bed.id)
  const selectBed = useStore((s) => s.selectBed)
  const setHovered = useStore((s) => s.setHovered)

  const occupied = !!patient
  const sevColor = patient ? severityColor[patient.severity] : '#475569'

  useFrame((state) => {
    if (pulseRef.current && patient) {
      const t = state.clock.elapsedTime
      const speed = patient.severity === 'critical' ? 4 : patient.severity === 'high' ? 2.5 : 1.5
      const scale = 1 + Math.sin(t * speed) * 0.18
      pulseRef.current.scale.setScalar(scale)
    }
    if (group.current && (hovered || selected)) {
      const t = state.clock.elapsedTime
      group.current.position.y = 0.02 + Math.sin(t * 3) * 0.015
    } else if (group.current) {
      group.current.position.y = 0
    }
  })

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <group
        ref={group}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(bed.id)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          if (useStore.getState().hoveredBedId === bed.id) setHovered(null)
          document.body.style.cursor = 'default'
        }}
        onClick={(e) => {
          e.stopPropagation()
          if (occupied) selectBed(bed.id)
        }}
      >
        {/* Bed frame */}
        <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.7, 0.08, 1.6]} />
          <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.5} />
        </mesh>

        {/* Mattress */}
        <mesh position={[0, 0.22, 0]} castShadow>
          <boxGeometry args={[0.66, 0.12, 1.5]} />
          <meshStandardMaterial color={occupied ? '#cbd5e1' : '#94a3b8'} roughness={0.85} />
        </mesh>

        {/* Pillow (head end at +z) */}
        <mesh position={[0, 0.30, 0.6]} castShadow>
          <boxGeometry args={[0.55, 0.06, 0.28]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.9} />
        </mesh>

        {/* Headboard */}
        <mesh position={[0, 0.35, 0.78]} castShadow>
          <boxGeometry args={[0.7, 0.36, 0.06]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>

        {/* Bed legs */}
        {[
          [-0.3, 0.04, 0.7],
          [0.3, 0.04, 0.7],
          [-0.3, 0.04, -0.7],
          [0.3, 0.04, -0.7],
        ].map((p, i) => (
          <mesh key={i} position={p}>
            <boxGeometry args={[0.05, 0.08, 0.05]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        ))}

        {/* Side rails */}
        {occupied && (
          <>
            <mesh position={[-0.34, 0.34, 0]}>
              <boxGeometry args={[0.02, 0.12, 1.2]} />
              <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[0.34, 0.34, 0]}>
              <boxGeometry args={[0.02, 0.12, 1.2]} />
              <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
            </mesh>
          </>
        )}

        {/* Patient body (a stylized blanket lump) */}
        {occupied && (
          <mesh position={[0, 0.36, -0.05]} castShadow>
            <boxGeometry args={[0.5, 0.16, 1.05]} />
            <meshStandardMaterial color={sevColor} roughness={0.85} />
          </mesh>
        )}

        {/* IV pole */}
        {occupied && (
          <group position={[0.42, 0, 0.55]}>
            <mesh position={[0, 0.55, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 1.1, 8]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh position={[0, 1.05, 0]}>
              <boxGeometry args={[0.16, 0.18, 0.06]} />
              <meshStandardMaterial color="#cbd5e1" />
            </mesh>
            <mesh position={[0, 1.05, 0.05]}>
              <boxGeometry args={[0.06, 0.10, 0.02]} />
              <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.6} />
            </mesh>
          </group>
        )}

        {/* Severity pulse beacon above bed */}
        {occupied && (
          <group position={[0, 1.05, 0]}>
            <mesh ref={pulseRef}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshBasicMaterial color={sevColor} transparent opacity={0.18} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial
                color={sevColor}
                emissive={sevColor}
                emissiveIntensity={1.4}
                roughness={0.2}
              />
            </mesh>
          </group>
        )}

        {/* Selection ring */}
        {(selected || hovered) && (
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.55, 0.65, 32]} />
            <meshBasicMaterial color={selected ? '#38bdf8' : '#94a3b8'} transparent opacity={0.85} />
          </mesh>
        )}

        {/* HTML label */}
        {showLabels && occupied && (
          <Html position={[0, 1.35, 0]} center distanceFactor={9} zIndexRange={[10, 0]}>
            <div className="bed-label">
              {patient.name}
              <div className="small">
                {bed.id} · {patient.status}
              </div>
            </div>
          </Html>
        )}
      </group>
    </group>
  )
}
