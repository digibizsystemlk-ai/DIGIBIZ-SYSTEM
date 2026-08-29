# තාක්ෂණික වැඩ නියෝගය (Technical Work Order)

## POS බිලකින් පසු තොගය (Stock) අඩු නොවීම — මූල හේතු විශ්ලේෂණය + විසඳුම් උපදෙස්

> **අදාළ මොඩියුල:** Retail POS (`pos.html`) ↔ Inventory (`inventory.html`)
> **බලපෑමට ලක්වූ ගොනු:**
> - `public/modules/retail/pos.html`
> - `public/modules/retail/inventory.html`
> - `public/modules/retail/js/location-stock-core.js`
>
> **තත්ත්වය:** හඳුනාගත්තා (Not yet fixed — Developer විසින් ක්‍රියාත්මක කළ යුතුයි)

---

## 1. ගැටලුවේ සාරාංශය (Problem Summary)

Retail POS එකෙන් බිලක් (Sale) සාර්ථකව සම්පූර්ණ කළ විට, එම බිලට අදාළ අයිතමවල ප්‍රමාණයන් Retail **Inventory** පිටුවේ පෙන්වන තොග (Stock) වලින් **අඩු නොවේ.** බිල (Order) හා ගිණුම් කටයුතු (Journal) නිවැරදිව සුරැකෙන නමුත්, තොග ප්‍රමාණය යාවත්කාලීන නොවේ.

---

## 2. පද්ධති ගැලීම (System Flow) — තොගය අඩු විය යුතු ආකාරය

1. **POS** (`pos.html`) — `completePaymentBtn` click → Order එක `orders/{businessId}/list` හි save වේ.
2. ඊට පසු **`LocationStockCore.deductStockOnSaleTransactional()`** හැඳින්වේ (pos.html හි ~3019 පේළිය).
3. එම ශ්‍රිතය තුළ:
   - `products/{businessId}/list/{prodId}` → `stock` අඩු වේ.
   - `product_location_stock/{businessId}/list/{prodId}__{locationId}` → `quantity` / `stock` අඩු වේ.
   - `stockMovements/{businessId}/list/...` → `SALE_OUT` audit වාර්තාවක් ලියයි.
4. **Inventory** (`inventory.html`) — `product_location_stock` හා `products` වල නව අගය ලබාගෙන `getProductDisplayStock()` මඟින් තොගය පෙන්වයි.

**එනම්:** `LocationStockCore` ශ්‍රිතය තොග අඩු කිරීමේ එකම ප්‍රධාන තැනයි (POS line 3019, හා `location-stock-core.js` හි `deductStockOnSaleTransactional`).

---

## 3. හඳුනාගත් මූල හේතු (Root Causes)

ඉහත කේත ගැඹුරින් විශ්ලේෂණය කළ විට **හේතු කිහිපයක්** එකතු වී ඇති බව පෙනේ:

### 🔴 හේතුව 1 — POS හි Stock අඩුකිරීමේ දෝෂය `try/catch` නිසා නිහඬව ගිලී යයි (Silent Failure) — වඩාත්ම බලපාන හේතුව

`pos.html` (~3019 පේළිය) හි තොගය අඩුකිරීමේ (deduction) කේතය මුළුමනින්ම වෙනම `try { ... } catch (errStock) { ... }` ඇතුලේ තිබේ:

```js
// පළමුව Order save වී, Journal entry ලියැවී අවසන්
await orderRef.update({ invoiceNo: invoiceNo });
await createJournalEntryForSale(...);

// ඊට පස්සේ තොගය අඩු කිරීමට උත්සාහය
try {
    if (window.LocationStockCore && typeof window.LocationStockCore.deductStockOnSaleTransactional === 'function') {
        await LocationStockCore.deductStockOnSaleTransactional({...});
    } else {
        // fallback batch...
    }
} catch (errStock) {
    console.error('[POS] Stock deduction error:', errStock);
    showToast('Stock deduction notice: ' + errStock.message, true);  // 👈 Toast පමණයි, sale දැනටමත් සාර්ථකයි
}
```

