import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Activity, Shield, FileCheck } from "lucide-react";
import heroImage from "@/assets/hero-medical.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-subtle -z-10" />
      
      {/* Hero image overlay */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/80" />
        <img 
          src={heroImage} 
          alt="Web3 Healthcare Innovation" 
          className="w-full h-full object-cover opacity-20"
        />
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full text-sm font-medium text-primary">
            <Activity className="w-4 h-4" />
            <span>MedChain - Web3 Healthcare</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Consult Your Doctor.
            <br />
            <span className="gradient-hero bg-clip-text text-transparent">
              Own Your Consultation.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            A decentralized healthcare platform where medical appointments are powered by NFTs on Hedera
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button asChild variant="hero" size="xl" className="w-full sm:w-auto">
              <Link to="/auth/signup">Book Consultation</Link>
            </Button>
            <Button asChild variant="glass" size="xl" className="w-full sm:w-auto">
              <Link to="/auth/login">Connect Wallet</Link>
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            <div className="glass-card p-6 rounded-2xl hover-lift">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Secure & Transparent</h3>
              <p className="text-sm text-muted-foreground">
                All consultations verified on-chain with immutable records
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-2xl hover-lift">
              <Activity className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">NFT Ownership</h3>
              <p className="text-sm text-muted-foreground">
                Your consultation pass is a unique NFT you truly own
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-2xl hover-lift">
              <FileCheck className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Verified History</h3>
              <p className="text-sm text-muted-foreground">
                Track all medical consultations via Hedera Mirror Node
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
