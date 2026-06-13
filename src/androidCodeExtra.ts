import { CodeFile } from './androidCode';

export const androidCodebaseExtra: CodeFile[] = [
  {
    name: "HydroWidgetProvider.kt",
    path: "app/src/main/java/com/hydromind/app/widget/HydroWidgetProvider.kt",
    language: "kotlin",
    description: "Home screen component rendering the 4x1 horizontal progress bar and updating SharedPreferences.",
    content: `package com.hydromind.app.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.hydromind.app.R

class HydroWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == "com.hydromind.app.action.DRANK_WIDGET_QUICK") {
            val sharedPref = context.getSharedPreferences("HydroMindPrefs", Context.MODE_PRIVATE)
            val currentTotal = sharedPref.getInt("today_total", 0)
            
            // Increment water logs by 250ml
            val targetTotal = currentTotal + 250
            sharedPref.edit().putInt("today_total", targetTotal).apply()

            // Broadcast refresh to all active widgets
            triggerRefresh(context)
        }
    }

    companion object {
        fun triggerRefresh(context: Context) {
            val manager = AppWidgetManager.getInstance(context)
            val ids = manager.getAppWidgetIds(ComponentName(context, HydroWidgetProvider::class.java))
            val provider = HydroWidgetProvider()
            for (id in ids) {
                provider.updateAppWidget(context, manager, id)
            }
        }
    }

    private fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
        val views = RemoteViews(context.packageName, R.layout.hydro_widget)

        // Action Quick add trigger broadcast Intent binding
        val drankIntent = Intent(context, HydroWidgetProvider::class.java).apply {
            action = "com.hydromind.app.action.DRANK_WIDGET_QUICK"
        }
        val pendingIntent = PendingIntent.getBroadcast(
            context, 0, drankIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.btn_drank_quick, pendingIntent)

        // Read today total and goal from SharedPreferences
        val sharedPref = context.getSharedPreferences("HydroMindPrefs", Context.MODE_PRIVATE)
        val total = sharedPref.getInt("today_total", 0)
        val goal = sharedPref.getInt("daily_goal", 2500)

        // Display progress using horizontal progress bar and text format "X ml / Y ml"
        views.setTextViewText(R.id.widget_text_progress, "\${total} ml / \${goal} ml")
        views.setProgressBar(R.id.widget_progress_bar, goal, total, false)

        // Push layout refresh to Home Screen Manager
        appWidgetManager.updateAppWidget(appWidgetId, views)
    }
}`
  },
  {
    name: "NotificationActionReceiver.kt",
    path: "app/src/main/java/com/hydromind/app/notification/NotificationActionReceiver.kt",
    language: "kotlin",
    description: "Broadcast receiver handling lockscreen inline actions for logging 250ml water and scheduling reminder snoozes.",
    content: `package com.hydromind.app.notification

import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import com.hydromind.app.widget.HydroWidgetProvider
import java.util.concurrent.TimeUnit

class NotificationActionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.cancel(827) // Dismiss active reminder notification card

        val action = intent.action
        if (action == "com.hydromind.app.action.DRANK_NOTIF_QUICK") {
            // Log 250 ml directly in shared SharedPreferences
            val sharedPref = context.getSharedPreferences("HydroMindPrefs", Context.MODE_PRIVATE)
            val currentTotal = sharedPref.getInt("today_total", 0)
            sharedPref.edit().putInt("today_total", currentTotal + 250).apply()

            // Update home widget
            HydroWidgetProvider.triggerRefresh(context)
        } else if (action == "com.hydromind.app.action.REMIND_SNOOZE") {
            // Re-schedule reminder worker using WorkManager to trigger again in 30 minutes
            val workManager = WorkManager.getInstance(context)
            val snoozeRequest = OneTimeWorkRequestBuilder<ReminderWorker>()
                .setInitialDelay(30, TimeUnit.MINUTES)
                .addTag("hydro_reminders")
                .build()
            
            workManager.enqueue(snoozeRequest)
        }
    }
}`
  },
  {
    name: "ReminderWorker.kt",
    path: "app/src/main/java/com/hydromind/app/notification/ReminderWorker.kt",
    language: "kotlin",
    description: "Kotlin service running in background via WorkManager, checking daily limits and issuing notifications.",
    content: `package com.hydromind.app.notification

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.work.CoroutineWorker
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import com.hydromind.app.MainActivity
import com.hydromind.app.R
import java.util.Calendar
import java.util.concurrent.TimeUnit

class ReminderWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        val context = applicationContext
        val sharedPref = context.getSharedPreferences("HydroMindPrefs", Context.MODE_PRIVATE)

        // Global notifications opt-in toggle check
        val enabled = sharedPref.getBoolean("notifications_enabled", true)
        if (!enabled) return Result.success()

        val now = Calendar.getInstance()
        val currentHour = now.get(Calendar.HOUR_OF_DAY)
        val startHour = sharedPref.getInt("notification_start_hour", 8)
        val endHour = sharedPref.getInt("notification_end_hour", 22)

        // Time checks constraint: avoid launching reminders outside of specified active window
        if (currentHour < startHour || currentHour >= endHour) {
            rescheduleWorker(sharedPref.getInt("notification_interval_minutes", 60))
            return Result.success()
        }

        val total = sharedPref.getInt("today_total", 0)
        val goal = sharedPref.getInt("daily_goal", 2500)

        // Auto-stop reminders completely when daily target is met
        if (total >= goal) {
            return Result.success()
        }

        // Trigger alert notification
        triggerAlertNotification(context, total, goal)

        // Schedule next reminder
        val interval = sharedPref.getInt("notification_interval_minutes", 60)
        rescheduleWorker(interval)

        return Result.success()
    }

    private fun rescheduleWorker(intervalMinutes: Int) {
        val workManager = WorkManager.getInstance(applicationContext)
        val nextRequest = OneTimeWorkRequestBuilder<ReminderWorker>()
            .setInitialDelay(intervalMinutes.toLong(), TimeUnit.MINUTES)
            .addTag("hydro_reminders")
            .build()
        workManager.enqueue(nextRequest)
    }

    private fun triggerAlertNotification(context: Context, total: Int, goal: Int) {
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val channelId = "hydromind_notifications"

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId, "Hydration Reminders", NotificationManager.IMPORTANCE_HIGH
            )
            manager.createNotificationChannel(channel)
        }

        // Action launcher click intent to reopen MainActivity
        val openAppIntent = Intent(context, MainActivity::class.java)
        val openAppPending = PendingIntent.getActivity(
            context, 0, openAppIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Inline Action button 'Drank 250ml'
        val drankIntent = Intent(context, NotificationActionReceiver::class.java).apply {
            action = "com.hydromind.app.action.DRANK_NOTIF_QUICK"
        }
        val drankPending = PendingIntent.getBroadcast(
            context, 101, drankIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Inline Action button 'Snooze 30m'
        val snoozeIntent = Intent(context, NotificationActionReceiver::class.java).apply {
            action = "com.hydromind.app.action.REMIND_SNOOZE"
        }
        val snoozePending = PendingIntent.getBroadcast(
            context, 102, snoozeIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val builder = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle("Time to hydrate! 💧")
            .setContentText("You've logged \${total} ml of your \${goal} ml daily target.")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(openAppPending)
            .setAutoCancel(true)
            .addAction(R.mipmap.ic_launcher, "Drank 250ml", drankPending)
            .addAction(R.mipmap.ic_launcher, "Remind in 30 Min", snoozePending)

        manager.notify(827, builder.build())
    }
}`
  },
  {
    name: "hydro_widget.xml",
    path: "app/src/main/res/layout/hydro_widget.xml",
    language: "xml",
    description: "RemoteViews layout declaring the responsive 4x1 horizontal bar, water goals TextView, and tap triggers.",
    content: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="72dp"
    android:background="#EAEFF7"
    android:padding="12dp"
    android:orientation="horizontal"
    android:gravity="center_vertical">

    <ImageView
        android:id="@+id/widget_icon"
        android:layout_width="32dp"
        android:layout_height="32dp"
        android:layout_marginEnd="12dp"
        android:src="@drawable/ic_drop_blue"
        android:contentDescription="Water Bottle" />

    <LinearLayout
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_weight="1"
        android:orientation="vertical">

        <TextView
            android:id="@+id/widget_text_progress"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="0 ml / 2500 ml"
            android:textColor="#1A1A1A"
            android:textSize="13sp"
            android:textStyle="bold"
            android:layout_marginBottom="4dp" />

        <ProgressBar
            android:id="@+id/widget_progress_bar"
            style="?android:attr/progressBarStyleHorizontal"
            android:layout_width="match_parent"
            android:layout_height="10dp"
            android:max="2500"
            android:progress="0"
            android:progressTint="#0381FE"
            android:progressBackgroundTint="#D1D1D6" />

    </LinearLayout>

    <Button
        android:id="@+id/btn_drank_quick"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginStart="14dp"
        android:text="✓ Drank"
        android:textColor="#1976D2"
        android:textSize="12sp"
        android:textStyle="bold"
        android:padding="8dp" />

</LinearLayout>`
  },
  {
    name: "hydro_widget_info.xml",
    path: "app/src/main/res/xml/hydro_widget_info.xml",
    language: "xml",
    description: "AppWidget provider configuration setting size boundaries, horizontal resizes alignment, and periodic updates intervals.",
    content: `<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="250dp"
    android:minHeight="72dp"
    android:updatePeriodMillis="1800000"
    android:initialLayout="@layout/hydro_widget"
    android:resizeMode="horizontal"
    android:widgetCategory="home_screen">
</appwidget-provider>`
  }
];