- **බිල (Order) දැනටමත් save වී අවසන්** නිසා, තොගය අඩුකිරීමේ පියවර අසාර්ථක වුවද බිල "Successful" ලෙස පෙන්වයි.
- කිසියම් write error, Firestore batch threshold (writes >500), `db` යොමුවක් නොමැතිවීම, හෝ loop ඇතුලේ exception එකක් වූ විට — එය **සම්පූර්ණයෙන් ගිලී** යන්නේ `console.error` + ක්ෂණික Toast එකක් පමණි.
- **ප්‍රතිඵලය:** User ට පෙනෙන්නේ "Sale Completed Successfully", නමුත් තොගය අඩු වී නැත.

**නිර්දේශය:** තොගය අඩුකිරීම **Order creation එකට පෙර** හෝ **එකම transaction / අනිවාර්ය (mandatory) පියවරක්** ලෙස කරන්න. එය අසාර්ථක වුවහොත් **සම්පූර්ණ බිල අසාර්ථක (rollback/block) කරන්න** සහ user ට පැහැදිලි දෝෂයක් දක්වන්න.

---

### 🔴 හේතුව 2 — Location stock deduction එක **වැරදි Location** එකකට ලියා දෙයි — `effectiveLocId` logic දෝෂ සහිතයි

`location-stock-core.js` හි `deductStockOnSaleTransactional` තුළ:

```js
const matchingLocStocks = locStockDocs.filter(d => 
    d.productId === prodId && (Number(d.quantity) > 0 || Number(d.stock) > 0)
);
let effectiveLocId = posLocationId;
if (matchingLocStocks.length > 0) {
    const exactMatch = matchingLocStocks.find(d => d.locationId === posLocationId);
    effectiveLocId = exactMatch ? exactMatch.locationId : matchingLocStocks[0].locationId;  // 👈 ගැටලුව
}
```

- Cashier තෝරන `posLocationId` සඳහා එම product එකට `product_location_stock` **record එකක් නොමැති** විට, නමුත් product එකට **වෙනත් location** වල records තිබේ නම්:
  - Code එක **නිහඬව** `matchingLocStocks[0].locationId` වෙත stock හරහරය (එනම් cashier තෝරපු location එක **නොව** වෙනත් location එකක්) අඩු කරයි.
- එම නිසා Inventory එකේ **තේරූ Location** පෙරහැරේ (filter) `getProductDisplayStock` එකෙන් පෙන්වන `product_location_stock.quantity` එක **අඩු නොවී** පේනවා.

**නිර්දේශය:** `exactMatch` නොමැති විට code එක **`posLocationId` හිදීම** අඩු කිරීමට බල කරන්න (e.g., `product_location_stock` හි doc එක නොමැති නම් **එය create කරන්න**), නැතහොත් **පැහැදිලි දෝෂයක්/අනතුරුඇඟවීමක්** දක්වන්න. කිසි විටෙකත් stock වෙනත් location එකකට redirect නොකළ යුතුයි.

---

### 🔴 හේතුව 3 — Inventory හි display දත්ත මූලාශ්‍ර **දෙකක්** — `p.stock` (Product doc) හා `product_location_stock.quantity` — සමමුහුර්ත නොවීම

`inventory.html` හි `getProductDisplayStock()`:

```js
function getProductDisplayStock(p, locationFilter = 'all') {
    const pid = p.id || p.docId;
    const locList = productLocationStockMap[pid] || [];
    if (locationFilter && locationFilter !== 'all') {
        const match = locList.find(...);
        return match ? (Number(match.quantity) || 0) : (...);   // 👈 Location filter → location stock
    }
    if (p.stock !== undefined && !isNaN(Number(p.stock))) {
        return Number(p.stock);                                  // 👈 "All Stock" → product doc stock
    }
    ...
}
```

- කිසිදු Location filter නොමැති (default "All Stock") විට Inventory පෙන්වන්නේ **`products.{id}.stock`** (master product stock).
- Location filter එකක් තේරූ විට පෙන්වන්නේ **`product_location_stock.quantity`**.
- POS හි `deductStockOnSaleTransactional` හිදී (හේතුව 2 නිසා) `effectiveLocId` මාරුවුවහොත්, **`locStockRef` එකේ key** (`${prodId}__${effectiveLocId}`) වෙනස් වේ. එනම් correct location doc එකට ලියනවා වෙනුවට **වෙනත් doc එකක් (හෝ අලුත් doc එකක්)** ලියනු ලැබේ.
- එනම් `p.stock` (master) අඩු වුවත්, හිතුවට අනුව **තෝරූ location හි quantity** එක වෙනස් නොවේ. User Inventory එකේ බලන ආකාරය අනුව (All Stock හෝ specific Location) ප්‍රතිඵලය අසමාන වේ.

