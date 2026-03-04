import L from 'leaflet';
import { marked } from 'marked';
import type { Item, Shop, Recipe } from '@wc3db/shared';

declare global {
  interface Window {
    __wc3db: {
      items: Item[];
      shops: Shop[];
      recipes: Recipe[];
    };
  }
}

const { items, shops, recipes } = window.__wc3db;

const itemsById = new Map(items.map(item => [item.id, item]));
const shopsById = new Map(shops.map(shop => [shop.id, shop]));
const recipesByResultItemId = new Map(recipes.map(recipe => [recipe.resultItemId, recipe]));

const detailPanel = document.getElementById('detail-panel')!;
const detailPanelContent = document.getElementById('detail-panel-content')!;
const detailPanelCloseButton = document.getElementById('detail-panel-close-button')!;

const wc3Map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -2,
  maxZoom: 2,
  zoomSnap: 0.5,
});

const mapImageBounds: L.LatLngBoundsExpression = [[0, 0], [1024, 1024]];
L.imageOverlay('/wc3-item-db/assets/map.png', mapImageBounds).addTo(wc3Map);
wc3Map.fitBounds(mapImageBounds);

const shopMarkers = new Map<string, L.Marker>();

shops.forEach(shop => {
  const shopMarker = L.marker([shop.mapPosition.y, shop.mapPosition.x], {
    title: shop.name,
  }).addTo(wc3Map);

  shopMarker.on('click', () => navigateTo('shop', shop.id));
  shopMarkers.set(shop.id, shopMarker);
});

function openDetailPanel(htmlContent: string) {
  detailPanelContent.innerHTML = htmlContent;
  detailPanel.classList.remove('hidden');
}

function closeDetailPanel() {
  detailPanel.classList.add('hidden');
  detailPanelContent.innerHTML = '';
}

function renderShopPanel(shop: Shop): string {
  const itemListHtml = shop.itemIds.map(itemId => {
    const item = itemsById.get(itemId);
    if (!item) return '';
    return `
      <div class="shop-item" data-item-id="${item.id}" style="cursor:pointer; display:flex; align-items:center; gap:0.5rem; padding:0.4rem 0; border-bottom:1px solid #0f3460;">
        <img src="/wc3-item-db/${item.iconPath}" width="32" height="32" alt="${item.name}" />
        <span class="item-rarity-${item.rarity}">${item.name}</span>
        <span style="margin-left:auto; color:#ffd700;">${item.goldCost}g</span>
      </div>
    `;
  }).join('');

  return `
    <h2 style="margin-bottom:1rem;">${shop.name}</h2>
    <div>${itemListHtml}</div>
  `;
}

function renderItemPanel(item: Item): string {
  const recipe = recipesByResultItemId.get(item.id);

  const recipeHtml = recipe
    ? `
      <div style="margin-top:1rem;">
        <h3>Recipe</h3>
        <div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-top:0.5rem;">
          ${recipe.componentItemIds.map(componentItemId => {
            const componentItem = itemsById.get(componentItemId);
            if (!componentItem) return '';
            return `
              <div class="recipe-component" data-item-id="${componentItemId}" style="cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:0.25rem;">
                <img src="/wc3-item-db/${componentItem.iconPath}" width="40" height="40" alt="${componentItem.name}" />
                <span class="item-rarity-${componentItem.rarity}" style="font-size:0.75rem;">${componentItem.name}</span>
              </div>
            `;
          }).join('')}
        </div>
        ${recipe.goldCostToCombine > 0 ? `<p style="margin-top:0.5rem; color:#ffd700;">Combine cost: ${recipe.goldCostToCombine}g</p>` : ''}
      </div>
    `
    : '';

  const soldAtHtml = item.soldAt.length > 0
    ? `
      <div style="margin-top:1rem;">
        <h3>Sold at</h3>
        ${item.soldAt.map(shopId => {
          const shop = shopsById.get(shopId);
          if (!shop) return '';
          return `<div class="sold-at-shop" data-shop-id="${shopId}" style="cursor:pointer; color:#4fc3f7; margin-top:0.25rem;">${shop.name}</div>`;
        }).join('')}
      </div>
    `
    : '';

  const buildsIntoHtml = item.buildsInto.length > 0
    ? `
      <div style="margin-top:1rem;">
        <h3>Builds into</h3>
        <div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-top:0.5rem;">
          ${item.buildsInto.map(resultItemId => {
            const resultItem = itemsById.get(resultItemId);
            if (!resultItem) return '';
            return `
              <div class="builds-into-item" data-item-id="${resultItemId}" style="cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:0.25rem;">
                <img src="/wc3-item-db/${resultItem.iconPath}" width="40" height="40" alt="${resultItem.name}" />
                <span class="item-rarity-${resultItem.rarity}" style="font-size:0.75rem;">${resultItem.name}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `
    : '';

  return `
    <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1rem;">
      <img src="/wc3-item-db/${item.iconPath}" width="64" height="64" alt="${item.name}" />
      <div>
        <h2 class="item-rarity-${item.rarity}">${item.name}</h2>
        <span style="color:#ffd700;">${item.goldCost}g</span>
      </div>
    </div>
    <div class="item-description">${marked.parse(item.markdownDescription)}</div>
    ${recipeHtml}
    ${soldAtHtml}
    ${buildsIntoHtml}
  `;
}

function navigateTo(type: 'shop' | 'item', id: string) {
  window.location.hash = `${type}=${id}`;
}

function handleHashChange() {
  const hash = window.location.hash.slice(1);
  if (!hash) {
    closeDetailPanel();
    return;
  }

  const [type, id] = hash.split('=');

  if (type === 'shop') {
    const shop = shopsById.get(id);
    if (!shop) return;
    openDetailPanel(renderShopPanel(shop));
    wc3Map.setView([shop.mapPosition.y, shop.mapPosition.x], 1);
    shopMarkers.get(id)?.openPopup();
  }

  if (type === 'item') {
    const item = itemsById.get(id);
    if (!item) return;
    openDetailPanel(renderItemPanel(item));
  }
}

detailPanel.addEventListener('click', event => {
  const target = event.target as HTMLElement;
  const shopElement = target.closest<HTMLElement>('[data-shop-id]');
  const itemElement = target.closest<HTMLElement>('[data-item-id]');

  if (shopElement?.dataset.shopId) {
    navigateTo('shop', shopElement.dataset.shopId);
  } else if (itemElement?.dataset.itemId) {
    navigateTo('item', itemElement.dataset.itemId);
  }
});

detailPanelCloseButton.addEventListener('click', () => {
  window.location.hash = '';
});

window.addEventListener('hashchange', handleHashChange);
handleHashChange();