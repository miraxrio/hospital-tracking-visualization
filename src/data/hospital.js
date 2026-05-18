// Mock hospital dataset. All identities, dates, and clinical details are synthetic.

export const departments = {
  ER: { name: 'Emergency', color: '#ef4444', accent: '#fca5a5' },
  ICU: { name: 'Intensive Care', color: '#a855f7', accent: '#d8b4fe' },
  CARD: { name: 'Cardiology', color: '#ec4899', accent: '#f9a8d4' },
  PED: { name: 'Pediatrics', color: '#22c55e', accent: '#86efac' },
  ONCO: { name: 'Oncology', color: '#0ea5e9', accent: '#7dd3fc' },
  ORTH: { name: 'Orthopedics', color: '#f59e0b', accent: '#fcd34d' },
}

export const staff = [
  { id: 'd1', role: 'Attending', name: 'Dr. Elena Vargas', specialty: 'Cardiology', shift: '07:00-19:00', pager: '#4471' },
  { id: 'd2', role: 'Attending', name: 'Dr. Marcus Lee', specialty: 'Internal Medicine', shift: '07:00-19:00', pager: '#4472' },
  { id: 'd3', role: 'Resident', name: 'Dr. Priya Shah', specialty: 'Emergency', shift: '19:00-07:00', pager: '#4473' },
  { id: 'd4', role: 'Attending', name: 'Dr. Hiro Tanaka', specialty: 'Oncology', shift: '08:00-18:00', pager: '#4474' },
  { id: 'd5', role: 'Attending', name: 'Dr. Amelia Brooks', specialty: 'Pediatrics', shift: '08:00-20:00', pager: '#4475' },
  { id: 'd6', role: 'Attending', name: 'Dr. Samir Khoury', specialty: 'Orthopedics', shift: '07:00-17:00', pager: '#4476' },
  { id: 'd7', role: 'Surgeon', name: 'Dr. Naledi Okafor', specialty: 'Cardiothoracic', shift: '06:00-16:00', pager: '#4477' },
  { id: 'n1', role: 'Nurse', name: 'RN Olivia Hart', specialty: 'ICU', shift: '07:00-19:00', pager: '#5510' },
  { id: 'n2', role: 'Nurse', name: 'RN Liam Park', specialty: 'Cardiology', shift: '19:00-07:00', pager: '#5511' },
  { id: 'n3', role: 'Nurse', name: 'RN Sofia Romano', specialty: 'Pediatrics', shift: '07:00-19:00', pager: '#5512' },
  { id: 'n4', role: 'Nurse', name: 'RN Jamal Carter', specialty: 'Emergency', shift: '19:00-07:00', pager: '#5513' },
  { id: 'n5', role: 'Nurse', name: 'RN Mei Chen', specialty: 'Oncology', shift: '07:00-19:00', pager: '#5514' },
  { id: 'n6', role: 'Nurse', name: 'RN Daniel Costa', specialty: 'Orthopedics', shift: '07:00-19:00', pager: '#5515' },
]

const lookup = (id) => staff.find((s) => s.id === id)

const patient = (data) => ({
  ...data,
  careTeam: data.careTeam.map(lookup),
})