> **සටහන:** `deductStockOnSaleTransactional` හි `product.stock` (master) **සැමවිටම** `newProdStock = currentProdStock - qty` ලෙස අඩුවේ. එම නිසා "All Stock" view එකෙන් බැලුවොත් stock අඩුවෙනවා පෙනිය හැක. එහෙත් **specific location view** එක බැලුවොත් අඩු නොවෙනවා පේනවා. නිවැරදි පරීක්ෂණය වන්නේ **දෙකම එකවර** බැලීමයි.

---

### 🟠 හේතුව 4 — Product ID ගැලපීමේ අස්ථාවරත්වය (id vs docId vs productId)

`pos.html` හි `addToCart` කරන විට `cart.push({ ...p, ... })` — `p` product object එකට `id` හා `docId` දෙකම තිබේ (`loadInitialData` හි `{ ...doc.data(), id: doc.id, docId: doc.id }`).

- `deductStockOnSaleTransactional` හි: `const prodId = item.docId || item.id || item.productId;`
- බොහෝ අවස්ථාවල මෙය හරි. එහෙත් යම් product එකක් `quickProductModal` හරහා හෝ වෙනත් මාර්ගයකින් එකතු කළ විට `id`/`docId` නොමැති වුවහොත් `prodId = item.productId` පමණක් විය හැක — එය `products` collection හි doc ID එක හා නොගැලපේ නම්:
  ```js
  if (!prodId) return;   // 👈 මෙතන නිහඬව skip වේ → තොගය අඩු නොවේ
  ```
- **නිර්දේශය:** Product add කිරීමේ සියලු මාර්ගවල `docId`/`id` නිර්භයව product object එකට ඇතුළත් වන බවට සහතික වන්න. `if (!prodId) return;` වෙනුවට දෝෂයක්/log එකක් දමන්න.

---

### 🟠 හේතුව 5 — Non-transactional read-then-write + Last-write-wins (කාල/සමගාමී ගැටලු)

`deductStockOnSaleTransactional` භාවිතා කරන්නේ **`db.batch()`** එකක් මිස **`db.runTransaction()`** නොවේ:

```js
const locSnap = await db.collection('product_location_stock')...get();  // Read
const prodSnap = await db.collection('products')...get();               // Read
...
const batch = db.batch();
... // batch.set() ගොඩනඟයි
await batch.commit();  // Write
```

- මෙය **atomic නොවේ.** එකම වේලාවට POS terminal දෙකකින් (හෝ GRN receive එකකින්) එකම product එකට write වුවහොත් **double count loss** හෝ **loss of update** සිදුවිය හැක.
- `Math.max(0, currentStock - qty)` භාවිතයෙන් සෘණ අගයන් වළක්වයි, නමුත් concurrent අවස්ථාවලදී පැරණි `currentProdStock` අගයෙන් write කිරීම නිසා තොගය **වැරදි ලෙස** හෝ **දෙවරක්** ගණන් විය හැක.
- **නිර්දේශය:** `db.runTransaction()` භාවිතා කර නිසි atomic read-then-write කරන්න. GRN receive හි `/receiveGRNTransactional` නිවැරදි atomic transaction එකක් කරන බැවින් **එම ක්‍රමවේදයම** POS deduction එකටද අදාළ කරන්න.

---

## 4. තාවකාලික නිගමනය (වඩාත්ම සම්භාවිතාව)

> **"බිල සාර්ථකයි, නමුත් තොගය අඩු නොවේ"** යන්න **හේතුව 1** (try/catch silent failure) හා **හේතුව 2** (wrong-location deduction) යන දෙකේ එකතුවකි.
>
> 1. එක්කෝ `deductStockOnSaleTransactional` හෝ එහි fallback batch එක **අසාර්ථක** වී, catch එක නිසා නිහඬව ගිලී — බිල බේරී, තොගය ලියවුණේ නැත.
> 2. නැතහොත් තොගය අඩු වුවත්, එය **වෙනත් Location** එකක doc එකට (හෝ master `p.stock` ට පමණක්) ලියවී — ඔබ Inventory එකේ බැලූ view (specific Location / All) එකේ **දිස් නොවී.**

