import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { MainLayout } from "@/components/MainLayout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <MainLayout showSidebar={false}>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-6xl font-bold text-black mb-4">404</h1>
          <p className="text-2xl text-neutral-900 font-semibold mb-3">
            Page Not Found
          </p>
          <p className="text-neutral-600 mb-8">
            The page you're looking for doesn't exist. Continue exploring the
            YOE platform.
          </p>
          <Link
            to="/"
            className="inline-block bg-brown text-white px-6 py-3 rounded font-medium hover:bg-brown-light transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;
