'use client';
import { Home, Search, Library, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: '/', icon: <Home size={24} />, label: 'Home' },
    { href: '/search', icon: <Search size={24} />, label: 'Search' },
    { href: '/collection', icon: <Library size={24} />, label: 'Library' },
    { href: '/jam', icon: <Users size={24} />, label: 'Jam Rooms' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-[#121212]/95 backdrop-blur-md border-t border-zinc-800 flex justify-around items-center py-2 pb-6 z-50">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link key={link.href} href={link.href} className={`flex flex-col items-center gap-1 ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
            {link.icon}
            <span className="text-[10px] font-semibold">{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
