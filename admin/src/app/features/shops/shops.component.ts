import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DataService } from '../../core/data.service';
import type { Item } from '@wc3db/shared';

@Component({
  selector: 'app-shops',
  standalone: true,
  imports: [
    DragDropModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './shops.component.html',
  styleUrl: './shops.component.scss'
})
export class ShopsComponent implements OnInit {
  protected readonly dataService = inject(DataService);
  protected readonly selectedShopId = signal<string | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly SLOT_COUNT = 12;

  protected readonly selectedShop = computed(() =>
    this.dataService.shops().find(shop => shop.id === this.selectedShopId()) ?? null
  );

  protected readonly shopSlots = computed(() => {
    const shop = this.selectedShop();
    if (!shop) return [];
    return Array.from({ length: this.SLOT_COUNT }, (_, slotIndex) => {
      const slot = shop.slots.find(s => s.slotIndex === slotIndex);
      return slot
        ? this.dataService.items().find(item => item.id === slot.itemId) ?? null
        : null;
    });
  });

  protected readonly occupiedItemIds = computed(() => {
    const shop = this.selectedShop();
    if (!shop) return new Set<string>();
    return new Set(shop.slots.map(s => s.itemId));
  });

  protected readonly availableItems = computed(() =>
    this.dataService.items().filter(item => !this.occupiedItemIds().has(item.id))
  );

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

  protected shopSlotIds(): string[] {
    return Array.from({ length: this.SLOT_COUNT }, (_, i) => `slot-${i}`);
  }

  protected slotDropListId(slotIndex: number): string {
    return `slot-${slotIndex}`;
  }

  protected dropOnSlot(event: CdkDragDrop<(Item | null)[]>, slotIndex: number): void {
    const shopId = this.selectedShopId();
    if (!shopId) return;

    const droppedItem = event.previousContainer.data[event.previousIndex] as Item;

    this.dataService.shops.update(shops =>
      shops.map(shop => {
        if (shop.id !== shopId) return shop;
        const updatedSlots = shop.slots.filter(s =>
          s.itemId !== droppedItem.id && s.slotIndex !== slotIndex
        );
        updatedSlots.push({ slotIndex, itemId: droppedItem.id });
        return { ...shop, slots: updatedSlots };
      })
    );
  }

  protected dropOnAvailable(event: CdkDragDrop<Item[]>): void {
    if (event.previousContainer === event.container) return;
    const shopId = this.selectedShopId();
    if (!shopId) return;

    const removedItem = event.previousContainer.data[event.previousIndex] as Item;
    this.dataService.shops.update(shops =>
      shops.map(shop => {
        if (shop.id !== shopId) return shop;
        return { ...shop, slots: shop.slots.filter(s => s.itemId !== removedItem.id) };
      })
    );
  }

  protected removeFromSlot(slotIndex: number): void {
    const shopId = this.selectedShopId();
    if (!shopId) return;

    this.dataService.shops.update(shops =>
      shops.map(shop => {
        if (shop.id !== shopId) return shop;
        return { ...shop, slots: shop.slots.filter(s => s.slotIndex !== slotIndex) };
      })
    );
  }

  protected updateShopName(name: string): void {
    const shopId = this.selectedShopId();
    if (!shopId) return;
    this.dataService.shops.update(shops =>
      shops.map(shop => shop.id === shopId ? { ...shop, name } : shop)
    );
  }
}
