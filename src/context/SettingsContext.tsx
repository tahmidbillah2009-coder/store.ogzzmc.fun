import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/firebase';
import { readCache, writeCache } from '../utils/browserCache';

export interface SiteSettings {
  serverIP: string;
  discordLink: string;
  backgroundImage?: string;
  logoUrl?: string;
  announcementText?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  systemLocked?: boolean;
  catalogInitialized?: boolean;
  termsAndConditions?: string;
}

interface SettingsContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: SiteSettings) => Promise<void>;
  loading: boolean;
}

const DEFAULT_TERMS = `### **1. General Acceptance**
By purchasing virtual items, ranks, or coins from the OGzz MC Store, you agree to comply fully with our store guidelines, Minecraft EULA terms, and general server rules.

### **2. Virtual Goods & Store Currency**
All ranks, virtual coin packs, and combos delivered are completely virtual and hold no real-world monetary value. They are tied to your active Minecraft username and cannot be transferred, exchanged, or cash-out.

### **3. Support & Delivery Process**
All purchase orders generate a custom Order ID. In order to receive your active permissions or virtual coins:
1. Copy your structural Order ID.
2. Join our Discord Community Guild.
3. Open a Support Ticket and present the verified Order ID to our staff members.
Verification may take up to 24 hours depending on support queue density.

### **4. No-Refund Policy**
All transactions are final. Because virtual delivery is irreversible, chargebacks or dispute filings will result in an immediate and permanent hardware ban across the entire server network. If there is a billing issue, please contact support rather than filing a bank dispute.

### **5. Account Responsibility**
You are solely responsible for entering the correct spelling of your Minecraft Username. We cannot recover or transfer items purchased with spelling typos or sent to incorrect player accounts.`;

const DEFAULT_SETTINGS: SiteSettings = {
  serverIP: 'play.ogzzmc.net',
  discordLink: 'https://discord.gg/MADEZ42vst',
  backgroundImage: '',
  logoUrl: '',
  announcementText: 'Season 3: Nether Realms Open!',
  heroTitle: 'OGZZ MC STORE',
  heroSubtitle: 'Upgrade your Minecraft multiplayer experience! Buy elite VIP privileges, customizable particle effects, and premium virtual gold pouches instantly.',
  systemLocked: false,
  catalogInitialized: false,
  termsAndConditions: DEFAULT_TERMS,
};

const SETTINGS_CACHE_KEY = 'ogzz-site-settings';
const SETTINGS_CACHE_TTL_MS = 1000 * 60 * 60 * 24;

function normalizeSettings(settings: SiteSettings): SiteSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    heroTitle:
      !settings.heroTitle ||
      settings.heroTitle.trim() === 'OGZZ MC SERVER STORE' ||
      settings.heroTitle.trim() === 'OGzz MC STORE'
        ? 'OGZZ MC STORE'
        : settings.heroTitle,
  };
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const cachedSettings = readCache<SiteSettings>(SETTINGS_CACHE_KEY);
    return cachedSettings ? normalizeSettings(cachedSettings) : DEFAULT_SETTINGS;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, 'settings', 'site');

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const normalizedSettings = normalizeSettings(snapshot.data() as SiteSettings);
          setSettings(normalizedSettings);
          writeCache(SETTINGS_CACHE_KEY, normalizedSettings, SETTINGS_CACHE_TTL_MS);
        } else {
          setSettings(DEFAULT_SETTINGS);
          writeCache(SETTINGS_CACHE_KEY, DEFAULT_SETTINGS, SETTINGS_CACHE_TTL_MS);
        }
        setLoading(false);
      },
      (error) => {
        // Guard against unauthorized reads or bootstrap setup missing
        console.warn("Could not fetch site settings, using default configuration.", error);
        const cachedSettings = readCache<SiteSettings>(SETTINGS_CACHE_KEY);
        setSettings(cachedSettings ? normalizeSettings(cachedSettings) : DEFAULT_SETTINGS);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings: SiteSettings) => {
    const path = 'settings/site';
    try {
      const docRef = doc(db, 'settings', 'site');
      const normalizedSettings = normalizeSettings({
        serverIP: newSettings.serverIP.trim(),
        discordLink: newSettings.discordLink.trim(),
        backgroundImage: newSettings.backgroundImage ? newSettings.backgroundImage.trim() : '',
        logoUrl: newSettings.logoUrl ? newSettings.logoUrl.trim() : '',
        announcementText: newSettings.announcementText ? newSettings.announcementText.trim() : 'Season 3: Nether Realms Open!',
        heroTitle: newSettings.heroTitle ? newSettings.heroTitle.trim() : 'OGZZ MC STORE',
        heroSubtitle: newSettings.heroSubtitle ? newSettings.heroSubtitle.trim() : 'Upgrade your Minecraft multiplayer experience! Buy elite VIP privileges, customizable particle effects, and premium virtual gold pouches instantly.',
        systemLocked: !!newSettings.systemLocked,
        // Preserve the catalog state when the settings form does not explicitly change it.
        catalogInitialized: newSettings.catalogInitialized !== undefined
          ? !!newSettings.catalogInitialized
          : !!settings.catalogInitialized,
        termsAndConditions: newSettings.termsAndConditions ? newSettings.termsAndConditions.trim() : DEFAULT_TERMS,
      });

      await setDoc(docRef, normalizedSettings, { merge: true });
      writeCache(SETTINGS_CACHE_KEY, normalizedSettings, SETTINGS_CACHE_TTL_MS);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
