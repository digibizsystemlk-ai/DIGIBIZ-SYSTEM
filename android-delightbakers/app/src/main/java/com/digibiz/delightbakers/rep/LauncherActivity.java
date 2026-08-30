package com.digibiz.delightbakers.rep;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Color;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.GeolocationPermissions;
import android.webkit.JsPromptResult;
import android.webkit.JsResult;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.EditText;
import android.widget.FrameLayout;

public class LauncherActivity extends Activity {

    private static final String APP_URL = "https://digibiz-system.web.app/clients/delightbakers?platform=apk&app=rep";
    private WebView mWebView;
    private ValueCallback<Uri[]> mFilePathCallback;
    private static final int FILE_CHOOSER_RESULT_CODE = 1001;

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

    private String getOfflineErrorHtml() {
        return "<!DOCTYPE html>"
            + "<html>"
            + "<head>"
            + "<meta charset='utf-8'/>"
            + "<meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'/>"
            + "<title>Delight Bakers - Offline</title>"
            + "<style>"
            + "* { box-sizing: border-box; margin: 0; padding: 0; }"
            + "body { background: linear-gradient(145deg, #0a101d 0%, #131b2c 100%); color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; text-align: center; }"
            + ".card { background: #182238; border: 1px solid rgba(255, 153, 0, 0.25); border-radius: 20px; padding: 32px 24px; max-width: 380px; width: 100%; box-shadow: 0 16px 40px rgba(0,0,0,0.5); }"
            + ".brand { font-size: 13px; font-weight: 800; color: #ff9900; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; }"
            + ".icon { font-size: 52px; margin-bottom: 14px; display: inline-block; }"
            + "h2 { font-size: 20px; font-weight: 800; color: #ffffff; margin-bottom: 8px; }"
            + "p { font-size: 13.5px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }"
            + ".btn-retry { display: block; width: 100%; padding: 14px; background: linear-gradient(135deg, #ff9900 0%, #e68a00 100%); color: #111827; font-size: 15px; font-weight: 800; border: none; border-radius: 12px; cursor: pointer; text-decoration: none; box-shadow: 0 4px 18px rgba(255, 153, 0, 0.35); transition: all 0.2s; }"
            + ".btn-retry:active { transform: scale(0.97); opacity: 0.9; }"
            + "</style>"
            + "</head>"
            + "<body>"
            + "<div class='card'>"
            + "<div class='brand'>🚚 Delight Bakers Rep Portal</div>"
            + "<div class='icon'>📡</div>"
            + "<h2>No Internet Connection</h2>"
            + "<p>අන්තර්ජාල සම්බන්ධතාවය පරීක්ෂා කර නැවත උත්සාහ කරන්න.<br/><small style='color:#64748b;font-size:12px;'>Field Sales Portal requires active network connection.</small></p>"
            + "<button class='btn-retry' onclick='location.href=\"" + APP_URL + "\"'>🔄 Retry (නැවත උත්සාහ කරන්න)</button>"
            + "</div>"
            + "</body>"
            + "</html>";
    }

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Status bar theme colors
        Window window = getWindow();
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(0xFF0F172A);
        window.setNavigationBarColor(0xFF0F172A);

        FrameLayout layout = new FrameLayout(this);
        layout.setBackgroundColor(0xFF0F172A);

        mWebView = new WebView(this);
        mWebView.setBackgroundColor(0xFF0F172A);
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
        settings.setGeolocationEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        // Enable cookies
        CookieManager.getInstance().setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            CookieManager.getInstance().setAcceptThirdPartyCookies(mWebView, true);
        }

        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String urlStr = uri.toString();

                // Open external links (whatsapp, tel, mailto, maps) in external apps
                if (urlStr.startsWith("https://wa.me/") || urlStr.startsWith("whatsapp://") ||
                    urlStr.startsWith("tel:") || urlStr.startsWith("mailto:") ||
                    urlStr.startsWith("geo:") || urlStr.startsWith("https://maps.google.com/")) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        return false;
                    }
                }
                return false;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    mWebView.loadDataWithBaseURL(null, getOfflineErrorHtml(), "text/html", "UTF-8", null);
                }
            }
        });

        mWebView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onJsAlert(WebView view, String url, String message, final JsResult result) {
                new AlertDialog.Builder(LauncherActivity.this)
                    .setTitle("Delight Bakers")
                    .setMessage(message)
                    .setPositiveButton(android.R.string.ok, new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            result.confirm();
                        }
                    })
                    .setCancelable(false)
                    .create()
                    .show();
                return true;
            }

            @Override
            public boolean onJsConfirm(WebView view, String url, String message, final JsResult result) {
                new AlertDialog.Builder(LauncherActivity.this)
                    .setTitle("Delight Bakers")
                    .setMessage(message)
                    .setPositiveButton(android.R.string.ok, new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            result.confirm();
                        }
                    })
                    .setNegativeButton(android.R.string.cancel, new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            result.cancel();
                        }
                    })
                    .setCancelable(false)
                    .create()
                    .show();
                return true;
            }

            @Override
            public boolean onJsPrompt(WebView view, String url, String message, String defaultValue, final JsPromptResult result) {
                final EditText input = new EditText(LauncherActivity.this);
                if (defaultValue != null) input.setText(defaultValue);
                input.setSelection(input.getText().length());

                FrameLayout container = new FrameLayout(LauncherActivity.this);
                FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.MATCH_PARENT, 
                    FrameLayout.LayoutParams.WRAP_CONTENT
                );
                params.leftMargin = 50;
                params.rightMargin = 50;
                input.setLayoutParams(params);
                container.addView(input);

                new AlertDialog.Builder(LauncherActivity.this)
                    .setTitle("Delight Bakers")
                    .setMessage(message)
                    .setView(container)
                    .setPositiveButton(android.R.string.ok, new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            result.confirm(input.getText().toString());
                        }
                    })
                    .setNegativeButton(android.R.string.cancel, new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            result.cancel();
                        }
                    })
                    .setCancelable(false)
                    .create()
                    .show();
                return true;
            }

            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                callback.invoke(origin, true, false);
            }

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (mFilePathCallback != null) {
                    mFilePathCallback.onReceiveValue(null);
                }
                mFilePathCallback = filePathCallback;

                Intent intent = fileChooserParams.createIntent();
                try {
                    startActivityForResult(intent, FILE_CHOOSER_RESULT_CODE);
                } catch (Exception e) {
                    mFilePathCallback = null;
                    return false;
                }
                return true;
            }
        });

        if (isNetworkAvailable()) {
            mWebView.loadUrl(APP_URL);
        } else {
            mWebView.loadDataWithBaseURL(null, getOfflineErrorHtml(), "text/html", "UTF-8", null);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILE_CHOOSER_RESULT_CODE) {
            if (mFilePathCallback != null) {
                Uri[] results = null;
                if (resultCode == Activity.RESULT_OK && data != null) {
                    if (data.getData() != null) {
                        results = new Uri[]{data.getData()};
                    } else if (data.getClipData() != null) {
                        int count = data.getClipData().getItemCount();
                        results = new Uri[count];
                        for (int i = 0; i < count; i++) {
                            results[i] = data.getClipData().getItemAt(i).getUri();
                        }
                    }
                }
                mFilePathCallback.onReceiveValue(results);
                mFilePathCallback = null;
            }
        } else {
            super.onActivityResult(requestCode, resultCode, data);
        }
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
