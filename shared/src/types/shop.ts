export interface ShopMapPosition {
    x: number;
    y: number;
}

export interface ShopSlot {
    slotIndex: number;
    itemId: string;
}

export interface Shop {
    id: string;
    name: string;
    iconPath: string;
    mapPosition: ShopMapPosition;
    slots: ShopSlot[];
}
