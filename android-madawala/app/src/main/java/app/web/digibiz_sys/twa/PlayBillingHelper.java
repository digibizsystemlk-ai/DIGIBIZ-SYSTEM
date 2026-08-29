package app.web.digibiz_sys.twa;

import android.app.Activity;
import android.util.Log;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import java.util.ArrayList;
import java.util.List;

public class PlayBillingHelper implements PurchasesUpdatedListener {

    private static final String TAG = "DIGIBIZ_PLAY_BILLING";
    private final Activity mActivity;
    private BillingClient mBillingClient;
    private ProductDetails mProductDetails;

    public PlayBillingHelper(Activity activity) {
        this.mActivity = activity;
        initBillingClient();
    }

    private void initBillingClient() {
        PendingPurchasesParams pendingPurchasesParams = PendingPurchasesParams.newBuilder()
                .enableOneTimeProducts()
                .build();

        mBillingClient = BillingClient.newBuilder(mActivity)
                .setListener(this)
                .enablePendingPurchases(pendingPurchasesParams)
                .build();

        mBillingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult billingResult) {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    Log.d(TAG, "Google Play Billing setup successful.");
                    queryProducts();
                } else {
                    Log.e(TAG, "Google Play Billing setup failed: " + billingResult.getDebugMessage());
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                Log.w(TAG, "Google Play Billing service disconnected.");
            }
        });
    }

    private void queryProducts() {
        List<QueryProductDetailsParams.Product> productList = new ArrayList<>();
        productList.add(
                QueryProductDetailsParams.Product.newBuilder()
                        .setProductId("retail_monthly_sub")
                        .setProductType(BillingClient.ProductType.SUBS)
                        .build()
        );

        QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
                .setProductList(productList)
                .build();

        mBillingClient.queryProductDetailsAsync(params, (billingResult, result) -> {
            if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK 
                    && result != null 
                    && result.getProductDetailsList() != null 
                    && !result.getProductDetailsList().isEmpty()) {
                mProductDetails = result.getProductDetailsList().get(0);
                Log.d(TAG, "Product details retrieved: " + mProductDetails.getName());
            }
        });
    }

    public void launchPurchaseFlow() {
        if (mBillingClient != null && mProductDetails != null) {
            String offerToken = "";
            if (mProductDetails.getSubscriptionOfferDetails() != null && !mProductDetails.getSubscriptionOfferDetails().isEmpty()) {
                offerToken = mProductDetails.getSubscriptionOfferDetails().get(0).getOfferToken();
            }

            BillingFlowParams.ProductDetailsParams.Builder detailsBuilder = BillingFlowParams.ProductDetailsParams.newBuilder()
                    .setProductDetails(mProductDetails);
            if (!offerToken.isEmpty()) {
                detailsBuilder.setOfferToken(offerToken);
            }

            List<BillingFlowParams.ProductDetailsParams> productDetailsParamsList = new ArrayList<>();
            productDetailsParamsList.add(detailsBuilder.build());

            BillingFlowParams billingFlowParams = BillingFlowParams.newBuilder()
                    .setProductDetailsParamsList(productDetailsParamsList)
                    .build();

            mBillingClient.launchBillingFlow(mActivity, billingFlowParams);
        } else {
            Log.e(TAG, "BillingClient or ProductDetails not ready.");
        }
    }

    @Override
    public void onPurchasesUpdated(BillingResult billingResult, List<Purchase> purchases) {
        if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK && purchases != null) {
            for (Purchase purchase : purchases) {
                handlePurchase(purchase);
            }
        } else if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED) {
            Log.d(TAG, "User canceled Google Play purchase.");
        } else {
            Log.e(TAG, "Purchase error: " + billingResult.getDebugMessage());
        }
    }

    private void handlePurchase(Purchase purchase) {
        if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
            Log.d(TAG, "Purchase successful: " + purchase.getOrderId() + " Token: " + purchase.getPurchaseToken());
        }
    }
}
