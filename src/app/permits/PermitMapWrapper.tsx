'use client';

import dynamic from 'next/dynamic';

// Leaflet must be loaded client-side only (uses window/document)
const PermitMap = dynamic(() => import('@/components/PermitMap'), {
  ssr: false,
  loading: () => (
    <div className="card h-[500px] flex items-center justify-center text-gray-400">
      <div className="animate-spin w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full" />
    </div>
  ),
});

interface MapPermit {
  id: string;
  lat: number;
  lng: number;
  address: string;
  city: string;
  permitNumber: string;
  leadScore: number;
  urgency: string;
  ownerName?: string | null;
  contractorName?: string | null;
  estimatedValue?: number | null;
  status: string;
}

export default function PermitMapWrapper({ permits }: { permits: MapPermit[] }) {
  return <PermitMap permits={permits} />;
}
