const fs = require('fs');
const file = 'i:/DIGIBIZ-SYSTEM/public/clients/sathityrecentre/index.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Expense Modal Category Dropdown HTML update
const expenseCatOld = `<select class="form-control" id="expCat">
                            <option value="Shop Utility & Tea">Shop Utility & Tea</option>
                            <option value="Rent & Power">Rent & Power</option>
                            <option value="Transport">Transport</option>
                            <option value="Other">Other</option>
                        </select>`;
const expenseCatNew = `<select class="form-control expense-category-select" id="expCat">
                            <option value="Shop Utility & Tea">Shop Utility & Tea</option>
                            <option value="Rent & Power">Rent & Power</option>
                            <option value="Transport">Transport</option>
                            <option value="Other">Other</option>
                        </select>
                        <button class="btn btn-secondary btn-sm" onclick="openModal('expenseCategoryModal')" style="margin-top:4px; width:100%;">
                            <i class="fas fa-cog"></i> Manage Categories
                        </button>`;
content = content.replace(expenseCatOld, expenseCatNew);

// 2. Inventory Modal Update
const invPriceOld = `<div class="form-group">
                        <label>Selling Price (LKR) *</label>
                        <input type="number" class="form-control" id="invPrice" placeholder="900">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Stock</label>
                        <input type="number" class="form-control" id="invStock" value="10">
                    </div>`;
const invPriceNew = `<div class="form-group">
                        <label>Selling Price (LKR) *</label>
                        <input type="number" class="form-control" id="invPrice" placeholder="900">
                    </div>
                    <div class="form-group">
                        <label>Discount Price (LKR)</label>
                        <input type="number" class="form-control" id="invDiscountPrice" placeholder="800" value="0">
                        <div style="font-size:10px; color:#888; margin-top:2px;">💡 Set 0 if no discount</div>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Stock</label>
                        <input type="number" class="form-control" id="invStock" value="10">
                    </div>
                    <div class="form-group">
                        <label>Min Stock Alert</label>
                        <input type="number" class="form-control" id="invMinStock" value="3">
                        <div style="font-size:10px; color:#888; margin-top:2px;">⚠️ Alert when stock falls below this</div>
                    </div>`;
content = content.replace(invPriceOld, invPriceNew);


// 3. Inventory Table Header Update
const invThOld = `<th>Category</th>
                                <th class="text-right">Cost</th>
                                <th class="text-right">Price</th>
                                <th class="text-right">Stock</th>`;
const invThNew = `<th>Category</th>
                                <th class="text-right">Cost</th>
                                <th class="text-right">Price</th>
                                <th class="text-right">Discount</th>
                                <th class="text-right">Stock</th>`;
content = content.replace(invThOld, invThNew);

// 4. POS Cart Display Update (Discount)
const posDisplayOld = `'<div class="price">LKR ' + (i.price || 0).toLocaleString() + '</div>' +`;
const posDisplayNew = `'<div class="price">' + (i.discountPrice && i.discountPrice > 0 ? '<span style="text-decoration:line-through; color:#999; font-size:10px;">LKR ' + (i.price || 0).toLocaleString() + '</span> <span style="color:#067d62; font-weight:900;">LKR ' + (i.discountPrice || 0).toLocaleString() + '</span>' : 'LKR ' + (i.price || 0).toLocaleString()) + '</div>' +`;
content = content.replace(posDisplayOld, posDisplayNew);

// POS table view for items
const posTableOld = `'<td><strong style="color:#067d62;">LKR ' + (i.price || 0).toLocaleString() + '</strong></td>' +`;
const posTableNew = `'<td>' + (i.discountPrice && i.discountPrice > 0 ? '<span style="text-decoration:line-through; color:#999; font-size:10px;">LKR ' + (i.price || 0).toLocaleString() + '</span><br><strong style="color:#067d62;">LKR ' + (i.discountPrice || 0).toLocaleString() + '</strong>' : '<strong style="color:#067d62;">LKR ' + (i.price || 0).toLocaleString() + '</strong>') + '</td>' +`;
content = content.replace(posTableOld, posTableNew);

fs.writeFileSync(file, content, 'utf8');
