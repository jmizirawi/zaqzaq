package com.zaqzaq_palestinian_dictionary.app

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class MainActivity : TauriActivity() {
  private var webView: WebView? = null
  private var bottomInsetPx: Int = 0

  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)

    // Read navigation bar inset and keep it updated (e.g. on rotation)
    ViewCompat.setOnApplyWindowInsetsListener(window.decorView) { view, insets ->
      bottomInsetPx = insets.getInsets(WindowInsetsCompat.Type.navigationBars()).bottom
      injectBottomInset()
      ViewCompat.onApplyWindowInsets(view, insets)
    }
  }

  override fun onWebViewCreate(webView: WebView) {
    this.webView = webView
    // Delay to allow the page to finish loading before injecting
    Handler(Looper.getMainLooper()).postDelayed({ injectBottomInset() }, 300)
  }

  override fun onResume() {
    super.onResume()
    injectBottomInset()
  }

  private fun injectBottomInset() {
    val wv = webView ?: return
    val density = resources.displayMetrics.density
    val insetDp = bottomInsetPx / density
    wv.evaluateJavascript(
      "document.documentElement.style.setProperty('--android-nav-inset', '${insetDp}px');",
      null
    )
  }
}
