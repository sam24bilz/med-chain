export const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold gradient-hero bg-clip-text text-transparent">
              MedChain
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Web3 Healthcare for Everyone
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Powered by:</span>
            </span>
            <span>Hedera</span>
            <span>•</span>
            <span>HashPack</span>
            <span>•</span>
            <span>Mirror Node</span>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border/50 text-center text-sm text-muted-foreground">
          © 2025 MedChain. Building the future of healthcare.
        </div>
      </div>
    </footer>
  );
};
