export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type ItemStats = Record<string, number>;

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
