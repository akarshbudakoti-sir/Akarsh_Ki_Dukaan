
package com.akarsh.kidukaan;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.graphics.Color;
import android.webkit.DownloadListener;
import android.app.DownloadManager;
import android.content.Context;
import android.net.Uri;
import android.os.Environment;
import android.webkit.CookieManager;
import android.webkit.URLUtil;

public class MainActivity extends Activity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().setStatusBarColor(Color.rgb(17, 13, 25));
        getWindow().setNavigationBarColor(Color.rgb(17, 13, 25));

        webView = new WebView(this);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);

        webView.setWebViewClient(new WebViewClient());
        CookieManager.getInstance().setAcceptCookie(true);

        webView.setDownloadListener((url, userAgent, disposition, mimeType, length) -> {
            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
            request.setTitle(URLUtil.guessFileName(url, disposition, mimeType));
            request.setNotificationVisibility(
                DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED
            );
            request.setDestinationInExternalPublicDir(
                Environment.DIRECTORY_DOWNLOADS,
                URLUtil.guessFileName(url, disposition, mimeType)
            );
            ((DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE)).enqueue(request);
        });

        setContentView(webView);
        webView.loadUrl("https://akarshbudakoti-sir.github.io/Akarsh_Ki_Dukaan/");
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
          }
