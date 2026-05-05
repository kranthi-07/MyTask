package com.example.mytask

import android.Manifest
import android.annotation.SuppressLint
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.Color
import android.os.*
import android.view.View
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var loader: View

    private val CHANNEL_ID = "task_channel"
    private var notificationId = 1

    // 🔗 JS Bridge
    inner class WebAppInterface {

        @JavascriptInterface
        fun vibrate(milliseconds: Int) {
            val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as Vibrator

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(
                    VibrationEffect.createOneShot(milliseconds.toLong(), 255)
                )
            } else {
                vibrator.vibrate(milliseconds.toLong())
            }
        }

        @JavascriptInterface
        fun sendNotification(title: String, message: String) {
            showNotification(title, message)
        }
    }

    // 🔔 Notification channel
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Task Notifications",
                NotificationManager.IMPORTANCE_HIGH
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun showNotification(title: String, message: String) {

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED
            ) return
        }

        val builder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)

        NotificationManagerCompat.from(this)
            .notify(notificationId++, builder.build())
    }

    // ✅ Loader animations
    private fun showLoader() {
        loader.alpha = 0f
        loader.visibility = View.VISIBLE
        loader.animate().alpha(1f).setDuration(200).start()
    }

    private fun hideLoader() {
        loader.animate().alpha(0f).setDuration(200).withEndAction {
            loader.visibility = View.GONE
        }.start()
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)

        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        loader = findViewById(R.id.loader)

        createNotificationChannel()

        // 🔐 Notification permission
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED
            ) {
                ActivityCompat.requestPermissions(
                    this,
                    arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                    1
                )
            }
        }

        window.statusBarColor = Color.parseColor("#0F172A")
        window.navigationBarColor = Color.parseColor("#0F172A")

        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.allowFileAccess = true
        val webSettings = webView.settings

        webSettings.builtInZoomControls = false
        webSettings.displayZoomControls = false
        webSettings.setSupportZoom(false)

        webView.webViewClient = object : WebViewClient() {

            override fun onPageStarted(
                view: WebView?,
                url: String?,
                favicon: android.graphics.Bitmap?
            ) {
                showLoader()
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                hideLoader()
            }
        }

        webView.addJavascriptInterface(WebAppInterface(), "Android")

        webView.loadUrl("file:///android_asset/index.html")
    }
}