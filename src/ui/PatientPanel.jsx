import React, { useState, useEffect } from 'react'
import { findBed, patients, departments, severityColor } from '../data/hospital.js'
import { useStore } from '../store.js'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'team', label: 'Care Team' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'meds', label: 'Medications' },
  { id: 'history', label: 'History' },
  { id: 'social', label: 'Social' },
  { id: 'tests', label: 'Tests & Imaging' },
]

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function avatarColor(id) {
  const palette = ['#38bdf8', '#a78bfa', '#fb7185', '#fbbf24', '#34d399', '#f472b6', '#60a5fa']
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 1000
  return palette[hash % palette.length]
}

export default function PatientPanel() {
  const selectedBedId = useStore((s) => s.selectedBedId)
  const closePanel = useStore((s) => s.closePanel)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    setTab('overview')
  }, [selectedBedId])

  if (!selectedBedId) return null
  const located = findBed(selectedBedId)
  if (!located) return null
  const { floor, room, bed } = located
  const patient = bed.patientId ? patients[bed.patientId] : null
  if (!patient) return null

  const dept = departments[room.dept]
  const sevColor = severityColor[patient.severity]

  return (
    <aside className="patient-panel" onClick={(e) => e.stopPropagation()}>
      <header className="panel-header">
        <div className="panel-header-top">
          <div>
            <div className="panel-title">{patient.name}</div>
            <div className="panel-subtitle">
              {patient.age} y/o {patient.sex === 'M' ? 'male' : 'female'} · {patient.mrn}
            </div>
          </div>
          <button className="close-btn" onClick={closePanel} title="Close">
            ✕
          </button>
        </div>

        <div className="chip-row">
          <span className="chip" style={{ borderColor: dept.color, color: dept.color }}>
            {dept.name}
          </span>
          <span className="chip">
            {floor.id} · Room {room.id} · Bed {bed.id}
          </span>
          <span
            className="chip sev-dot"
            style={{ '--sev-color': sevColor, color: sevColor, borderColor: sevColor }}
          >
            {patient.severity.toUpperCase()}
          </span>
          <span className="chip">Status: {patient.status}</span>
          <span className="chip">Blood {patient.bloodType}</span>
        </div>

        <div className="vitals-grid">
          <Vital label="HR" value={`${patient.vitals.hr}`} unit="bpm" />
          <Vital label="BP" value={patient.vitals.bp} unit="mmHg" />
          <Vital label="SpO₂" value={`${patient.vitals.spo2}`} unit="%" />
          <Vital label="Temp" value={`${patient.vitals.temp}`} unit="°C" />
          <Vital label="Resp" value={`${patient.vitals.resp}`} unit="/min" />
        </div>
      </header>

      <nav className="tab-bar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="tab-body">
        {tab === 'overview' && <Overview patient={patient} room={room} floor={floor} bed={bed} />}
        {tab === 'team' && <CareTeam patient={patient} />}
        {tab === 'schedule' && <Schedule patient={patient} />}
        {tab === 'meds' && <Medications patient={patient} />}
        {tab === 'history' && <History patient={patient} />}
        {tab === 'social' && <Social patient={patient} />}
        {tab === 'tests' && <Tests patient={patient} />}
      </div>
    </aside>
  )
}

function Vital({ label, value, unit }) {
  return (
    <div className="vital">
      <div className="vital-label">{label}</div>
      <div className="vital-value">
        {value} <span className="muted">{unit}</span>
      </div>
    </div>
  )
}

function Overview({ patient, room, floor, bed }) {
  return (
    <>
      <h4 className="section-title">Primary Diagnosis</h4>
      <div className="list-card">
        <div className="list-card-name">{patient.primaryDiagnosis}</div>
        <div className="list-card-detail">Admitted {patient.admitted}</div>
      </div>

      <h4 className="section-title">Allergies</h4>
      <div className="list-card">
        <div className="list-card-detail">
          {patient.allergies.length ? patient.allergies.join(' · ') : 'None known'}
        </div>
      </div>

      <h4 className="section-title">Location</h4>
      <div className="list-card">
        <div className="list-card-name">{floor.name}</div>
        <div className="list-card-detail">
          Room {room.id} · Bed {bed.id}
        </div>
      </div>

      <h4 className="section-title">Snapshot</h4>
      <div className="list-card">
        <div className="list-card-detail">
          {patient.careTeam.length} on care team · {patient.medications.length} active meds ·{' '}
          {patient.schedule.length} events today · {patient.tests.length} results on file
        </div>
      </div>
    </>
  )
}

