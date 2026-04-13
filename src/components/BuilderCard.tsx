import Link from 'next/link';
import { Building2, ArrowRight, MapPin, DollarSign } from 'lucide-react';

interface BuilderCardProps {
  slug: string;
  name: string;
  priceRange: string;
  cities: string[];
  specialties: string[];
  description: string;
}

export default function BuilderCard({ slug, name, priceRange, cities, specialties, description }: BuilderCardProps) {
  return (
    <Link href={`/builders/${slug}`} className="card p-6 group block">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-hearth-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-hearth-200 transition-colors">
          <Building2 className="w-6 h-6 text-hearth-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-hearth-600 transition-colors">
            {name}
          </h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{description}</p>

          <div className="flex flex-wrap gap-2 mt-3">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <DollarSign className="w-3 h-3" /> {priceRange}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3" /> {cities.slice(0, 3).join(', ')}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {specialties.slice(0, 3).map(spec => (
              <span key={spec} className="badge-gray text-[10px]">{spec}</span>
            ))}
          </div>

          <div className="flex items-center gap-1 mt-4 text-sm font-medium text-hearth-600 group-hover:gap-2 transition-all">
            View Fireplace Options <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
