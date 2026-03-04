import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background py-8">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} UniNest. All rights reserved.</p>
        <div className="mt-4 flex justify-center space-x-4">
          <Link to="#" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link to="#" className="hover:text-foreground transition-colors">Terms</Link>
          <Link to="#" className="hover:text-foreground transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