function CareTeam({ patient }) {
  const docs = patient.careTeam.filter((s) => s.role !== 'Nurse')
  const nurses = patient.careTeam.filter((s) => s.role === 'Nurse')

  return (
    <>
      <h4 className="section-title">Physicians</h4>
      {docs.length === 0 && <div className="empty">No physician assigned.</div>}
      {docs.map((d) => (
        <StaffCard key={d.id} staff={d} />
      ))}

      <h4 className="section-title" style={{ marginTop: 18 }}>Nursing</h4>
      {nurses.length === 0 && <div className="empty">No nurse assigned.</div>}
      {nurses.map((n) => (
        <StaffCard key={n.id} staff={n} />
      ))}
    </>
  )
}

function StaffCard({ staff }) {
  return (
    <div className="staff-card">
      <div className="avatar" style={{ background: avatarColor(staff.id) }}>
        {initials(staff.name)}
      </div>
      <div>
        <div className="staff-name">{staff.name}</div>
        <div className="staff-role">
          {staff.role} · {staff.specialty}
        </div>
      </div>
      <div className="staff-meta">
        {staff.shift}
        <br />
        Pg {staff.pager}
      </div>
    </div>
  )
}

function Schedule({ patient }) {
  return (
    <>
      <h4 className="section-title">Today's schedule</h4>
      <div className="list-card" style={{ padding: '4px 14px' }}>
        {patient.schedule.map((s, i) => (
          <div key={i} className="schedule-row">
            <div className="schedule-time">{s.time}</div>
            <div>
              <div className="schedule-task">{s.task}</div>
              <div className="schedule-who">{s.who}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function Medications({ patient }) {
  return (
    <>
      <h4 className="section-title">Active prescriptions</h4>
      {patient.medications.map((m, i) => (
        <div key={i} className="list-card">
          <div className="list-card-row">
            <div className="list-card-name">{m.drug}</div>
            <div className="list-card-detail">
              {m.dose} · {m.route}
            </div>
          </div>
          <div className="list-card-detail">
            {m.freq} · started {m.started}
          </div>
        </div>
      ))}
    </>
  )
}

function History({ patient }) {
  return (
    <>
      <h4 className="section-title">Past medical events</h4>
      {patient.history.length === 0 && <div className="empty">No prior history on file.</div>}
      {patient.history.map((h, i) => (
        <div key={i} className="list-card">
          <div className="list-card-row">
            <div className="list-card-name">{h.event}</div>
            <div className="list-card-detail">{h.date}</div>
          </div>
          <div className="list-card-detail">{h.detail}</div>
        </div>
      ))}
    </>
  )
}

function Social({ patient }) {
  return (
    <>
      <h4 className="section-title">Social & treatments</h4>
      {patient.social.map((s, i) => (
        <div key={i} className="list-card">
          <div className="list-card-name">{s.area}</div>
          <div className="list-card-detail">{s.detail}</div>
        </div>
      ))}
    </>
  )
}

function Tests({ patient }) {
  const imaging = patient.tests.filter((t) => t.type === 'Imaging')
  const labs = patient.tests.filter((t) => t.type === 'Lab')

  return (
    <>
      <h4 className="section-title">Imaging</h4>
      {imaging.length === 0 && <div className="empty">No imaging on file.</div>}
      {imaging.map((t) => (
        <TestRow key={t.id} t={t} />
      ))}

      <h4 className="section-title" style={{ marginTop: 18 }}>Labs & blood work</h4>
      {labs.length === 0 && <div className="empty">No labs on file.</div>}
      {labs.map((t) => (
        <TestRow key={t.id} t={t} />
      ))}
    </>
  )
}

function TestRow({ t }) {
  return (
    <div className="test-row">
      <div>
        <div className="test-name">
          <span className="test-type-badge">{t.type}</span>
          {t.name}
        </div>
        <div className="test-detail">
          {t.id} · {t.date} · {t.result}
        </div>
      </div>
      <div className={`test-status ${t.status === 'Final' ? 'final' : 'pending'}`}>{t.status}</div>
    </div>
  )
}
