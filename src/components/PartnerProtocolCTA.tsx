import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

const PartnerProtocolCTA = () => (
  <section className="py-20 px-4">
    <div className="max-w-2xl mx-auto text-center space-y-6">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium">
        <Shield className="w-4 h-4" />
        Institutional Program
      </div>
      <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
        Partner Protocol
      </h2>
      <p className="text-lg text-muted-foreground max-w-lg mx-auto">
        Secure BTC rewards for every settlement processed through your network.
      </p>
      <Button asChild size="lg" className="px-10 py-6 text-base font-semibold rounded-xl">
        <Link to="/partners">Join Program</Link>
      </Button>
    </div>
  </section>
);

export default PartnerProtocolCTA;
