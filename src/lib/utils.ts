import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getLeadScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-500';
  return 'text-gray-400';
}

export function getLeadScoreBadge(score: number): string {
  if (score >= 80) return 'badge-green';
  if (score >= 60) return 'badge-yellow';
  if (score >= 40) return 'badge-blue';
  return 'badge-gray';
}

export function getStatusBadge(status: string): string {
  switch (status) {
    case 'new': return 'badge-blue';
    case 'contacted': return 'badge-yellow';
    case 'quoted': return 'badge-yellow';
    case 'won': return 'badge-green';
    case 'lost': return 'badge-red';
    default: return 'badge-gray';
  }
}

export function getPermitStatusBadge(status: string): string {
  switch (status) {
    case 'applied': return 'badge-blue';
    case 'approved': return 'badge-green';
    case 'in_review': return 'badge-yellow';
    case 'under_inspection': return 'badge-yellow';
    case 'final': return 'badge-green';
    case 'co_issued': return 'badge-green';
    default: return 'badge-gray';
  }
}
