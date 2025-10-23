export {};

declare global {
  interface Window {
    hashpack?: {
      connectToExtension: () => Promise<void>;
      pairingRequest: (metadata: any) => Promise<{ accountIds: string[] }>;
      connectToLocalWallet: () => Promise<{ accountIds: string[] }>;
    };
  }
}
