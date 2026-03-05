import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'items', pathMatch: 'full' },
  { path: 'items', loadComponent: () => import('./features/items/items.component').then(m => m.ItemsComponent) },
  { path: 'shops', loadComponent: () => import('./features/shops/shops.component').then(m => m.ShopsComponent) },
  { path: 'recipes', loadComponent: () => import('./features/recipes/recipes.component').then(m => m.RecipesComponent) },
];
