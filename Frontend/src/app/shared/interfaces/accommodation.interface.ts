export interface Accommodation {
    _id: string;
    hostUserId : string;
    city: string;
    country: string;
    address: string;
    description: string;
    createdAt: Date;
    availableFrom: Date;
    availableTo: Date;
    images: string[];
    isDeleted: boolean;
}