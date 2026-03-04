export interface Recipe {
    id: string;
    resultItemId: string;
    componentItemIds: string[];
    goldCostToCombine: number;
}