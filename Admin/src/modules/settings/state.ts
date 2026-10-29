export interface PlatformSettings {
  siteName: string;
  brandMaroonColor: string;
  currency: string;
  supportEmail: string;
  supportPhone: string;
  maxBetLimit: number;
  maxMarketExposure: number;
  maintenanceMode: boolean;
  maintenanceReason?: string | null;
}

export const SETTINGS_STATE: PlatformSettings = {
  siteName: 'Cricketbuyy',
  brandMaroonColor: '#941b2c',
  currency: 'INR',
  supportEmail: 'support@cricketbuyy.com',
  supportPhone: '+91 98000 11223',
  maxBetLimit: 500000,
  maxMarketExposure: 2500000,
  maintenanceMode: false,
  maintenanceReason: null
};
