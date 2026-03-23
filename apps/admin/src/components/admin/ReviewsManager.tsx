import { Card, CardContent } from "@/components/ui/card";
import { Star, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReviewsManager() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Reviews & Ratings</h2>
        <p className="text-muted-foreground mt-2">Moderate platform feedback, remove spam, and maintain authentic ratings.</p>
      </div>

      <Card className="border-indigo-100/50 shadow-md bg-white">
        <CardContent className="p-0">
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border shadow-sm">
              <Star className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="text-xl font-medium text-slate-900">Spam Moderation Coming Soon</h3>
            <p className="text-slate-500 max-w-md mt-2">
              The advanced review moderation interface is being built. Once active, you will be able to quarantine, delete, or verify suspicious reviews here.
            </p>
            <div className="mt-6">
              <Button variant="outline" className="gap-2">
                <ShieldAlert className="h-4 w-4 text-indigo-500" />
                Configure Filtering Rules
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
