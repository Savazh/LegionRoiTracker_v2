import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PriceAlert {
  id: string;
  tokenId: string;
  price: number;
  type: 'above' | 'below';
  createdAt: string;
  triggered: boolean;
}

interface AlertStore {
  alerts: PriceAlert[];
  addAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'>) => void;
  removeAlert: (id: string) => void;
  checkAlerts: (tokenId: string, currentPrice: number) => PriceAlert[];
  clearTriggeredAlerts: () => void;
}

export const useAlertStore = create<AlertStore>()(
  persist(
    (set, get) => ({
      alerts: [],
      addAlert: (alert) => {
        const newAlert: PriceAlert = {
          ...alert,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          triggered: false,
        };
        set((state) => ({
          alerts: [...state.alerts, newAlert],
        }));
      },
      removeAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.filter((alert) => alert.id !== id),
        }));
      },
      checkAlerts: (tokenId, currentPrice) => {
        const triggeredAlerts: PriceAlert[] = [];
        set((state) => {
          const updatedAlerts = state.alerts.map((alert) => {
            if (
              alert.tokenId === tokenId &&
              !alert.triggered &&
              ((alert.type === 'above' && currentPrice >= alert.price) ||
                (alert.type === 'below' && currentPrice <= alert.price))
            ) {
              triggeredAlerts.push({ ...alert, triggered: true });
              return { ...alert, triggered: true };
            }
            return alert;
          });
          return { alerts: updatedAlerts };
        });
        return triggeredAlerts;
      },
      clearTriggeredAlerts: () => {
        set((state) => ({
          alerts: state.alerts.filter((alert) => !alert.triggered),
        }));
      },
    }),
    {
      name: 'price-alerts',
    }
  )
);