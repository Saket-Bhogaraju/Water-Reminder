export interface CodeFile {
  name: string;
  path: string;
  language: 'kotlin' | 'xml' | 'groovy' | 'properties';
  description: string;
  content: string;
}

export const androidCodebase: CodeFile[] = [
  {
    name: "build.gradle (Project)",
    path: "build.gradle",
    language: "groovy",
    description: "Project-level Gradle file, configuring build plugins and Kotlin gradle integration.",
    content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.2'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.22"
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}`
  },
  {
    name: "build.gradle (Module: app)",
    path: "app/build.gradle",
    language: "groovy",
    description: "App module Gradle file with WorkManager dependencies to support reminders background workers.",
    content: `plugins {
    id 'com.android.application'
    id 'kotlin-android'
}

android {
    namespace 'com.hydromind.app'
    compileSdk 34

    defaultConfig {
        applicationId "com.hydromind.app"
        minSdk 26
        targetSdk 34
        versionCode 1
        versionName "1.0.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = '17'
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    
    // WorkManager (Kotlin + Coroutines support for reminders)
    implementation "androidx.work:work-runtime-ktx:2.9.0"
}`
  },
  {
    name: "AndroidManifest.xml",
    path: "app/src/main/AndroidManifest.xml",
    language: "xml",
    description: "App manifest declaring background permissions, notification receiver, boot completed, and HTML5 assets WebView activities.",
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.hydromind.app">

    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.HydroMind">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Widget Broadcast Receiver -->
        <receiver
            android:name=".widget.HydroWidgetProvider"
            android:exported="true"
            android:label="@string/widget_name">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
                <action android:name="com.hydromind.app.action.DRANK_WIDGET_QUICK" />
            </intent-filter>
            <meta-data
                android:name="android.appwidget.provider"
                android:resource="@xml/hydro_widget_info" />
        </receiver>

        <!-- Notifications Broadcast Receiver for direct action button taps in background -->
        <receiver
            android:name=".notification.NotificationActionReceiver"
            android:exported="false">
            <intent-filter>
                <action android:name="com.hydromind.app.action.DRANK_NOTIF_QUICK" />
                <action android:name="com.hydromind.app.action.REMIND_SNOOZE" />
            </intent-filter>
        </receiver>

    </application>
</manifest>`
  },
  {
    name: "MainActivity.kt",
    path: "app/src/main/java/com/hydromind/app/MainActivity.kt",
    language: "kotlin",
    description: "Main activity initializing the sandboxed WebView, caching engine, and mounting our JS interaction bridge.",
    content: `package com.hydromind.app

import android.annotation.SuppressLint
import android.content.Context
import android.content.res.Configuration
import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import com.hydromind.app.bridge.WebAppInterface

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Read dark mode state from SharedPreferences to set theme before loading WebView
        val sharedPref = getSharedPreferences("HydroMindPrefs", Context.MODE_PRIVATE)
        val isDarkModeVal = sharedPref.getBoolean("is_dark_mode", false)
        applyTheme(isDarkModeVal)

        webView = findViewById(R.id.webView)
        val webSettings = webView.settings
        webSettings.javaScriptEnabled = true
        webSettings.domStorageEnabled = true
        webSettings.databaseEnabled = true
        webSettings.allowFileAccess = true
        webSettings.allowContentAccess = true
        webSettings.mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE

        // Load frontend from Android Assets
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                // Synchronize dark mode when page loads completely
                webView.evaluateJavascript("javascript:if(window.syncAndroidDarkMode) { window.syncAndroidDarkMode($isDarkModeVal); }", null)
            }
        }

        // Attach JS bridge
        webView.addJavascriptInterface(WebAppInterface(this, webView), "AndroidApp")

        webView.loadUrl("file:///android_asset/index.html")
    }

    fun applyTheme(darkModeEnabled: Boolean) {
        val currentMode = if (darkModeEnabled) {
            AppCompatDelegate.MODE_NIGHT_YES
        } else {
            AppCompatDelegate.MODE_NIGHT_NO
        }
        AppCompatDelegate.setDefaultNightMode(currentMode)
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}`
  },
  {
    name: "WebAppInterface.kt (Bridge)",
    path: "app/src/main/java/com/hydromind/app/bridge/WebAppInterface.kt",
    language: "kotlin",
    description: "The JS bridge interface binding Web localStorage actions back to native Android systems.",
    content: `package com.hydromind.app.bridge

import android.content.Context
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.widget.Toast
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.Data
import com.hydromind.app.MainActivity
import com.hydromind.app.notification.ReminderWorker
import com.hydromind.app.widget.HydroWidgetProvider
import java.util.concurrent.TimeUnit

class WebAppInterface(private val context: Context, private val webView: WebView) {

    @JavascriptInterface
    fun logWater(amountMl: Int) {
        // Safe access to SharedPreferences of today Total progress
        val sharedPref = context.getSharedPreferences("HydroMindPrefs", Context.MODE_PRIVATE)
        val currentTotal = sharedPref.getInt("today_total", 0)
        val targetTotal = currentTotal + amountMl
        
        sharedPref.edit().putInt("today_total", targetTotal).apply()

        // Trigger an immediate design widget synchronization broadcast
        HydroWidgetProvider.triggerRefresh(context)

        // Show a brief Toast alert matching native apps UI feel
        Toast.makeText(context, "Logged " + amountMl + "ml from Web bridge!", Toast.LENGTH_SHORT).show()
    }

    @JavascriptInterface
    fun updateProgress(current: Int, goal: Int) {
        val sharedPref = context.getSharedPreferences("HydroMindPrefs", Context.MODE_PRIVATE)
        sharedPref.edit()
            .putInt("today_total", current)
            .putInt("daily_goal", goal)
            .apply()

        HydroWidgetProvider.triggerRefresh(context)
    }

    @JavascriptInterface
    fun optInNotifications(intervalMinutes: Int, startHour: Int, endHour: Int) {
        val sharedPref = context.getSharedPreferences("HydroMindPrefs", Context.MODE_PRIVATE)
        sharedPref.edit()
            .putInt("notification_interval_minutes", intervalMinutes)
            .putInt("notification_start_hour", startHour)
            .putInt("notification_end_hour", endHour)
            .putBoolean("notifications_enabled", true)
            .apply()

        // Configure WorkManager reminders scheduler
        val workManager = WorkManager.getInstance(context)
        workManager.cancelAllWorkByTag("hydro_reminders")

        val workData = Data.Builder()
            .putInt("interval", intervalMinutes)
            .putInt("startHour", startHour)
            .putInt("endHour", endHour)
            .build()

        val reminderRequest = OneTimeWorkRequestBuilder<ReminderWorker>()
            .setInputData(workData)
            .setInitialDelay(intervalMinutes.toLong(), TimeUnit.MINUTES)
            .addTag("hydro_reminders")
            .build()

        workManager.enqueue(reminderRequest)
        
        Toast.makeText(context, "Hydration reminder enqueued every " + intervalMinutes + " mins!", Toast.LENGTH_SHORT).show()
    }

    @JavascriptInterface
    fun setDarkModeActive(isEnabled: Boolean) {
        val sharedPref = context.getSharedPreferences("HydroMindPrefs", Context.MODE_PRIVATE)
        sharedPref.edit().putBoolean("is_dark_mode", isEnabled).apply()

        // Re-apply Theme directly on UI Thread
        if (context is MainActivity) {
            context.runOnUiThread {
                context.applyTheme(isEnabled)
            }
        }
    }
}`
  }
];
