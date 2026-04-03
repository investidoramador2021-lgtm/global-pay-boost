import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>Page Not Found — MRC GlobalPay</title>
        <meta name="description" content="The page you are looking for does not exist. Return to MRC GlobalPay to swap 500+ cryptocurrencies instantly from $0.30." />
        <meta name="robots" content="noindex, nofollow" />
        <meta property="og:title" content="Page Not Found — MRC GlobalPay" />
        <meta property="og:description" content="The page you are looking for does not exist. Return to MRC GlobalPay to swap 500+ cryptocurrencies instantly from $0.30." />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="MRC GlobalPay" />
        <meta property="og:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Page Not Found — MRC GlobalPay" />
        <meta name="twitter:description" content="The page you are looking for does not exist. Return to MRC GlobalPay to swap 500+ cryptocurrencies instantly." />
        <meta name="twitter:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png" />
      </Helmet>
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <div className="text-center max-w-lg px-4">
          <h1 className="mb-4 text-6xl font-bold text-foreground">404</h1>
          <h2 className="mb-4 text-2xl font-semibold text-foreground">Page Not Found</h2>
          <p className="mb-6 text-lg text-muted-foreground">
            The page you're looking for doesn't exist or has been moved. 
            MRC GlobalPay lets you instantly swap 500+ cryptocurrencies starting from just $0.30 — no account required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/" className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
              Go to Homepage
            </a>
            <a href="/blog" className="inline-flex items-center justify-center rounded-md border border-border px-6 py-3 text-foreground font-medium hover:bg-accent transition-colors">
              Read Our Blog
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
