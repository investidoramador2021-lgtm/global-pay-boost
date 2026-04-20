import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const PartnerProtocolCTA = () => (
  <section className="py-20 px-4">
    <div className="max-w-2xl mx-auto text-center space-y-6">
      <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
        Become a Partner
      </h2>
      <p className="text-lg text-muted-foreground max-w-lg mx-auto">
        Secure BTC rewards by referring settlements to the MRC Global Pay network.
      </p>
      <Button asChild size="lg" className="px-10 py-6 text-base font-semibold rounded-xl gap-2">
        <Link to="/partners">
          Join Program
          <ArrowRight className="w-4 h-4" />
        </Link>
      </Button>
    </div>
  </section>
);

export default PartnerProtocolCTA;
