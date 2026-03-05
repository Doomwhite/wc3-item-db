import {Component, inject, OnInit, signal, computed} from '@angular/core';
import {CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatDividerModule} from '@angular/material/divider';
import {DataService} from '../../core/data.service';
import type {Item, Shop} from '@wc3db/shared';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

@Component({
  selector: 'app-shops',
  standalone: true,
  imports: [
    DragDropModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatInputModule ,
    MatFormFieldModule
  ],
  templateUrl: './shops.component.html',
  styleUrl: './shops.component.scss'
})
export class ShopsComponent implements OnInit {
  protected readonly dataService = inject(DataService);
  protected readonly selectedShopId = signal<string | null>(null);

  protected readonly selectedShop = computed(() =>
    this.dataService.shops().find(shop => shop.id === this.selectedShopId()) ?? null
  );

  protected readonly shopItems = computed(() => {
    const shop = this.selectedShop();
    if (!shop) return [];
    return shop.itemIds
      .map(itemId => this.dataService.items().find(item => item.id === itemId))
      .filter((item): item is Item => item !== undefined);
  });

  protected readonly availableItems = computed(() => {
    const shop = this.selectedShop();
    if (!shop) return this.dataService.items();
    return this.dataService.items().filter(item => !shop.itemIds.includes(item.id));
  });
  protected readonly searchQuery = signal('');

  protected readonly filteredAvailableItems = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.availableItems();
    return this.availableItems().filter(item =>
      item.name.toLowerCase().includes(query)
    );
  });

  ngOnInit(): void {
    this.dataService.loadAll();
  }

  protected selectShop(shopId: string): void {
    this.selectedShopId.set(shopId);
  }

  protected dropOnShop(event: CdkDragDrop<Item[]>): void {
    const shopId = this.selectedShopId();
    if (!shopId) return;

    if (event.previousContainer === event.container) {
      this.dataService.shops.update(shops =>
        shops.map(shop => {
          if (shop.id !== shopId) return shop;
          const reorderedItemIds = [...shop.itemIds];
          moveItemInArray(reorderedItemIds, event.previousIndex, event.currentIndex);
          return {...shop, itemIds: reorderedItemIds};
        })
      );
    } else {
      const droppedItem = event.previousContainer.data[event.previousIndex];
      this.dataService.shops.update(shops =>
        shops.map(shop => {
          if (shop.id !== shopId) return shop;
          const updatedItemIds = [...shop.itemIds];
          updatedItemIds.splice(event.currentIndex, 0, droppedItem.id);
          return {...shop, itemIds: updatedItemIds};
        })
      );
    }
  }

  protected dropOnAvailable(event: CdkDragDrop<Item[]>): void {
    if (event.previousContainer === event.container) return;
    const shopId = this.selectedShopId();
    if (!shopId) return;

    const removedItem = event.previousContainer.data[event.previousIndex];
    this.dataService.shops.update(shops =>
      shops.map(shop => {
        if (shop.id !== shopId) return shop;
        return {...shop, itemIds: shop.itemIds.filter(id => id !== removedItem.id)};
      })
    );
  }

  protected updateShopName(name: string): void {
    const shopId = this.selectedShopId();
    if (!shopId) return;
    this.dataService.shops.update(shops =>
      shops.map(shop => shop.id === shopId ? {...shop, name} : shop)
    );
  }
}
