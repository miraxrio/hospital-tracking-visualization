import { useEffect, useRef } from 'react'
import { useStore } from './store.js'
import { patients } from './data/hospital.js'
import { medScheduleTimes, parseTime, timeInRange } from './sim.js'

const PATIENT_IDS = Object.keys(patients)

// Roughly one random event per ~15 simulated minutes. Adjust to taste.
const RANDOM_EVENTS_PER_SIM_MINUTE = 1 / 15

const RANDOM_TEMPLATES = [
  (p) => ({ type: 'info', msg: `Vitals checked for ${p.name} · HR ${p.vitals.hr}, SpO₂ ${p.vitals.spo2}%` }),
  (p) => ({ type: 'info', msg: `New lab result filed for ${p.name}` }),
  (p) => ({ type: 'info', msg: `Family check-in: ${p.name}'s relative arrived` }),
  (p) => ({ type: 'info', msg: `Dressing change complete for ${p.name}` }),
  (p) => ({ type: 'info', msg: `Pharmacy delivery for ${p.name}` }),
  (p) => ({ type: 'info', msg: `${p.name}: bed bath complete` }),
  (p) => ({ type: 'info', msg: `${p.name}: call light answered` }),
  (p) => ({ type: 'alert', msg: `ALERT · ${p.name} call light · response dispatched` }),
  (p) => ({ type: 'alert', msg: `ALERT · ${p.name} vitals trending — re-checking` }),
]

const MED_LATE_CHANCE = 0.12

export default function Scheduler() {
  const time = useStore((s) => s.timeOfDay)
  const running = useStore((s) => s.simulationRunning)
  const lastTimeRef = useRef(null)

  useEffect(() => {
    if (!running) {
      lastTimeRef.current = null
      return
    }
    if (lastTimeRef.current === null) {
      lastTimeRef.current = time
      return
    }
    const prev = lastTimeRef.current
    const curr = time
    lastTimeRef.current = curr

    let dt = curr - prev
    if (dt < 0) dt += 1440
    if (dt < 0.05) return

    const push = useStore.getState().pushEvent

    for (const pid of PATIENT_IDS) {
      const p = patients[pid]

      // Scheduled tasks from patient.schedule (skip free-form like "Q1H")
      for (const sch of p.schedule) {
        if (!/^\d{1,2}:\d{2}$/.test(sch.time)) continue
        const target = parseTime(sch.time)
        if (timeInRange(prev, curr, target)) {
          push({
            type: 'schedule',
            time: target,
            message: `${p.name}: ${sch.task} — ${sch.who}`,
          })
        }
      }

      // Medication doses
      for (const med of p.medications) {
        const times = medScheduleTimes(med.freq)
        for (const t of times) {
          if (timeInRange(prev, curr, t)) {
            const late = Math.random() < MED_LATE_CHANCE
            push({
              type: late ? 'alert' : 'meds',
              time: t,
              message: late
                ? `${p.name} · ${med.drug} ${med.dose} ${med.route} — DELAYED`
                : `${p.name} receiving ${med.drug} ${med.dose} ${med.route}`,
            })
          }
        }
      }
    }

    // Random color/flavor events, rate-limited to dt sim minutes
    const expected = dt * RANDOM_EVENTS_PER_SIM_MINUTE
    if (Math.random() < expected) {
      const pid = PATIENT_IDS[Math.floor(Math.random() * PATIENT_IDS.length)]
      const tpl = RANDOM_TEMPLATES[Math.floor(Math.random() * RANDOM_TEMPLATES.length)]
      const ev = tpl(patients[pid])
      push({ type: ev.type, time: curr, message: ev.msg })
    }
  }, [time, running])

  return null
}