export const patients = {
  P001: patient({
    id: 'P001',
    name: 'Arthur Bennett',
    age: 68,
    sex: 'M',
    mrn: 'MRN-49213',
    admitted: '2026-05-12',
    primaryDiagnosis: 'Acute myocardial infarction (NSTEMI)',
    status: 'Stable',
    severity: 'high',
    allergies: ['Penicillin', 'Shellfish'],
    bloodType: 'A+',
    vitals: { hr: 78, bp: '128/82', spo2: 96, temp: 36.8, resp: 16 },
    careTeam: ['d1', 'd7', 'n2'],
    schedule: [
      { time: '08:00', task: 'Cardio rounds', who: 'Dr. Vargas' },
      { time: '10:30', task: 'Echocardiogram', who: 'Imaging Lab 2' },
      { time: '14:00', task: 'Cardiac rehab consult', who: 'PT Wilson' },
      { time: '20:00', task: 'Evening meds', who: 'RN Park' },
    ],
    medications: [
      { drug: 'Aspirin', dose: '81 mg', route: 'PO', freq: 'Daily', started: '2026-05-12' },
      { drug: 'Atorvastatin', dose: '40 mg', route: 'PO', freq: 'Daily', started: '2026-05-12' },
      { drug: 'Metoprolol', dose: '25 mg', route: 'PO', freq: 'BID', started: '2026-05-13' },
      { drug: 'Heparin', dose: '5000 U', route: 'SC', freq: 'Q12H', started: '2026-05-12' },
    ],
    history: [
      { date: '2024-11', event: 'Hypertension diagnosed', detail: 'Started on lisinopril' },
      { date: '2022-03', event: 'Type 2 Diabetes', detail: 'Managed with metformin' },
      { date: '2019-08', event: 'Cholecystectomy', detail: 'Laparoscopic, uncomplicated' },
    ],
    social: [
      { area: 'Smoking', detail: 'Former smoker, quit 2018 (35 pack-years)' },
      { area: 'Alcohol', detail: 'Social, 2-3 drinks/week' },
      { area: 'Living', detail: 'Lives with spouse; one daughter local' },
      { area: 'Support', detail: 'Cardiac rehab referral pending; social work follow-up' },
    ],
    tests: [
      { id: 'T-001', type: 'Imaging', name: 'Chest X-Ray', date: '2026-05-12', result: 'No acute findings', status: 'Final' },
      { id: 'T-002', type: 'Imaging', name: 'ECG 12-lead', date: '2026-05-12', result: 'ST depression V3-V5', status: 'Final' },
      { id: 'T-003', type: 'Lab', name: 'Troponin I', date: '2026-05-12', result: '0.42 ng/mL ↑', status: 'Final' },
      { id: 'T-004', type: 'Lab', name: 'CBC', date: '2026-05-13', result: 'WBC 7.8, Hgb 13.2', status: 'Final' },
      { id: 'T-005', type: 'Imaging', name: 'Echocardiogram', date: '2026-05-18', result: 'Scheduled', status: 'Pending' },
    ],
  }),
  P002: patient({
    id: 'P002',
    name: 'Linh Tran',
    age: 34,
    sex: 'F',
    mrn: 'MRN-51820',
    admitted: '2026-05-16',
    primaryDiagnosis: 'Acute appendicitis — post-op day 1',
    status: 'Improving',
    severity: 'medium',
    allergies: ['None known'],
    bloodType: 'O-',
    vitals: { hr: 84, bp: '118/74', spo2: 98, temp: 37.2, resp: 14 },
    careTeam: ['d2', 'n4'],
    schedule: [
      { time: '09:00', task: 'Surgical follow-up', who: 'Dr. Lee' },
      { time: '11:00', task: 'Wound check', who: 'RN Carter' },
      { time: '15:00', task: 'Ambulation trial', who: 'PT Wilson' },
    ],
    medications: [
      { drug: 'Acetaminophen', dose: '1 g', route: 'PO', freq: 'Q6H PRN', started: '2026-05-16' },
      { drug: 'Ondansetron', dose: '4 mg', route: 'IV', freq: 'Q8H PRN', started: '2026-05-16' },
      { drug: 'Cefazolin', dose: '1 g', route: 'IV', freq: 'Q8H', started: '2026-05-16' },
    ],
    history: [
      { date: '2021-06', event: 'Migraine workup', detail: 'Normal MRI; sumatriptan PRN' },
    ],
    social: [
      { area: 'Smoking', detail: 'Never' },
      { area: 'Alcohol', detail: 'Rare, < 1/week' },
      { area: 'Living', detail: 'Lives alone; sibling helping post-op' },
      { area: 'Work', detail: 'Software engineer, WFH; 1 week leave approved' },
    ],
    tests: [
      { id: 'T-101', type: 'Imaging', name: 'Abdominal CT', date: '2026-05-16', result: 'Appendicitis confirmed', status: 'Final' },
      { id: 'T-102', type: 'Lab', name: 'WBC w/ diff', date: '2026-05-16', result: '14.2 ×10⁹/L ↑', status: 'Final' },
      { id: 'T-103', type: 'Lab', name: 'BMP', date: '2026-05-17', result: 'Within range', status: 'Final' },
    ],
  }),
  P003: patient({
    id: 'P003',
    name: 'Kofi Mensah',
    age: 7,
    sex: 'M',
    mrn: 'MRN-22014',
    admitted: '2026-05-17',
    primaryDiagnosis: 'Severe asthma exacerbation',
    status: 'Improving',
    severity: 'medium',
    allergies: ['Dust mites', 'Cat dander'],
    bloodType: 'B+',
    vitals: { hr: 102, bp: '102/68', spo2: 94, temp: 37.0, resp: 22 },
    careTeam: ['d5', 'n3'],
    schedule: [
      { time: '08:30', task: 'Peds rounds', who: 'Dr. Brooks' },
      { time: '10:00', task: 'Nebulizer treatment', who: 'RT Davies' },
      { time: '13:00', task: 'Pulmonary function', who: 'Imaging Lab 1' },
      { time: '18:00', task: 'Parent education', who: 'RN Romano' },
    ],
    medications: [
      { drug: 'Albuterol', dose: '2.5 mg neb', route: 'INH', freq: 'Q4H', started: '2026-05-17' },
      { drug: 'Prednisolone', dose: '20 mg', route: 'PO', freq: 'Daily ×5d', started: '2026-05-17' },
      { drug: 'Ipratropium', dose: '0.5 mg neb', route: 'INH', freq: 'Q6H', started: '2026-05-17' },
    ],
    history: [
      { date: '2024-02', event: 'Asthma diagnosis', detail: 'Mild persistent — ICS started' },
      { date: '2025-01', event: 'ER visit', detail: 'Viral-triggered exacerbation' },
    ],
    social: [
      { area: 'Family', detail: 'Lives with both parents; older sibling' },
      { area: 'School', detail: '2nd grade — note for missed days requested' },
      { area: 'Triggers', detail: 'Cat at home (relocated), seasonal pollen' },
      { area: 'Support', detail: 'Social work — asthma action plan w/ school nurse' },
    ],
    tests: [
      { id: 'T-201', type: 'Imaging', name: 'Chest X-Ray', date: '2026-05-17', result: 'Hyperinflation, no consolidation', status: 'Final' },
      { id: 'T-202', type: 'Lab', name: 'CBC', date: '2026-05-17', result: 'Eosinophilia mild', status: 'Final' },
      { id: 'T-203', type: 'Lab', name: 'Blood gas (venous)', date: '2026-05-17', result: 'pH 7.36, pCO₂ 44', status: 'Final' },
    ],
  }),
  P004: patient({
    id: 'P004',
    name: 'Margarethe Holm',
    age: 81,
    sex: 'F',
    mrn: 'MRN-67302',
    admitted: '2026-05-10',
    primaryDiagnosis: 'Septic shock — urinary source',
    status: 'Critical',
    severity: 'critical',
    allergies: ['Sulfa drugs'],
    bloodType: 'AB+',
    vitals: { hr: 118, bp: '92/58', spo2: 91, temp: 38.6, resp: 24 },
    careTeam: ['d1', 'd3', 'n1'],
    schedule: [
      { time: '07:00', task: 'ICU rounds', who: 'Dr. Vargas' },
      { time: '09:00', task: 'Arterial line check', who: 'RN Hart' },
      { time: 'Q1H', task: 'Vitals + I/O', who: 'RN Hart' },
      { time: '16:00', task: 'Family meeting', who: 'Social work' },
    ],
    medications: [
      { drug: 'Norepinephrine', dose: '0.08 mcg/kg/min', route: 'IV drip', freq: 'Titrate', started: '2026-05-10' },
      { drug: 'Meropenem', dose: '1 g', route: 'IV', freq: 'Q8H', started: '2026-05-10' },
      { drug: 'Vancomycin', dose: '15 mg/kg', route: 'IV', freq: 'Q12H', started: '2026-05-10' },
      { drug: 'Pantoprazole', dose: '40 mg', route: 'IV', freq: 'Daily', started: '2026-05-10' },
    ],
    history: [
      { date: '2025-09', event: 'Recurrent UTI', detail: '3 episodes in 12 months' },
      { date: '2023-04', event: 'Atrial fibrillation', detail: 'On apixaban (held)' },
      { date: '2018-07', event: 'Total knee replacement', detail: 'Right knee' },
    ],
    social: [
      { area: 'Living', detail: 'Assisted living facility — Maple Ridge' },
      { area: 'Family', detail: 'Two sons; eldest is HCP proxy' },
      { area: 'Goals of care', detail: 'Full code — pending family meeting' },
      { area: 'Support', detail: 'Chaplaincy involved; palliative consult considered' },
    ],
    tests: [
      { id: 'T-301', type: 'Lab', name: 'Blood culture ×2', date: '2026-05-10', result: 'E. coli — ESBL negative', status: 'Final' },
      { id: 'T-302', type: 'Lab', name: 'Urinalysis', date: '2026-05-10', result: 'Nitrites +, WBC > 100', status: 'Final' },
      { id: 'T-303', type: 'Lab', name: 'Lactate', date: '2026-05-17', result: '2.1 mmol/L (down from 4.8)', status: 'Final' },
      { id: 'T-304', type: 'Imaging', name: 'CT abdomen/pelvis', date: '2026-05-11', result: 'Pyelonephritis, no abscess', status: 'Final' },
      { id: 'T-305', type: 'Imaging', name: 'Bedside echo', date: '2026-05-15', result: 'EF 45%, mild LVH', status: 'Final' },
    ],
  }),
  P005: patient({
    id: 'P005',
    name: 'Jonas Weber',
    age: 52,
    sex: 'M',
    mrn: 'MRN-31988',
    admitted: '2026-05-14',
    primaryDiagnosis: 'Stage III colon adenocarcinoma — chemo cycle 3',
    status: 'Stable',
    severity: 'medium',
    allergies: ['Latex'],
    bloodType: 'A-',
    vitals: { hr: 72, bp: '124/78', spo2: 97, temp: 36.5, resp: 14 },
    careTeam: ['d4', 'n5'],
    schedule: [
      { time: '09:30', task: 'Onc rounds', who: 'Dr. Tanaka' },
      { time: '11:00', task: 'FOLFOX infusion', who: 'Infusion suite' },
      { time: '15:00', task: 'Nutrition consult', who: 'Dietitian Park' },
    ],
    medications: [
      { drug: 'Oxaliplatin', dose: '85 mg/m²', route: 'IV', freq: 'Cycle day 1', started: '2026-05-14' },
      { drug: '5-Fluorouracil', dose: '400 mg/m²', route: 'IV bolus', freq: 'Cycle day 1', started: '2026-05-14' },
      { drug: 'Leucovorin', dose: '400 mg/m²', route: 'IV', freq: 'Cycle day 1', started: '2026-05-14' },
      { drug: 'Ondansetron', dose: '8 mg', route: 'IV', freq: 'Pre-chemo', started: '2026-05-14' },
    ],
    history: [
      { date: '2026-01', event: 'Colon adenoCA diagnosed', detail: 'Sigmoid, T3N1M0' },
      { date: '2026-02', event: 'Sigmoid resection', detail: 'Laparoscopic; clean margins' },
      { date: '2020-11', event: 'GERD', detail: 'PPI as needed' },
    ],
    social: [
      { area: 'Smoking', detail: 'Never' },
      { area: 'Alcohol', detail: 'Discontinued since diagnosis' },
      { area: 'Living', detail: 'Married, two teenagers' },
      { area: 'Work', detail: 'Architect — reduced schedule during treatment' },
      { area: 'Support', detail: 'Oncology social work, peer support group attending' },
    ],
    tests: [
      { id: 'T-401', type: 'Imaging', name: 'CT chest/abd/pelvis', date: '2026-04-30', result: 'No evidence of disease', status: 'Final' },
      { id: 'T-402', type: 'Lab', name: 'CEA', date: '2026-05-14', result: '2.1 ng/mL (down from 5.6)', status: 'Final' },
      { id: 'T-403', type: 'Lab', name: 'CBC pre-chemo', date: '2026-05-14', result: 'ANC 3.2, plt 188', status: 'Final' },
      { id: 'T-404', type: 'Lab', name: 'CMP', date: '2026-05-14', result: 'LFTs normal', status: 'Final' },
    ],
  }),
  P006: patient({
    id: 'P006',
    name: 'Aisha Rahman',
    age: 29,
    sex: 'F',
    mrn: 'MRN-77410',
    admitted: '2026-05-15',
    primaryDiagnosis: 'Tibial plateau fracture — ORIF post-op day 2',
    status: 'Stable',
    severity: 'low',
    allergies: ['Codeine (nausea)'],
    bloodType: 'O+',
    vitals: { hr: 68, bp: '116/72', spo2: 99, temp: 36.7, resp: 14 },
    careTeam: ['d6', 'n6'],
    schedule: [
      { time: '08:00', task: 'Ortho rounds', who: 'Dr. Khoury' },
      { time: '10:00', task: 'PT weight-bear trial', who: 'PT Wilson' },
      { time: '14:00', task: 'Dressing change', who: 'RN Costa' },
    ],
    medications: [
      { drug: 'Oxycodone', dose: '5 mg', route: 'PO', freq: 'Q4H PRN', started: '2026-05-15' },
      { drug: 'Acetaminophen', dose: '1 g', route: 'PO', freq: 'Q6H', started: '2026-05-15' },
      { drug: 'Enoxaparin', dose: '40 mg', route: 'SC', freq: 'Daily', started: '2026-05-15' },
    ],
    history: [
      { date: '2023-05', event: 'ACL repair (left)', detail: 'Hamstring autograft' },
    ],
    social: [
      { area: 'Smoking', detail: 'Never' },
      { area: 'Activity', detail: 'Competitive cyclist — injured in road crash' },
      { area: 'Living', detail: 'Lives with partner; ground-floor apartment' },
      { area: 'Work', detail: 'Physiotherapy clinic — remote admin for 4 weeks' },
    ],
    tests: [
      { id: 'T-501', type: 'Imaging', name: 'Knee X-Ray AP/lat', date: '2026-05-15', result: 'Hardware well-positioned', status: 'Final' },
      { id: 'T-502', type: 'Imaging', name: 'Knee CT 3D', date: '2026-05-15', result: 'Comminuted lateral plateau', status: 'Final' },
      { id: 'T-503', type: 'Lab', name: 'CBC post-op', date: '2026-05-16', result: 'Hgb 11.4 (baseline 13.0)', status: 'Final' },
    ],
  }),
}

