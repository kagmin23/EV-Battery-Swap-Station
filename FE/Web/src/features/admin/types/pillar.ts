export type PillarStatus = 'active' | 'inactive' | 'maintenance' | 'error' | string;

export type PillarSlotStatus =
    | 'empty'
    | 'occupied'
    | 'reserved'
    | 'locked'
    | 'maintenance'
    | 'error'
    | string;

export interface PillarSlot {
    id: string;
    slotNumber: number;
    slotCode: string;
    status: PillarSlotStatus;
    battery?: {
        id: string;
        serial: string;
        model?: string;
        soh?: number;
        status?: string;
        price?: number;
    } | null;
}

export interface Pillar {
    id: string;
    pillarName: string;
    pillarCode: string;
    pillarNumber: number;
    status: PillarStatus;
    totalSlots: number;
    slotStats?: {
        total: number;
        occupied: number;
        empty: number;
        reserved: number;
    };
    station?: {
        id: string;
        name: string;
        address?: string;
    };
    slots?: PillarSlot[];
    createdAt: Date;
    updatedAt: Date;
}

export interface CreatePillarFormData {
    pillarName: string;
    pillarNumber: number;
    totalSlots?: number;
}

