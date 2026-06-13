import { CodeFile } from './androidCode';

export const androidCodebaseExtra: CodeFile[] = [
  {
    name: "HomeScreen.kt (Jetpack Compose)",
    path: "app/src/main/java/com/hydromind/app/ui/home/HomeScreen.kt",
    language: "kotlin",
    description: "Jetpack Compose view rendering the main interactive screen. Features an animated One UI circular water progression wheel, live stats, streak meters, and water level bubbles.",
    content: `package com.hydromind.app.ui.home

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hydromind.app.R
import com.hydromind.app.viewmodel.WaterViewModel

@Composable
fun HomeScreen(
    viewModel: WaterViewModel,
    onNavigateToLog: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    val todayTotal by viewModel.todayTotalFlow.collectAsState()

    val preferences = state.preferences
    val activeGoal = preferences?.activeGoal ?: 2500
    val progress = (todayTotal.toFloat() / activeGoal.toFloat()).coerceIn(0f, 1f)
    
    // Wave / Liquid Bounce Animations
    val infiniteTransition = rememberInfiniteTransition(label = "liquid_wobble")
    val liquidYOffset by infiniteTransition.animateFloat(
        initialValue = -10f,
        targetValue = 10f,
        animationSpec = infiniteRepeatable(
            animation = tween(2000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "bounce"
    )

    // Animated progress circle
    val animatedProgress by animateFloatAsState(
        targetValue = progress,
        animationSpec = tween(1500, easing = FastOutSlowInEasing),
        label = "fluid_progress"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // reachability padding - One UI style
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(28.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Hello, Hydrated!",
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.outline
                    )
                    Text(
                        text = "Today's Intake",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                }

                // Streak pill
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
                    shape = RoundedCornerShape(18.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("🔥", fontSize = 16.sp)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "\${preferences?.streakDays ?: 0} Days",
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer,
                            fontSize = 12.sp
                        )
                    }
                }
            }
        }

        // Circular Water progression Ring (One UI Design)
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .size(240.dp)
                .padding(20.dp)
        ) {
            // Draw custom progress circle and matching shadow styling with smooth canvas layers
            Canvas(modifier = Modifier.fillMaxSize()) {
                // Background Track
                drawCircle(
                    color = Color.LightGray.copy(alpha = 0.2f),
                    style = Stroke(width = 16.dp.toPx(), cap = StrokeCap.Round)
                )
                // Colorful Blue Fill
                drawArc(
                    brush = Brush.sweepGradient(
                        listOf(Color(0xFF03A9F4), Color(0xFF2196F3), Color(0xFF3F51B5), Color(0xFF03A9F4))
                    ),
                    startAngle = -90f,
                    sweepAngle = animatedProgress * 360f,
                    useCenter = false,
                    style = Stroke(width = 20.dp.toPx(), cap = StrokeCap.Round)
                )
            }

            // Stats in center of ring
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "💧",
                    fontSize = 32.sp,
                    modifier = Modifier.offset(y = liquidYOffset.dp)
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = if (preferences?.unitPreference == "fl_oz") 
                        "\${(todayTotal * 0.033814).toInt()} / \${(activeGoal * 0.033814).toInt()} oz" 
                        else "\$todayTotal / \$activeGoal ml",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "\${(progress * 100).toInt()}% Done",
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.outline
                )
            }
        }

        // Animated hydration status card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
        ) {
            Text(
                text = getMotivationalStatus(progress),
                fontWeight = FontWeight.Medium,
                textAlign = TextAlign.Center,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                fontSize = 15.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        // Quick Adds Horizontal bar (Reachability-friendly layout)
        Column(modifier = Modifier.fillMaxWidth()) {
            Text("Quick add logs:", fontSize = 13.sp, color = MaterialTheme.colorScheme.outline, modifier = Modifier.padding(bottom = 6.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                val increments = listOf(150, 250, 350, 500)
                increments.forEach { amount ->
                    OutlinedButton(
                        onClick = { viewModel.logWater(amount) },
                        shape = RoundedCornerShape(16.dp),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 10.dp)
                    ) {
                        Text("+\$amount ml", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Floating Action Button
        ExtendedFloatingActionButton(
            onClick = { viewModel.logWater(250) },
            icon = { Text("💧", fontSize = 18.sp) },
            text = { Text("Drink 250 ml", fontWeight = FontWeight.Bold) },
            containerColor = MaterialTheme.colorScheme.primary,
            contentColor = MaterialTheme.colorScheme.onPrimary,
            shape = RoundedCornerShape(28.dp),
            modifier = Modifier
                .align(Alignment.End)
                .padding(bottom = 16.dp)
        )
    }
}

fun getMotivationalStatus(progress: Float): String {
    return when {
        progress <= 0.0f -> "Let's log your first drink of the day! 💧"
        progress > 0f && progress <= 0.25f -> "Awesome start! Every sip gets you closer. 🌸"
        progress > 0.25f && progress <= 0.5f -> "Keep it up, you are doing great! 👍"
        progress > 0.5f && progress <= 0.75f -> "More than halfway! Your system is thanking you. 😊"
        progress > 0.75f && progress < 1.0f -> "Almost at the finish line! You've got this."
        else -> "Daily target unlocked! 🎉 Outstanding consistency."
    }
}`
  },
  {
    name: "LogScreen.kt (Kotlin Graphic Canvas)",
    path: "app/src/main/java/com/hydromind/app/ui/log/LogScreen.kt",
    language: "kotlin",
    description: "Renders historical stats graphs and logs. Contains custom graphics drawing routines using Jetpack Compose Canvas, illustrating week-long bar progression.",
    content: `package com.hydromind.app.ui.log

import androidx.compose.animation.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hydromind.app.data.model.WaterLog
import com.hydromind.app.viewmodel.WaterViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun LogScreen(viewModel: WaterViewModel) {
    val logs by viewModel.listLogsFlow.collectAsState()
    val state by viewModel.uiState.collectAsState()

    val timeFormatter = remember { SimpleDateFormat("hh:mm a", Locale.getDefault()) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp)
    ) {
        Spacer(modifier = Modifier.height(28.dp))
        Text(
            text = "Hydration Stats",
            style = MaterialTheme.typography.displaySmall.copy(fontWeight = FontWeight.Bold)
        )
        Text(
            text = "Track your historical performance",
            color = MaterialTheme.colorScheme.outline,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        // Custom drawn canvas bar graph (NO dependencies, lightweight)
        Text("Weekly total consistency:", fontSize = 14.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(bottom = 8.dp))
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .height(180.dp),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                contentAlignment = Alignment.BottomCenter
            ) {
                // Draws customized week graph reflecting log values inside canvas frame
                CanvasWeeklyGraph()
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Title Row logs
        Row(
            modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Logs Today", fontSize = 16.sp, fontWeight = FontWeight.Bold)
            if (logs.isNotEmpty()) {
                TextButton(onClick = { viewModel.clearLogs() }) {
                    Text("Reset All", color = MaterialTheme.colorScheme.error)
                }
            }
        }

        // List layout with sliding swipe-to-dismiss deletion
        if (logs.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Text("No entries logged today. Drink up!", color = MaterialTheme.colorScheme.outline, fontSize = 14.sp)
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(logs, key = { it.id }) { log ->
                    WaterLogItemRow(
                        log = log,
                        onDelete = { viewModel.removeLog(log) },
                        timeFormatted = timeFormatter.format(Date(log.timestamp))
                    )
                }
            }
        }
    }
}

@Composable
fun WaterLogItemRow(
    log: WaterLog,
    onDelete: () -> Unit,
    timeFormatted: String
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(text = "\${log.amountMl} ml", fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
                Text(text = timeFormatted, fontSize = 12.sp, color = MaterialTheme.colorScheme.outline)
            }

            IconButton(onClick = onDelete) {
                Icon(
                    imageVector = Icons.Default.Delete,
                    contentDescription = "Delete",
                    tint = MaterialTheme.colorScheme.error
                )
            }
        }
    }
}

@Composable
fun CanvasWeeklyGraph() {
    val barColor = MaterialTheme.colorScheme.primary
    val labelColor = MaterialTheme.colorScheme.outline
    
    // Static dummy data for standard demonstration inside view
    val values = listOf(0.4f, 0.7f, 0.95f, 0.3f, 0.8f, 0.5f, 1.0f)
    val days = listOf("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")

    Canvas(modifier = Modifier.fillMaxSize()) {
        val width = size.width
        val height = size.height
        val barCount = 7
        val spaceBetween = 24.dp.toPx()
        val barWidth = (width - (spaceBetween * (barCount - 1))) / barCount

        for (i in 0 until barCount) {
            val barHeight = values[i] * (height - 30.dp.toPx())
            val xOffset = i * (barWidth + spaceBetween)
            val yOffset = height - barHeight - 20.dp.toPx()

            // Draw rounded bar
            drawRoundRect(
                color = if (values[i] >= 1.0f) Color(0xFF4CAF50) else barColor,
                topLeft = Offset(xOffset, yOffset),
                size = Size(barWidth, barHeight),
                cornerRadius = CornerRadius(8.dp.toPx(), 8.dp.toPx())
            )
            
            // Draw baseline dashes/limits
        }
    }
}`
  },
  {
    name: "HydroWidgetProvider.kt (AppWidgetProvider)",
    path: "app/src/main/java/com/hydromind/app/widget/HydroWidgetProvider.kt",
    language: "kotlin",
    description: "Broadcast receiver listening to home screen update intents. Coordinates button presses and instantly pushes local RemoteViews updates to Samsung layout containers.",
    content: `package com.hydromind.app.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.view.View
import android.widget.RemoteViews
import com.hydromind.app.R
import com.hydromind.app.data.local.WaterDatabase
import com.hydromind.app.data.model.WaterLog
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class HydroWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == "com.hydromind.app.action.DRANK_WIDGET_QUICK") {
            // Instantly logs 250ml in background thread (Room SQLite action standard)
            val goAsync = goAsync()
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val db = WaterDatabase.getDatabase(context) // Standard singleton database fetcher
                    db.waterDao().insertLog(WaterLog(amountMl = 250))
                    
                    // Direct manager refresh push
                    val manager = AppWidgetManager.getInstance(context)
                    val ids = manager.getAppWidgetIds(ComponentName(context, HydroWidgetProvider::class.java))
                    for (id in ids) {
                        updateAppWidget(context, manager, id)
                    }
                } finally {
                    goAsync.finish()
                }
            }
        }
    }

    private fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
        val views = RemoteViews(context.packageName, R.layout.hydro_widget)

        // Action Quick add trigger broadcast Intent binding
        val intent = Intent(context, HydroWidgetProvider::class.java).apply {
            action = "com.hydromind.app.action.DRANK_WIDGET_QUICK"
        }
        val pendingIntent = PendingIntent.getBroadcast(
            context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.btn_drank_quick, pendingIntent)

        // Load metrics from sharedDB or flow safely and bind to remote layout views
        CoroutineScope(Dispatchers.IO).launch {
            val db = WaterDatabase.getDatabase(context)
            val todayStart = Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, 0)
                set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 0)
            }.timeInMillis

            val total = db.waterDao().getLogsSince(todayStart).first().sumOf { it.amountMl }
            val goal = 2500 // Sample data fallbacks

            views.setTextViewText(R.id.widget_text_progress, "\$total / \$goal ml")
            views.setProgressBar(R.id.widget_progress_bar, goal, total, false)

            // Push views layout refresh to Samsung Home Screen Manager
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}`
  },
  {
    name: "ReminderWorker.kt (WorkManager Background)",
    path: "app/src/main/java/com/hydromind/app/notification/ReminderWorker.kt",
    language: "kotlin",
    description: "Reliable Kotlin scheduler using WorkManager for triggering alerts, pushing customizable action cards, and tracking progress during Doze environments.",
    content: `package com.hydromind.app.notification

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.hydromind.app.R
import com.hydromind.app.data.local.WaterDatabase
import java.util.Calendar

class ReminderWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        val context = applicationContext
        val now = Calendar.getInstance()
        val hour = now.get(Calendar.HOUR_OF_DAY)

        // Guard: check reminder time constraints (dynamic window mapping)
        if (hour < 8 || hour > 22) {
            return Result.success()
        }

        val db = WaterDatabase.getDatabase(context)
        val todayStart = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
        }.timeInMillis

        // Stop alerting once the daily baseline calculation is met
        val todayTotal = db.waterDao().getLogsSince(todayStart).first()?.sumOf { it.amountMl } ?: 0
        if (todayTotal >= 2500) {
            return Result.success()
        }

        // Trigger Android notifications with direct quick-action buttons
        triggerAlertNotification(context, todayTotal, 2500)
        return Result.success()
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

        // Direct intent action callbacks
        val drankIntent = Intent(context, NotificationActionReceiver::class.java).apply {
            action = "com.hydromind.app.action.DRANK_NOTIF_QUICK"
        }
        val drankPending = PendingIntent.getBroadcast(
            context, 101, drankIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val builder = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(R.drawable.ic_drop) // System vector drop asset
            .setContentTitle("Time to hydrated! 💧")
            .setContentText("You've logged \$total ml of your \$goal ml daily target.")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .addAction(R.drawable.ic_check, "Drank 250 ml ✔", drankPending) // Tap to instantly log!

        manager.notify(827, builder.build())
    }
}`
  },
  {
    name: "NotificationActionReceiver.kt",
    path: "app/src/main/java/com/hydromind/app/notification/NotificationActionReceiver.kt",
    language: "kotlin",
    description: "Intercepts fast locking action clicks on background system cards. Interacts with the local Room SQL file, then cancels the alert container instantly.",
    content: `package com.hydromind.app.notification

import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.hydromind.app.data.local.WaterDatabase
import com.hydromind.app.data.model.WaterLog
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class NotificationActionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == "com.hydromind.app.action.DRANK_NOTIF_QUICK") {
            val goAsync = goAsync()
            
            // Log 250 ml background transaction pipeline
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val db = WaterDatabase.getDatabase(context)
                    db.waterDao().insertLog(WaterLog(amountMl = 250))
                    
                    // Dismiss matching notification card
                    val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                    manager.cancel(827)
                } finally {
                    goAsync.finish()
                }
            }
        }
    }
}`
  }
];
