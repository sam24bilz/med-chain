import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DoctorWalletConnectionProps {
  doctorProfileId: string;
  currentWallet?: string | null;
}


export const DoctorWalletConnection = ({ doctorProfileId, currentWallet }: DoctorWalletConnectionProps) => {
  const [walletAddress, setWalletAddress] = useState(currentWallet || "");
  const [isConnecting, setIsConnecting] = useState(false);

  const connectHashPack = async () => {
    setIsConnecting(true);
    try {
      if (!window.hashpack) {
        toast({
          title: "HashPack Not Found",
          description: "Please install HashPack wallet extension from hashpack.app",
          variant: "destructive",
        });
        return;
      }

      const appMetadata = {
        name: "MediChain Doctor",
        description: "Healthcare consultation platform for doctors",
        icon: window.location.origin + "/favicon.ico"
      };

      await window.hashpack.connectToExtension();
      const pairingData = await window.hashpack.pairingRequest(appMetadata);
      
      if (pairingData && pairingData.accountIds && pairingData.accountIds.length > 0) {
        const accountId = pairingData.accountIds[0];
        await saveWallet(accountId);
      } else {
        toast({
          title: "Connection Failed",
          description: "No accounts found in HashPack wallet",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to HashPack wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const saveWallet = async (address: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ wallet_address: address })
        .eq("id", doctorProfileId);

      if (error) throw error;

      setWalletAddress(address);
      toast({
        title: "Wallet Connected",
        description: `Connected to ${address}`,
      });
    } catch (error) {
      console.error("Error saving wallet:", error);
      toast({
        title: "Error",
        description: "Failed to save wallet address",
        variant: "destructive",
      });
    }
  };

  const handleManualSave = async () => {
    if (!walletAddress.trim()) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid HBAR wallet address",
        variant: "destructive",
      });
      return;
    }
    await saveWallet(walletAddress);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>HBAR Wallet Connection</CardTitle>
        <CardDescription>Connect your wallet to receive payments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="wallet">Wallet Address</Label>
          <Input
            id="wallet"
            placeholder="0.0.12345"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleManualSave} variant="outline" className="flex-1">
            Save Manually
          </Button>
          <Button onClick={connectHashPack} disabled={isConnecting} className="flex-1">
            <Wallet className="w-4 h-4 mr-2" />
            {isConnecting ? "Connecting..." : "Connect HashPack"}
          </Button>
        </div>
        {currentWallet && (
          <div className="text-sm text-muted-foreground">
            Current wallet: {currentWallet}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
