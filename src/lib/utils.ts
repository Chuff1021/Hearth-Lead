import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

export function formatDate(date: Date | string | null): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
}

export function formatDateShort(date: Date | string | null): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(date));
}

export function formatRelative(date: Date | string | null): string {
  if (!date) return '—';
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDateShort(date);
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function daysUntil(date: Date | string | null): number | null {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

export function daysAgo(date: Date | string | null): number | null {
  if (!date) return null;
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
}

// ── Badge helpers ──────────────────────

export function stageBadge(stage: string) {
  const map: Record<string, string> = { new: 'badge-blue', contacted: 'badge-yellow', quoted: 'badge-orange', sold: 'badge-green', lost: 'badge-gray' };
  return map[stage] || 'badge-gray';
}

export function urgencyBadge(u: string) {
  const map: Record<string, string> = { hot: 'badge-red', warm: 'badge-orange', normal: 'badge-blue', cold: 'badge-gray' };
  return map[u] || 'badge-gray';
}

export function urgencyBorder(u: string) {
  const map: Record<string, string> = { hot: 'urgency-hot', warm: 'urgency-warm', normal: 'urgency-normal', cold: 'urgency-cold' };
  return map[u] || '';
}

export function relationshipBadge(r: string) {
  const map: Record<string, string> = { unknown: 'badge-gray', contacted: 'badge-blue', pitched: 'badge-yellow', partner: 'badge-green', declined: 'badge-red' };
  return map[r] || 'badge-gray';
}

export function permitStatusBadge(s: string) {
  const map: Record<string, string> = { applied: 'badge-blue', approved: 'badge-green', in_review: 'badge-yellow', under_inspection: 'badge-orange', final: 'badge-green', co_issued: 'badge-purple' };
  return map[s] || 'badge-gray';
}

export function seoTaskPriorityBadge(p: string) {
  const map: Record<string, string> = { critical: 'badge-red', high: 'badge-orange', medium: 'badge-yellow', low: 'badge-gray' };
  return map[p] || 'badge-gray';
}

export function reviewStatusBadge(s: string) {
  const map: Record<string, string> = { needs_response: 'badge-red', responded: 'badge-green', flagged: 'badge-yellow', no_response_needed: 'badge-gray' };
  return map[s] || 'badge-gray';
}
