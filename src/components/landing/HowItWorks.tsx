import { Wallet, Stethoscope, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: Wallet,
    title: "Mint Your Pass",
    description: "Connect your HashPack wallet and mint a unique NFT consultation pass",
    color: "text-primary",
  },
  {
    icon: Stethoscope,
    title: "Consult Doctor",
    description: "Book and attend your virtual or in-person medical consultation",
    color: "text-accent",
  },
  {
    icon: ShieldCheck,
    title: "Verify On-Chain",
    description: "All payments and records are transparently verified via Hedera",
    color: "text-secondary",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-primary-light/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to access decentralized healthcare
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary to-accent opacity-30" />
                )}
                
                <div className="glass-card p-8 rounded-2xl text-center hover-lift relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-light mb-6">
                    <Icon className={`w-8 h-8 ${step.color}`} />
                  </div>
                  
                  <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-glow">
                    {index + 1}
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
