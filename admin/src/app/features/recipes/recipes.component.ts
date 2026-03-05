import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    <h2>Recipes</h2>
    <p>{{ dataService.recipes().length }} recipes loaded.</p>
    <button mat-raised-button color="primary" (click)="dataService.exportRecipes()">Export recipes.json</button>
  `
})
export class RecipesComponent implements OnInit {
  protected readonly dataService = inject(DataService);

  ngOnInit(): void {
    this.dataService.loadAll();
  }
}