// Floor / room / bed layout.
// Coordinates are in scene units. Rooms are arranged along two corridors per floor.
const makeRoom = (id, dept, x, z, beds) => ({ id, dept, x, z, beds })

export const hospital = {
  name: 'Northbrook Regional Medical Center',
  floors: [
    {
      id: 'F1',
      level: 0,
      name: 'Ground — Emergency & Imaging',
      rooms: [
        makeRoom('1A', 'ER', -6, -3, [
          { id: '1A-1', patientId: null },
          { id: '1A-2', patientId: null },
        ]),
        makeRoom('1B', 'ER', -2, -3, [
          { id: '1B-1', patientId: 'P002' },
          { id: '1B-2', patientId: null },
        ]),
        makeRoom('1C', 'ER', 2, -3, [
          { id: '1C-1', patientId: 'P003' },
          { id: '1C-2', patientId: null },
        ]),
        makeRoom('1D', 'ORTH', 6, -3, [
          { id: '1D-1', patientId: 'P006' },
          { id: '1D-2', patientId: null },
        ]),
        makeRoom('1E', 'ER', -6, 3, [
          { id: '1E-1', patientId: null },
        ]),
        makeRoom('1F', 'ER', -2, 3, [
          { id: '1F-1', patientId: null },
          { id: '1F-2', patientId: null },
        ]),
        makeRoom('1G', 'ORTH', 2, 3, [
          { id: '1G-1', patientId: null },
        ]),
        makeRoom('1H', 'ORTH', 6, 3, [
          { id: '1H-1', patientId: null },
          { id: '1H-2', patientId: null },
        ]),
      ],
    },
    {
      id: 'F2',
      level: 1,
      name: 'Level 2 — Cardiology & Oncology',
      rooms: [
        makeRoom('2A', 'CARD', -6, -3, [
          { id: '2A-1', patientId: 'P001' },
          { id: '2A-2', patientId: null },
        ]),
        makeRoom('2B', 'CARD', -2, -3, [
          { id: '2B-1', patientId: null },
          { id: '2B-2', patientId: null },
        ]),
        makeRoom('2C', 'CARD', 2, -3, [
          { id: '2C-1', patientId: null },
        ]),
        makeRoom('2D', 'ONCO', 6, -3, [
          { id: '2D-1', patientId: 'P005' },
          { id: '2D-2', patientId: null },
        ]),
        makeRoom('2E', 'CARD', -6, 3, [
          { id: '2E-1', patientId: null },
          { id: '2E-2', patientId: null },
        ]),
        makeRoom('2F', 'ONCO', -2, 3, [
          { id: '2F-1', patientId: null },
        ]),
        makeRoom('2G', 'ONCO', 2, 3, [
          { id: '2G-1', patientId: null },
          { id: '2G-2', patientId: null },
        ]),
        makeRoom('2H', 'ONCO', 6, 3, [
          { id: '2H-1', patientId: null },
        ]),
      ],
    },
    {
      id: 'F3',
      level: 2,
      name: 'Level 3 — ICU & Pediatrics',
      rooms: [
        makeRoom('3A', 'ICU', -6, -3, [
          { id: '3A-1', patientId: 'P004' },
        ]),
        makeRoom('3B', 'ICU', -2, -3, [
          { id: '3B-1', patientId: null },
        ]),
        makeRoom('3C', 'ICU', 2, -3, [
          { id: '3C-1', patientId: null },
        ]),
        makeRoom('3D', 'ICU', 6, -3, [
          { id: '3D-1', patientId: null },
        ]),
        makeRoom('3E', 'PED', -6, 3, [
          { id: '3E-1', patientId: null },
          { id: '3E-2', patientId: null },
        ]),
        makeRoom('3F', 'PED', -2, 3, [
          { id: '3F-1', patientId: null },
          { id: '3F-2', patientId: null },
        ]),
        makeRoom('3G', 'PED', 2, 3, [
          { id: '3G-1', patientId: null },
          { id: '3G-2', patientId: null },
        ]),
        makeRoom('3H', 'PED', 6, 3, [
          { id: '3H-1', patientId: null },
          { id: '3H-2', patientId: null },
        ]),
      ],
    },
  ],
}

export const severityColor = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
}

export function findBed(bedId) {
  for (const floor of hospital.floors) {
    for (const room of floor.rooms) {
      const bed = room.beds.find((b) => b.id === bedId)
      if (bed) return { floor, room, bed }
    }
  }
  return null
}

export function hospitalStats() {
  let beds = 0
  let occupied = 0
  const bySeverity = { low: 0, medium: 0, high: 0, critical: 0 }
  for (const floor of hospital.floors) {
    for (const room of floor.rooms) {
      for (const bed of room.beds) {
        beds += 1
        if (bed.patientId) {
          occupied += 1
          const p = patients[bed.patientId]
          if (p) bySeverity[p.severity] = (bySeverity[p.severity] || 0) + 1
        }
      }
    }
  }
  return { beds, occupied, available: beds - occupied, bySeverity }
}
