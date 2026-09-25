// Eligibility data. Keep in sync with "Supported Vehicles.docx" (v1.1, 25 Sep 2026).
//
// status:   "eligible"    - supported, subject to build date / engine / transmission
//           "conditional" - high risk, must be verified per-VIN before charging
//           "excluded"    - researched exclusion, never supported
// cutoff:   build must be BEFORE this {year, month}; null = all build dates OK
// mhevRisk: trims that may carry a hidden 48V mild-hybrid starter-generator
// note:     shown to the customer in the result box

const BMW_CUTOFF = { year: 2021, month: 3 };

const VEHICLES = {
  "Toyota": {
    "Supra": [
      { code: "A90", label: "A90 (2019–2020)", trims: "2.0L, 3.0L", status: "eligible", cutoff: null,
        note: "Supras don't have BMW's secure-coding lock, so every build year is supported." },
      { code: "A91", label: "A91 (2021+ facelift)", trims: "2.0L, 3.0L", status: "eligible", cutoff: null,
        note: "Supras don't have BMW's secure-coding lock, so every build year is supported." },
    ],
  },
  "BMW": {
    "3 Series": [
      { code: "G20", label: "G20 Sedan", trims: "320i, 330i, M340i", status: "eligible", cutoff: BMW_CUTOFF, mhevRisk: true },
      { code: "G21", label: "G21 Touring (wagon)", trims: "320i, 330i, M340i", status: "eligible", cutoff: BMW_CUTOFF, mhevRisk: true },
    ],
    "4 Series": [
      { code: "G22", label: "G22 Coupe", trims: "420i, 430i, M440i", status: "eligible", cutoff: BMW_CUTOFF, mhevRisk: true },
      { code: "G23", label: "G23 Convertible", trims: "420i, 430i, M440i", status: "eligible", cutoff: BMW_CUTOFF, mhevRisk: true },
      { code: "G26", label: "G26 Gran Coupe (4-door)", status: "excluded",
        note: "The 4 Series Gran Coupe went into production in late 2021, after BMW locked coding, so no build date qualifies." },
    ],
    "5 Series": [
      { code: "G30/G31 LCI", label: "G30 / G31 facelift (LCI, mid-2020 on)", trims: "520i, 530i, 540i, M550i", status: "eligible", cutoff: BMW_CUTOFF, mhevRisk: true,
        note: "The car must be the facelift (LCI) model with iDrive 7." },
      { code: "G30/G31 pre-LCI", label: "G30 / G31 pre-facelift (2017 – mid-2020)", status: "excluded",
        note: "Pre-facelift 5 Series cars don't have the iDrive 7 head unit that this feature needs." },
      { code: "G60/G61", label: "G60 / G61 (2023+)", status: "excluded",
        note: "Current-generation cars are coding-locked from launch (iDrive 8.5+ and NCD 2.0/3.0)." },
    ],
    "7 Series": [
      { code: "G11/G12 LCI", label: "G11 / G12 facelift (LCI)", trims: "740i, 750i, M760Li", status: "eligible", cutoff: BMW_CUTOFF },
      { code: "G70", label: "G70 (2022+)", status: "excluded",
        note: "Current-generation cars are coding-locked from launch (iDrive 8.5+ and NCD 2.0/3.0)." },
    ],
    "8 Series": [
      { code: "G14", label: "G14 Convertible", trims: "840i, M850i", status: "eligible", cutoff: BMW_CUTOFF },
      { code: "G15", label: "G15 Coupe", trims: "840i, M850i", status: "eligible", cutoff: BMW_CUTOFF },
      { code: "G16", label: "G16 Gran Coupe", trims: "840i, M850i", status: "eligible", cutoff: BMW_CUTOFF },
    ],
    "X3": [
      { code: "G01", label: "G01", trims: "xDrive30i, M40i", status: "conditional", cutoff: BMW_CUTOFF,
        note: "The X3 has mixed hardware, and most cars reject this coding even with a qualifying build date. We check your specific car before charging anything." },
    ],
    "X4": [
      { code: "G02", label: "G02", trims: "xDrive30i, M40i", status: "conditional", cutoff: BMW_CUTOFF,
        note: "The X4 has mixed hardware, and most cars reject this coding even with a qualifying build date. We check your specific car before charging anything." },
    ],
    "X5": [
      { code: "G05", label: "G05", trims: "xDrive40i, M50i", status: "eligible", cutoff: BMW_CUTOFF, mhevRisk: true },
    ],
    "X6": [
      { code: "G06", label: "G06", trims: "xDrive40i, M50i", status: "eligible", cutoff: BMW_CUTOFF, mhevRisk: true },
    ],
    "X7": [
      { code: "G07", label: "G07", trims: "xDrive40i, M50i", status: "eligible", cutoff: BMW_CUTOFF, mhevRisk: true },
    ],
    "M2": [
      { code: "G87", label: "G87 (2023+)", status: "excluded",
        note: "The G87 M2 is coding-locked from launch (iDrive 8 and NCD 2.0)." },
    ],
    "M3": [
      { code: "G80", label: "G80", status: "excluded",
        note: "The G80 M3 is coding-locked from launch, so no build date qualifies." },
    ],
    "M4": [
      { code: "G82", label: "G82 Coupe", status: "excluded",
        note: "The G82/G83 M4 is coding-locked from launch, so no build date qualifies." },
      { code: "G83", label: "G83 Convertible", status: "excluded",
        note: "The G82/G83 M4 is coding-locked from launch, so no build date qualifies." },
    ],
    "M5": [
      { code: "F90 LCI", label: "F90 facelift (LCI)", trims: "M5, M5 Competition", status: "eligible", cutoff: BMW_CUTOFF },
      { code: "G90", label: "G90 (2024+)", status: "excluded",
        note: "Current-generation cars are coding-locked from launch (iDrive 8.5+ and NCD 2.0/3.0)." },
    ],
    "M8": [
      { code: "F91", label: "F91 Convertible", trims: "M8, M8 Competition", status: "eligible", cutoff: BMW_CUTOFF },
      { code: "F92", label: "F92 Coupe", trims: "M8, M8 Competition", status: "eligible", cutoff: BMW_CUTOFF },
      { code: "F93", label: "F93 Gran Coupe", trims: "M8, M8 Competition", status: "eligible", cutoff: BMW_CUTOFF },
    ],
    "X5 M": [
      { code: "F95", label: "F95", trims: "X5 M, X5 M Competition", status: "eligible", cutoff: BMW_CUTOFF },
    ],
    "X6 M": [
      { code: "F96", label: "F96", trims: "X6 M, X6 M Competition", status: "eligible", cutoff: BMW_CUTOFF },
    ],
    "i4 / iX / other electric": [
      { code: "EV", label: "Any fully electric BMW", status: "excluded",
        note: "Electric cars have no engine control unit to code remote start into." },
    ],
  },
};
