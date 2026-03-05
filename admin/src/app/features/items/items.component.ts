import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { DataService } from '../../core/data.service';
import type { Item, ItemRarity } from '@wc3db/shared';
import { KNOWN_STATS } from '../../core/stat-registry';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatAutocompleteModule
  ],
  templateUrl: './items.component.html',
  styleUrl: './items.component.scss'
})
export class ItemsComponent implements OnInit {
  protected readonly dataService = inject(DataService);
  protected readonly selectedItemId = signal<string | null>(null);

  protected readonly selectedItem = computed(() =>
    this.dataService.items().find(item => item.id === this.selectedItemId()) ?? null
  );

  protected readonly rarityOptions: ItemRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

  protected readonly statEntries = computed(() => {
    const stats = this.selectedItem()?.stats ?? {};
    return Object.entries(stats).map(([key, value]) => ({ key, value }));
  });

  protected readonly knownStats = KNOWN_STATS;

  ngOnInit(): void {
    this.dataService.loadAll();
  }

  protected selectItem(itemId: string): void {
    this.selectedItemId.set(itemId);
  }

  protected updateSelectedItem(updatedFields: Partial<Item>): void {
    this.dataService.items.update(items =>
      items.map(item => item.id === this.selectedItemId() ? { ...item, ...updatedFields } : item)
    );
  }

  protected updateStat(statKey: string, rawValue: string): void {
    const currentStats = { ...(this.selectedItem()?.stats ?? {}) };
    if (rawValue === '') {
      delete currentStats[statKey];
    } else {
      currentStats[statKey] = Number(rawValue);
    }
    this.updateSelectedItem({ stats: currentStats });
  }

  protected addStat(): void {
    const newKey = `stat_${Date.now()}`;
    const currentStats = { ...(this.selectedItem()?.stats ?? {}) };
    currentStats[newKey] = 0;
    this.updateSelectedItem({ stats: currentStats });
  }

  protected removeStat(statKey: string): void {
    const currentStats = { ...(this.selectedItem()?.stats ?? {}) };
    delete currentStats[statKey];
    this.updateSelectedItem({ stats: currentStats });
  }

  protected renameStatKey(oldKey: string, newKey: string): void {
    if (!newKey || newKey === oldKey) return;
    const currentStats = { ...(this.selectedItem()?.stats ?? {}) };
    currentStats[newKey] = currentStats[oldKey];
    delete currentStats[oldKey];
    this.updateSelectedItem({ stats: currentStats });
  }

  protected addNewItem(): void {
    const newItem: Item = {
      id: `item_${Date.now()}`,
      name: 'New Item',
      iconPath: '',
      markdownDescription: '',
      rarity: 'common',
      goldCost: 0,
      stats: {},
      soldAt: [],
      buildsInto: [],
    };
    this.dataService.items.update(items => [...items, newItem]);
    this.selectedItemId.set(newItem.id);
  }

  protected deleteSelectedItem(): void {
    const idToDelete = this.selectedItemId();
    if (!idToDelete) return;
    this.dataService.items.update(items => items.filter(item => item.id !== idToDelete));
    this.selectedItemId.set(null);
  }
}
