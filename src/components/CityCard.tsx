import Link from 'next/link';
import { MapPin, ArrowRight, Home } from 'lucide-react';

interface CityCardProps {
  slug: string;
  name: string;
  county: string;
  description: string;
  avgCost: string;
  popularStyles: string[];
}

export default function CityCard({ slug, name, county, description, avgCost, popularStyles }: CityCardProps) {
  return (
    <Link href={`/${slug}`} className="card p-6 group block">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-hearth-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-hearth-200 transition-colors">
          <MapPin className="w-6 h-6 text-hearth-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-hearth-600 transition-colors">
            Fireplaces in {name}, MO
          </h3>
          <span className="text-xs text-gray-400">{county} County</span>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{description}</p>

          <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
            <Home className="w-3 h-3" />
            <span>New construction: <strong className="text-gray-700">{avgCost}</strong></span>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {popularStyles.slice(0, 3).map(style => (
              <span key={style} className="badge-gray text-[10px]">{style}</span>
            ))}
          </div>

          <div className="flex items-center gap-1 mt-4 text-sm font-medium text-hearth-600 group-hover:gap-2 transition-all">
            Learn More <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
