export type UserRole = "student" | "hostel_owner" | "admin";

export interface DBUser {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
}

export interface Hostel {
    id: string;
    name: string;
    description: string | null;
    university: string | null;
    address: string | null;
    price_range: string | null;
    amenities: string[] | null;
    images: string[] | null;
    owner_id: string;
    status: "pending" | "approved" | "rejected";
    created_at: string;
}

export interface RoomType {
    id: string;
    hostel_id: string;
    name: string;
    price: number;
    capacity: number;
    available: number;
}

export interface Booking {
    id: string;
    student_id: string;
    hostel_id: string;
    room_type_id: string;
    status: "pending" | "approved" | "rejected";
    created_at: string;
}
