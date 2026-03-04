export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface ItemStats {
    damage?: number;
    armor?: number;
    strength?: number;
    agility?: number;
    intelligence?: number;
    hitPoints?: number;
    mana?: number;
    moveSpeed?: number;
    attackSpeed?: number;
}

export interface Item {
    id: string;
    name: string;
    iconPath: string;
    markdownDescription: string;
    rarity: ItemRarity;
    goldCost: number;
    stats: ItemStats;
    soldAt: string[];
    buildsInto: string[];
}