---

## 5. Developer විසින් කළ යුතු ක්‍රියාත්මක විසඳුම් (Actionable Fixes)

### ✅ 5.1 තොගය අඩුකිරීමේ පියවර **බිලට පෙර** කරන්න, අසාර්ථක වුවහොත් බිල **block** කරන්න (`pos.html`)
- `completePaymentBtn.onclick` තුළ, Order create කිරීමට **පෙර** තොගය deduct කරන්න.
- තොගය deduct නොවුවහොත් `throw` කර Order save නොකරන්න සහ user ට පැහැදිලි message එකක් දෙන්න.
- වර්තමාන `try { ... } catch (errStock) { ... showToast(...) }` බ්ලොක් එක **ඉවත් කරන්න** හෝ එහි අසාර්ථකත්වය order හි **failure** ලෙස සලකන්න.

### ✅ 5.2 Stock deduct අසාර්ථක වුවහොත් **rollback / transaction**
- හොඳම ක්‍රමය: Order + Journal + Stock deduction සියල්ල **එකම `db.runTransaction()`** ඇතුලේ කරන්න.
  - හෝ Stock deduction පළමුව කර, පසුව Order save කර, fail වුවහොත් rollback (counter-adjust) කරන්න.

### ✅ 5.3 `deductStockOnSaleTransactional` හි `effectiveLocId` logic නිවැරදි කරන්න (`location-stock-core.js`)
```js
// ❌ දැනට:
let effectiveLocId = posLocationId;
if (matchingLocStocks.length > 0) {
    const exactMatch = matchingLocStocks.find(d => d.locationId === posLocationId);
    effectiveLocId = exactMatch ? exactMatch.locationId : matchingLocStocks[0].locationId;
}

// ✅ මෙසේ කරන්න (redirect නැතිව, තෝරපු location හිදීම):
const effectiveLocId = posLocationId || 'MAIN';
// locStockRef එකට batch.set() merge:true + quantity:newLocStock වලින් doc එක නොමැති නම් create වේ.
```
- **ඉලක්කය:** තෝරපු `posLocationId` හිදීම stock අඩු කරන්න. Product එකට එම location doc එක නොමැති නම් **එය create කර** stock වාර්තා කරන්න. `matchingLocStocks[0]` වෙත redirect **ක්‍රියාත්මක නොකරන්න.**

### ✅ 5.4 Single source of truth — Product doc `stock` හා `product_location_stock.quantity` අතර සමමුහුර්තය
- Inventory හි `getProductDisplayStock` හි "All Stock" view හා specific Location view යන දෙකම **එකම data source** එකක් භාවිතා කරන්න (සමස්ත Location aggregation හෝ `p.stock` — එකක් තෝරාගෙන දෙකම එයම පෙන්වන්න).
- Product doc `stock` හා location quantities අතර cross-check / consistency ක්‍රියාත්මක කරන්න.

### ✅ 5.5 `if (!prodId) return;` නිහඬ skip ඉවත් කරන්න (`location-stock-core.js`)
```js
if (!prodId) {
    console.error('[POS] Missing product ID on cart item, cannot deduct stock:', item);
    throw new Error('Missing product ID on cart item');   // Bill block කරන්න
}
```

### ✅ 5.6 Atomic transaction භාවිතා කරන්න (`location-stock-core.js`)
- `deductStockOnSaleTransactional` නිසැකවම `db.runTransaction(async t => { ... })` ලෙස කරන්න:
  - `transaction.get(prodRef)` → stock අඩු කරන්න
  - `transaction.get(locStockRef)` → quantity අඩු කරන්න
  - `transaction.set(movementRef, SALE_OUT movement)`
  - Order/journal එකම transaction ඇතුලේ හෝ deduct success එකට පසුව

