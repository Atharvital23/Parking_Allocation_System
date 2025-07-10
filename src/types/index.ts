export interface ParkingSpot {
    id: number;
    location: string;
    isOccupied: boolean;
}

export interface User {
    id: number;
    name: string;
    email: string;
    parkingSpotId?: number; // Optional, as a user may not have a parking spot assigned
}