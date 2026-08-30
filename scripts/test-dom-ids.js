const fs = require('fs');

const clients = ['delightbakers', 'spi_holdings'];
const requiredIds = [
    'orderShop', 'orderRep', 'orderType', 'orderDate', 'orderDeliveryDate',
    'orderPriceTier', 'orderPayment', 'chequeDetailsSection', 'orderChequeNumber',
    'orderChequeBank', 'orderChequeDate', 'orderChequeDueDate',
    'shopDossierCard', 'dossierShopName', 'dossierOwnerName', 'dossierBalance',
    'dossierCreditLimit', 'dossierAvailableCredit', 'dossierRoute', 'dossierCreditBar',
    'dossierPhoneLink', 'dossierWhatsAppLink',
    'productSearchInput', 'productSearchFloatingResults', 'activeLinePrice',
    'activeLineQty', 'activeLineFreeQty', 'activeLineDiscount',
    'cartItemBadgeCount', 'cartTableBody', 'orderReturnsContainer', 'orderReturnsTableBody',
    'posOrderRefId', 'posGrossSubtotal', 'posLineDiscounts', 'posOrderSpecialDiscount',
    'posFreeIssuesValue', 'posReturnsRow', 'posReturnsDeduction', 'posNetTotal',
    'posCashTendered', 'posChangeLabel', 'posChangeValue', 'orderNotes',
    'grnMonthTotal', 'grnMonthCount', 'grnItemsReceived', 'grnSupplierDue',
    'grnSupplierCount', 'grnCompletedCount', 'grnSearchFilter', 'grnSupplierFilter',
    'grnPaymentFilter', 'grnTotalRecordsCount', 'grnTableBody',
    'catalogModal', 'catalogSearchInput', 'catalogCategoryPills', 'catalogGridContainer',
    'grnStudioModal', 'grnModalSupplier', 'grnModalBillNumber', 'grnModalPoRef',
    'grnModalDate', 'grnModalLocation', 'grnModalReceiver', 'grnModalSupplierBalance',
    'grnLineItemsTableBody', 'grnModalPaymentMode', 'grnPartialPaymentRow',
    'grnModalCashPaid', 'grnModalDueDate', 'grnModalNotes', 'grnModalGrossTotal',
    'grnModalDiscount', 'grnModalFreight', 'grnModalNetTotal',
    'grnVoucherViewModal', 'grnVoucherViewContent',
    'quickAddShopModal', 'quickShopName', 'quickShopOwner', 'quickShopPhone', 'quickShopAddress', 'quickShopCreditLimit',
    'quickAddSupplierModal', 'quickSupplierName', 'quickSupplierContact', 'quickSupplierPhone', 'quickSupplierAddress'
];

for (const clientId of clients) {
    const html = fs.readFileSync('public/clients/' + clientId + '/index.html', 'utf8');
    const missing = requiredIds.filter(id => !html.includes('id="' + id + '"'));
    console.log(clientId + ': ' + (missing.length === 0 ? '✅ ALL ' + requiredIds.length + ' IDs PRESENT' : '❌ MISSING: ' + missing.join(', ')));
}
