import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const faqItems = [
  {
    question: "How do I find a hostel?",
    answer:
      "Use the Search page to filter by university, room type, rating, and availability.",
  },
  {
    question: "How do booking requests work?",
    answer:
      "Students add rooms to the booking cart, then checkout to submit requests for approval.",
  },
  {
    question: "Can I contact a hostel owner before booking?",
    answer:
      "Yes. Open a hostel detail page or your dashboard messages to ask questions directly.",
  },
  {
    question: "Who can approve hostels?",
    answer:
      "Super admins review pending hostels and decide whether listings go live.",
  },
];

export default function Faq() {
  return (
    <div className="container mx-auto px-4 py-14 max-w-4xl space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Help Center
        </p>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
          Frequently Asked Questions
        </h1>
        <p className="text-slate-600 max-w-2xl">
          Quick answers for students, owners, and admins using the hostel marketplace.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link to="/search">
            <Button>Browse Hostels</Button>
          </Link>
          <Link to="/auth?mode=signup">
            <Button variant="outline">Create an Account</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4">
        {faqItems.map((item) => (
          <Card key={item.question} className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">{item.question}</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 leading-relaxed">
              {item.answer}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}