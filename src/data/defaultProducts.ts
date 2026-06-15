import { RankProduct, CoinProduct, BundleProduct } from '../types';

export const DEFAULT_RANKS: RankProduct[] = [
  {
    name: "VIP Rank",
    price: 9.99,
    imageUrl: "https://images.unsplash.com/photo-1598153346810-860daa814c4b?w=400&auto=format&fit=crop&q=60",
    inventoryScreenshot: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=600&auto=format&fit=crop&q=80",
    description: "• Custom green [VIP] chat tag prefix\n• Access to /feed command (cooldown: 5 mins)\n• Set up to 3 homes in-game\n• Custom green neon tab color\n• VIP kit package keys delivered weekly"
  },
  {
    name: "ELITE Rank",
    price: 24.99,
    imageUrl: "https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=400&auto=format&fit=crop&q=60",
    inventoryScreenshot: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80",
    description: "• Bold blue [ELITE] chat tag prefix\n• Access to /feed and /heal commands (cooldown: 2 mins)\n• Set up to 7 homes in-game\n• Access to Elite-only server kits\n• Access to /virtualchest portable backpack"
  },
  {
    name: "KING Rank",
    price: 49.99,
    imageUrl: "https://images.unsplash.com/photo-1519074069444-1ba4e6663104?w=400&auto=format&fit=crop&q=60",
    inventoryScreenshot: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80",
    description: "• Shiny golden [KING] chat tag prefix\n• Flying permissions inside lobby and main hub\n• Priority server queue entry (bypass capacity)\n• Set up to 15 homes in-game\n• Daily King Crate delivery keys\n• Special crown gold title"
  },
  {
    name: "TITAN Rank",
    price: 89.99,
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=60",
    inventoryScreenshot: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
    description: "• Legendary crimson [TITAN] glowing tag prefix\n• Permanent fly privileges active in survival/factions\n• Maximum 30 home set slots\n• Custom Particle Aura trail effects menu\n• Exclusive Monthly Titan Drop Box (OP Loot)\n• KeepXP on death"
  }
];

export const DEFAULT_COINS: CoinProduct[] = [
  {
    name: "Iron Coin Stack",
    coinAmount: 1000,
    price: 4.99,
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60",
    description: "Standard beginner coin wallet starter pack. Great for buying basic survival utility blocks."
  },
  {
    name: "Gold Coin Pouch",
    coinAmount: 5000,
    price: 19.99,
    imageUrl: "https://images.unsplash.com/photo-1561414927-6d86591d0c4f?w=400&auto=format&fit=crop&q=60",
    description: "Popular currency tier. Includes 500 bonus coins free (20% extra added value!)."
  },
  {
    name: "Diamond Coin Chest",
    coinAmount: 12000,
    price: 39.99,
    imageUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&auto=format&fit=crop&q=60",
    description: "For serious server moguls. Packed with 2,000 surplus coins (35% extra value bonus!)."
  },
  {
    name: "Netherite Coin Vault",
    coinAmount: 25000,
    price: 74.99,
    imageUrl: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=400&auto=format&fit=crop&q=60",
    description: "Ultimate wealth hoard. Best trading value. Includes a staggering 50% surplus bonus!"
  }
];

export const DEFAULT_BUNDLES: BundleProduct[] = [
  {
    name: "Adventurer Starter Combo",
    price: 24.99,
    rankName: "VIP Rank",
    coinAmount: 5000,
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop&q=60",
    description: "Save big on your first step! Grants VIP Rank lifetime status paired with a Gold Coin Pouch containing 5,000 premium coins. Perfect starter pack to claim top-tier gear in-game."
  },
  {
    name: "Supreme Monarch Bundle",
    price: 49.99,
    rankName: "ELITE Rank",
    coinAmount: 12000,
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=60",
    description: "The veteran's ultimate treasure. Unlocks permanent ELITE status together with 12,000 premium diamond coins. Control custom trades, unlock special kits, and bypass server queues."
  },
  {
    name: "Imperial Overlord Vault",
    price: 99.99,
    rankName: "KING Rank",
    coinAmount: 25000,
    imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500&auto=format&fit=crop&q=60",
    description: "Rule the realm. Absolute royalty combo. Grants the permanent glorious KING rank (lobby flying privileges, golden chat prefix) loaded with a Netherite coin hoard of 25,000 virtual coins."
  },
  {
    name: "Titan Emperor God Pack",
    price: 129.99,
    rankName: "TITAN Rank",
    coinAmount: 50000,
    imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=60",
    description: "For true legends only. Unlocks high-status glowing Crimson TITAN prefix rank combined with an insane 50,000 coin treasury balance. Maximize home slots, fly permanently in survival, and dominate server trading."
  }
];

