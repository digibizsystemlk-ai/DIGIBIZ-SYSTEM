package app.web.digibiz_sys.twa;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.http.SslError;
import android.os.Build;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.SslErrorHandler;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

public class LauncherActivity extends Activity {

    private static final String APP_URL = "https://digibiz-system.web.app/clients/madawalateashop?platform=android";
    private WebView mWebView;
    private PlayBillingHelper mPlayBillingHelper;

    private boolean isNetworkAvailable() {
        try {
            ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
            if (cm != null) {
                NetworkInfo activeNetwork = cm.getActiveNetworkInfo();
                return activeNetwork != null && activeNetwork.isConnectedOrConnecting();
            }
        } catch (Exception ignored) {}
        return true;
    }

    private String getErrorHtml() {
        return "<!DOCTYPE html>"
            + "<html>"
            + "<head>"
            + "<meta charset='utf-8'/>"
            + "<meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'/>"
            + "<title>DigiBiz - Network Timeout</title>"
            + "<style>"
            + "* { box-sizing: border-box; margin: 0; padding: 0; }"
            + "body { background-color: #061c14; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; text-align: center; }"
            + ".card { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 20px; padding: 32px 24px; max-width: 380px; width: 100%; box-shadow: 0 12px 30px rgba(0,0,0,0.4); }"
            + ".icon { font-size: 48px; margin-bottom: 16px; display: inline-block; }"
            + "h2 { font-size: 20px; font-weight: 700; color: #facc15; margin-bottom: 10px; }"
            + "p { font-size: 14px; color: #cbd5e1; line-height: 1.6; margin-bottom: 24px; }"
            + ".btn-retry { display: block; width: 100%; padding: 14px; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; font-size: 15px; font-weight: 700; border: none; border-radius: 12px; cursor: pointer; text-decoration: none; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35); }"
            + ".btn-retry:active { transform: scale(0.98); opacity: 0.9; }"
            + "</style>"
            + "</head>"
            + "<body>"
            + "<div class='card'>"
            + "<div class='icon'>📶</div>"
            + "<h2>Connection Timeout</h2>"
            + "<p>අන්තර්ජාල සම්බන්ධතාවය පරීක්ෂා කර නැවත උත්සාහ කරන්න.<br/><small style='color:#94a3b8;font-size:12px;'>Unable to reach DigiBiz Cloud Server.</small></p>"
            + "<button class='btn-retry' onclick='location.href=\"" + APP_URL + "\"'>🔄 Retry (නැවත උත්සාහ කරන්න)</button>"
            + "</div>"
            + "</body>"
            + "</html>";
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Hide title bar and set full screen
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN
        );

        FrameLayout layout = new FrameLayout(this);
        layout.setBackgroundColor(0xFF0F3B2C); // Retail theme green

        mWebView = new WebView(this);
        mWebView.setBackgroundColor(0xFF0F3B2C);
        layout.addView(mWebView, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ));

        setContentView(layout);

        WebSettings settings = mWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);

        if (isNetworkAvailable()) {
            settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
            mWebView.clearCache(true);
        } else {
            settings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        mPlayBillingHelper = new PlayBillingHelper(this);
        mWebView.addJavascriptInterface(new PrintBridge(this), "AndroidBridge");
        mWebView.addJavascriptInterface(new Object() {
            @android.webkit.JavascriptInterface
            public void launchPlayPurchase() {
                runOnUiThread(() -> {
                    if (mPlayBillingHelper != null) {
                        mPlayBillingHelper.launchPurchaseFlow();
                    }
                });
            }

            @android.webkit.JavascriptInterface
            public void signOut() {
                runOnUiThread(() -> {
                    if (mWebView != null) {
                        mWebView.clearCache(true);
                        mWebView.clearHistory();
                        try {
                            android.webkit.WebStorage.getInstance().deleteAllData();
                        } catch (Exception e) {}
                        mWebView.loadUrl("https://digibiz-sys.web.app/auth/login.html");
                    }
                });
            }
        }, "androidApp");

        String defaultUA = settings.getUserAgentString();
        settings.setUserAgentString(defaultUA + " DIGIBIZ_ANDROID_APP");

        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url == null) return false;
                if (url.startsWith("rawbt:") || url.startsWith("intent:") || url.startsWith("market:") || url.startsWith("tel:") || url.startsWith("whatsapp:") || url.startsWith("mailto:") || url.contains("wa.me") || url.contains("whatsapp.com") || url.contains("api.whatsapp.com")) {
                    try {
                        Intent intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME);
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        try {
                            Intent intent = new Intent(Intent.ACTION_VIEW, android.net.Uri.parse(url));
                            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            startActivity(intent);
                            return true;
                        } catch (Exception ignored) {
                            return true;
                        }
                    }
                }
                view.loadUrl(url);
                return true;
            }

            @Override
            public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                handler.cancel();
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request != null && request.isForMainFrame()) {
                    String reqUrl = request.getUrl() != null ? request.getUrl().toString() : "";
                    if (!reqUrl.startsWith("rawbt:") && !reqUrl.startsWith("intent:")) {
                        view.loadDataWithBaseURL("https://digibiz-sys.web.app", getErrorHtml(), "text/html", "UTF-8", null);
                    }
                }
            }

            @SuppressWarnings("deprecation")
            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                if (failingUrl != null && failingUrl.startsWith("https://digibiz-sys.web.app") && !failingUrl.contains("rawbt:")) {
                    view.loadDataWithBaseURL("https://digibiz-sys.web.app", getErrorHtml(), "text/html", "UTF-8", null);
                }
            }
        });

        mWebView.setWebChromeClient(new WebChromeClient());

        mWebView.loadUrl(APP_URL);
    }

    @Override
    public void onBackPressed() {
        if (mWebView != null && mWebView.canGoBack()) {
            mWebView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
