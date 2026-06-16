export interface RouteSeoConfig {
  title: string;
  description: string;
  keywords?: string[];
  type?: 'website' | 'article';
  noIndex?: boolean;
}

export const routeSeo: Record<string, RouteSeoConfig> = {
  '/': {
    title: 'OGzz MC - Minecraft Server Store',
    description: 'Official OGzz MC Store. Purchase ranks, coins and bundles for the best Minecraft experience.',
    keywords: ['OGzz MC', 'Minecraft Server', 'Minecraft Store', 'Minecraft Ranks', 'Minecraft Coins', 'Minecraft Bundles'],
  },
  '/ranks': {
    title: 'Minecraft Ranks - OGzz MC Store',
    description: 'Purchase premium Minecraft ranks on OGzz MC and unlock exclusive perks.',
    keywords: ['OGzz MC', 'Minecraft Server', 'Minecraft Store', 'Minecraft Ranks'],
  },
  '/coins': {
    title: 'Buy Coins - OGzz MC Store',
    description: 'Purchase OGzz MC coins and use them for exclusive in-game rewards.',
    keywords: ['OGzz MC', 'Minecraft Server', 'Minecraft Store', 'Minecraft Coins'],
  },
  '/bundles': {
    title: 'Minecraft Bundles - OGzz MC Store',
    description: 'Get the best value with OGzz MC bundles and exclusive packages.',
    keywords: ['OGzz MC', 'Minecraft Server', 'Minecraft Store', 'Minecraft Bundles', 'Minecraft Ranks', 'Minecraft Coins'],
  },
  '/order-tracker': {
    title: 'Order Tracker - OGzz MC Store',
    description: 'Track your OGzz MC store purchases and order status.',
    keywords: ['OGzz MC', 'Minecraft Server', 'Minecraft Store', 'Order Tracker'],
  },
  '/login': {
    title: 'Player Login | OGzz MC Store',
    description: 'Sign in to your OGzz MC account to manage Minecraft Store purchases, order history, and support steps for our Minecraft Server.',
    keywords: ['OGzz MC', 'Minecraft Store', 'Minecraft Server'],
    noIndex: true,
  },
  '/register': {
    title: 'Player Register | OGzz MC Store',
    description: 'Create your OGzz MC account to purchase Minecraft Ranks, coins, and bundle offers for our Minecraft Survival Server and Minecraft SMP.',
    keywords: ['OGzz MC', 'Minecraft Store', 'Minecraft Ranks', 'Minecraft Coins', 'Minecraft Bundles'],
    noIndex: true,
  },
  '/dashboard': {
    title: 'Player Dashboard | OGzz MC Store',
    description: 'Review your OGzz MC orders, track store activity, and manage Minecraft Store purchases from your personal player dashboard.',
    keywords: ['OGzz MC', 'Minecraft Store', 'Minecraft Server'],
    noIndex: true,
  },
  '/terms': {
    title: 'Terms and Conditions | OGzz MC Store',
    description: 'Read the OGzz MC Store terms and conditions covering billing, delivery, support, and purchase rules for our Minecraft Server.',
    keywords: ['OGzz MC', 'Minecraft Store', 'Minecraft Server'],
    type: 'article',
  },
  '/admin': {
    title: 'Admin Dashboard | OGzz MC Store',
    description: 'Manage OGzz MC Minecraft Store orders, products, settings, and staff tools from the secure admin dashboard.',
    keywords: ['OGzz MC', 'Minecraft Store', 'Minecraft Server'],
    noIndex: true,
  },
  '/admin/orders': {
    title: 'Admin Orders | OGzz MC Store',
    description: 'Review and manage OGzz MC Minecraft Store orders from the admin orders console.',
    keywords: ['OGzz MC', 'Minecraft Store'],
    noIndex: true,
  },
  '/admin/ranks': {
    title: 'Admin Ranks | OGzz MC Store',
    description: 'Manage OGzz MC Minecraft Ranks and store listings from the admin ranks console.',
    keywords: ['OGzz MC', 'Minecraft Store', 'Minecraft Ranks'],
    noIndex: true,
  },
  '/admin/coins': {
    title: 'Admin Coins | OGzz MC Store',
    description: 'Manage OGzz MC coin packs and Minecraft Store currency products from the admin coins console.',
    keywords: ['OGzz MC', 'Minecraft Store', 'Minecraft Coins'],
    noIndex: true,
  },
};

export function normalizePathname(pathname: string) {
  if (!pathname || pathname === '/') {
    return '/';
  }

  return pathname.replace(/\/+$/, '');
}

export function getSeoForPath(pathname: string): RouteSeoConfig {
  const normalizedPath = normalizePathname(pathname);

  return routeSeo[normalizedPath] ?? {
    title: 'Page Not Found | OGzz MC Store',
    description: 'The requested OGzz MC page could not be found. Return to the Minecraft Store homepage to browse ranks, coins, and bundles.',
    keywords: ['OGzz MC', 'Minecraft Server', 'Minecraft Store'],
    noIndex: true,
  };
}