> **මතක්:** `receiveGRNTransactional` හි ඔබ දැනටමත් නිවැරදි atomic transaction එකක් කරනවා. **එම ක්‍රමවේදයම** POS sale deduction එකට අදාළ කරන්න.

---

## 6. පරීක්ෂා කළ යුතු අවස්ථා (Test Checklist)

1. **Single location/store** — බිලක් දමා, `products.stock` හා `product_location_stock`(MAIN).quantity යන දෙකම අඩුවේද?
2. **Console check** — `console.log("Committed atomic stock deduction ...")` පණිවිඩය පේනවාද? හෝ `errStock` catch දෝෂයක් තිබේද?
3. **Firestore console** — පහත documents පරීක්ෂා කරන්න:
   - `products/{businessId}/list/{prodId}` → `stock`
   - `product_location_stock/{businessId}/list/{prodId}__{locationId}` → `quantity`
   - `stockMovements/{businessId}/list/...` → `SALE_OUT` record එකක්
   - `orders/{businessId}/list/...` → order
4. **Location mismatch scenario** — Product එකට Location A හි stock ඇත, cashier POS එකේ Location B තෝරයි. Stock අඩු වන්නේ කොතැනද? (එය B විය යුතුයි / අවම වශයෙන් clear warning එකක්)
5. **"All Stock" vs specific Location** — Inventory එකේ දෙකම බලා අගයන් සමානද/අනුකූලද?
6. **Concurrent sales** — POS window 2 කින් එකම product එකට බිල දමා, තොගය නිවැරදිව අඩුවේද (double-deduct / loss-of-update)?
7. **Root collection read** — `inventory.html` හි `getProductDisplayStock` හි සියලු views නිවැරදි stock එකම පෙන්වයිද?

---

## 7. Developer අතට ගත යුතු CODE ස්ථාන (Exact Code Locations)

| ගොනුව | Functions / Lines | කළ යුතුදේ |
|------|-------------------|-------------|
| `public/modules/retail/pos.html` | `completePaymentBtn.onclick` (~line 2930–3085) | Stock deduction බිලට පෙර කරන්න; silent try/catch ඉවත් කරන්න; fail වුවහොත් bill block කරන්න |
| `public/modules/retail/js/location-stock-core.js` | `deductStockOnSaleTransactional` | `effectiveLocId` redirect නිවැරදි කරන්න; `product_location_stock` create කරන්න; atomic transaction භාවිතා කරන්න; `if(!prodId) return` නිහඬ skip ඉවත් කරන්න |
| `public/modules/retail/inventory.html` | `getProductDisplayStock` (~line 832–843) | "All Stock" හා specific Location views එකම data source එකෙන් පෙන්වන්න; consistency cross-check |

---

## 8. අමතර වැදගත් සටහන් (Developer Notes)

1. **Data model key හි `productId__locationId`** structure එක staff හා location-based ගෙවීම් වලට බලපාන බැවින්, key naming එක **අනුකූලව** තබා ගන්න (`locationId` හිදී හෝ `code` හිදී — දෙකම එකම format එකකින් තබන්න).
2. `deductStockOnSaleTransactional` හිදී `currentProd.locationId` හා `currentProd.locations[]` අගයන් **අඩුවීමට පෙර** products doc එකෙන් path query කරන්නේ `prodDocs.find(p => p.id === prodId)` මඟිනි. Product doc එකේ `id` හා `prodId` නොගැලපේ නම් හේතුව 4 සිදුවේ.
3. **Cache/browser** — පරීක්ෂාව අතරතුර Service Worker / localStorage cache (`cached_pos_prods_...`) නිසා පැරණි තොගය පෙන්විය හැක. Hard refresh / incognito හි පරීක්ෂා කරන්න.
4. Rollout කිරීමට පෙර **deployed version** හා **local version** අතර වෙනසක් නැත — දෙකම `deductStockOnSaleTransactional` එකම ආකාරයෙන් තිබේ (මෙය සත්‍යාපනය කරන ලදී). එම නිසා fix එක deploy කළ වහාම live වලටද බලපානු ඇත.

---
*Work order අවසානය. කරුණාකර 5.x විසඳුම් ක්‍රියාත්මක කර, 6.x checklist එක සම්පූර්ණයෙන් සත්‍යාපනය කරන්න.*
