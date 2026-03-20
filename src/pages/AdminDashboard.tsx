import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Overview from "@/components/admin/Overview";
import UsersManager from "@/components/admin/UsersManager";
import HostelsManager from "@/components/admin/HostelsManager";
import BookingsManager from "@/components/admin/BookingsManager";
import PaymentsManager from "@/components/admin/PaymentsManager";
import ReviewsManager from "@/components/admin/ReviewsManager";
import ReportsManager from "@/components/admin/ReportsManager";
import Settings from "@/components/admin/Settings";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <Overview />;
      case "users":
        return <UsersManager />;
      case "hostels":
        return <HostelsManager />;
      case "bookings":
        return <BookingsManager />;
      case "payments":
        return <PaymentsManager />;
      case "reviews":
        return <ReviewsManager />;
      case "reports":
        return <ReportsManager />;
      case "settings":
        return <Settings />;
      default:
        return <Overview />;
    }
  };

  return (
    <AdminLayout sidebar={<AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />}>
      {renderContent()}
    </AdminLayout>
  );
}
