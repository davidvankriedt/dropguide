# Keg Drop Helper

[**Live Web App**](https://dropguide.vercel.app) • [**Report Bug / Feedback**](https://github.com/davidvankriedt/kegdrop/issues/new)

A mobile-first web tool built for Bevchain logistic drivers to find drop-off points. Eliminates dispatch calls and loading dock confusion by letting drivers crowdsource and access pinpoint drop notes, ramp clearances, and access photos directly on the road.

---

## Core Features

- **Driver Geolocation**: One-tap GPS drop logging (`Drop At Current GPS`) to map loading docks while physically standing at the bay.
- **Interactive Spatial Map**: Full-screen, responsive Leaflet map running high-performance OpenStreetMap raster tiles.
- **Venue Access Intel**:
  - Dock approach instructions, low-clearance warnings, and doorbell locations.
  - Multi-photo access logs (loading bay approach, lockbox locations, ramp entry).
- **In-Place Field Editing**: Tap any existing venue pin on shift to update changing gate codes or upload fresh dock photos.

---

## Tech Stack

- **Framework**: Next.js
- **Styling**: Tailwind CSS
- **Mapping**: Leaflet & React-Leaflet
- **Database & Storage**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Deployment & Telemetry**: Vercel & `@vercel/analytics`

---

## Project Architecture

```text
├── app/
│   ├── layout.tsx              # Root HTML, Leaflet CSS, Suspense-wrapped Analytics
│   ├── page.tsx                # Main view: state coordination, GPS trigger, modal flows
│   └── globals.css             # Tailwind base layers & Leaflet popup resets
├── components/
│   ├── Map.tsx                 # Dynamic client wrapper
│   ├── MapInner.tsx            # Leaflet map container, custom marker icons & popups
│   ├── AddDropModal.tsx        # Multi-photo capture & dock logging modal
│   ├── EditDropModal.tsx       # Venue details & photo gallery updater
│   └── AnalyticsTracker.tsx    # Suspense-isolated Vercel Analytics client boundary
└── lib/
    └── supabase.ts             # Supabase client instantiation & TypeScript definitions
