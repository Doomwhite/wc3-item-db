export interface ShopMapPosition {
    x: number;
    y: number;
}

export interface Shop {
    id: string;
    name: string;
    iconPath: string;
    mapPosition: ShopMapPosition;
    itemIds: string[];
}