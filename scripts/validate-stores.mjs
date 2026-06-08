import {
  stores,
  pendingLocationStores,
  serviceCategories,
  materialCategories,
} from "../lib/stores.ts";

const validCategories = new Set([
  ...serviceCategories.map((category) => category.id),
  ...materialCategories.map((category) => category.id),
]);

const errors = [];
const warnings = [];

const idSet = new Set();
const visibleStores = stores.filter((store) => store.isVisible);

for (const store of stores) {
  if (idSet.has(store.id)) {
    errors.push(`Duplicate id: ${store.id}`);
  }
  idSet.add(store.id);

  for (const category of store.categories) {
    if (!validCategories.has(category)) {
      errors.push(`Invalid category "${category}" in ${store.name}`);
    }
  }

  if (store.isVisible) {
    if (!store.address) {
      errors.push(`Visible store missing address: ${store.name}`);
    }

    if (store.area === "미확인") {
      errors.push(`Visible store cannot use 미확인 area: ${store.name}`);
    }
  } else if (store.address) {
    warnings.push(`Hidden store has address and may be ready for publish: ${store.name}`);
  }
}

for (const pending of pendingLocationStores) {
  if (!pending.reason) {
    errors.push(`Pending store missing reason: ${pending.name}`);
  }

  if (!pending.area) {
    errors.push(`Pending store missing area: ${pending.name}`);
  }
}

console.log("Store validation summary");
console.log(`- total stores: ${stores.length}`);
console.log(`- visible stores: ${visibleStores.length}`);
console.log(`- pending stores: ${pendingLocationStores.length}`);

if (warnings.length) {
  console.log("\nWarnings");
  for (const warning of warnings) {
    console.log(`- ${warning}`);
  }
}

if (errors.length) {
  console.log("\nErrors");
  for (const error of errors) {
    console.log(`- ${error}`);
  }
  process.exit(1);
}

console.log("\nOK");
