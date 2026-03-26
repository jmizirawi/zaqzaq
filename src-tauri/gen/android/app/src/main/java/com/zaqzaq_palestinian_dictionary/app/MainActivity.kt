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
  private var lastTop: Int = 0
  private var lastBottom: Int = 0
  private var lastLeft: Int = 0
  private var lastRight: Int = 0

  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)

    ViewCompat.setOnApplyWindowInsetsListener(window.decorView) { view, insets ->
      val bars = insets.getInsets(
        WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout()
      )
      lastTop = bars.top
      lastBottom = bars.bottom
      lastLeft = bars.left
      lastRight = bars.right
      injectInsets()
      ViewCompat.onApplyWindowInsets(view, insets)
    }
  }

  override fun onWebViewCreate(webView: WebView) {
    this.webView = webView
    Handler(Looper.getMainLooper()).postDelayed({ injectInsets() }, 300)
  }

  override fun onResume() {
    super.onResume()
    injectInsets()
  }

  private fun injectInsets() {
    val wv = webView ?: return
    val d = resources.displayMetrics.density
    val top = lastTop / d
    val bottom = lastBottom / d
    val left = lastLeft / d
    val right = lastRight / d
    wv.evaluateJavascript(
      """
      var s = document.documentElement.style;
      s.setProperty('--android-inset-top', '${top}px');
      s.setProperty('--android-inset-bottom', '${bottom}px');
      s.setProperty('--android-inset-left', '${left}px');
      s.setProperty('--android-inset-right', '${right}px');
      """.trimIndent(),
      null
    )
  }
}
