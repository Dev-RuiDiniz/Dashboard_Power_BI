import Link from 'next/link';

type NavLinkProps = {
  href: string;
  label: string;
  description: string;
};

export function NavLink({ href, label, description }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-left transition hover:border-blue-500 hover:bg-slate-800"
    >
      <span className="block text-sm font-semibold text-white">{label}</span>
      <span className="mt-1 block text-xs leading-5 text-slate-400">{description}</span>
    </Link>
  );
}
