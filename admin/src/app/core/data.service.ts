import { Injectable, signal } from '@angular/core';
import type { Item, Shop, Recipe } from '@wc3db/shared';

@Injectable({ providedIn: 'root' })
export class DataService {
  readonly items = signal<Item[]>([]);
  readonly shops = signal<Shop[]>([]);
  readonly recipes = signal<Recipe[]>([]);

  async loadAll(): Promise<void> {
    const [itemsResponse, shopsResponse, recipesResponse] = await Promise.all([
      fetch('/data/items.json'),
      fetch('/data/shops.json'),
      fetch('/data/recipes.json'),
    ]);

    this.items.set(await itemsResponse.json());
    this.shops.set(await shopsResponse.json());
    this.recipes.set(await recipesResponse.json());
  }

  exportItems(): void {
    this.downloadJson('items.json', this.items());
  }

  exportShops(): void {
    this.downloadJson('shops.json', this.shops());
  }

  exportRecipes(): void {
    this.downloadJson('recipes.json', this.recipes());
  }

  private downloadJson(filename: string, data: unknown): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
