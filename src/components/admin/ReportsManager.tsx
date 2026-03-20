import { Card, CardContent } from "@/components/ui/card";
import { Flag, Trash2, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReportsManager() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Moderation Reports</h2>
        <p className="text-muted-foreground mt-2">Review flagged hostels, user complaints, and potential scams.</p>
      </div>

      <Card className="border-indigo-100/50 shadow-md bg-rose-50/10">
        <CardContent className="p-0">
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-rose-100 flex items-center justify-center mb-4">
              <Flag className="h-8 w-8 text-rose-500" />
            </div>
            <h3 className="text-xl font-medium text-slate-900">No Active Reports</h3>
            <p className="text-slate-500 max-w-sm mt-2">
              When students report a listing as a scam or inappropriate, those flags will appear here for your immediate review.
            </p>
            <div className="mt-8 flex gap-3">
              <Button variant="destructive" className="bg-rose-600 hover:bg-rose-700 shadow-sm opacity-50 cursor-not-allowed">
                <Ban className="h-4 w-4 mr-2" /> Ban User
              </Button>
              <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 opacity-50 cursor-not-allowed">
                <Trash2 className="h-4 w-4 mr-2" /> Delete Listing
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
