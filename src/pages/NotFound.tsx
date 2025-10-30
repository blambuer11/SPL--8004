import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="p-4 rounded-full bg-gradient-primary inline-block animate-pulse-glow">
          <AlertTriangle className="h-16 w-16 text-primary-foreground" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-6xl font-bold glow-text">404</h1>
          <h2 className="text-2xl font-bold">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <Link to="/">
          <Button className="bg-gradient-primary hover:shadow-glow">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
