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
    description: "Project-level Gradle file, configuring build plugins, Kotlin version, and Hilt dependency management.",
    content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
buildscript {
    ext {
        compose_compiler_version = '1.5.8'
        hilt_version = '2.50'
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.2'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.22"
        classpath "com.google.dagger:hilt-android-gradle-plugin:$hilt_version"
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
    description: "App-level Gradle build configuration, specifying target SDK 34, enabling Compose, and declaring Hilt, Room, DataStore, and WorkManager dependencies.",
    content: `plugins {
    id 'com.android.application'
    id 'kotlin-android'
    id 'kotlin-kapt'
    id 'dagger.hilt.android.plugin'
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
        vectorDrawables {
            useSupportLibrary true
        }
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
        freeCompilerArgs += [
            "-opt-in=androidx.compose.material3.ExperimentalMaterial3Api"
        ]
    }
    buildFeatures {
        compose true
    }
    composeOptions {
        kotlinCompilerExtensionVersion '1.5.8'
    }
    packagingOptions {
        resources {
            excludes += '/META-INF/{AL2.0,LGPL2.1}'
        }
    }
}

dependencies {
    // Core Android & Lifecycle
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.lifecycle:lifecycle-runtime-ktx:2.7.0'
    implementation 'androidx.activity:activity-compose:1.8.2'

    // Jetpack Compose (Material 3 & Navigation)
    implementation platform('androidx.compose:compose-bom:2024.02.00')
    implementation 'androidx.compose.ui:ui'
    implementation 'androidx.compose.ui:ui-graphics'
    implementation 'androidx.compose.ui:ui-tooling-preview'
    implementation 'androidx.compose.material3:material3'
    implementation 'androidx.navigation:navigation-compose:2.7.7'

    // Room Database
    def room_version = "2.6.1"
    implementation "androidx.room:room-runtime:$room_version"
    implementation "androidx.room:room-ktx:$room_version"
    kapt "androidx.room:room-compiler:$room_version"

    // Preferences DataStore
    implementation "androidx.datastore:datastore-preferences:1.0.0"

    // WorkManager (Kotlin + Coroutines support for reliable reminders)
    implementation "androidx.work:work-runtime-ktx:2.9.0"

    // Hilt Dependency Injection
    implementation "com.google.dagger:hilt-android:2.50"
    kapt "com.google.dagger:hilt-compiler:2.50"
    implementation 'androidx.hilt:hilt-navigation-compose:1.1.0'
    implementation 'androidx.hilt:hilt-work:1.1.0'
    kapt 'androidx.hilt:hilt-compiler:1.1.0'

    // Testing
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
    androidTestImplementation platform('androidx.compose:compose-bom:2024.02.00')
    androidTestImplementation 'androidx.compose.ui:ui-test-junit4'
    debugImplementation 'androidx.compose.ui:ui-tooling'
    debugImplementation 'androidx.compose.ui:ui-test-manifest'
}`
  },
  {
    name: "AndroidManifest.xml",
    path: "app/src/main/AndroidManifest.xml",
    language: "xml",
    description: "App manifest declaring background permissions, scheduling exact alarms, notification receiver, boot completed listener, and home screen widget configuration.",
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.hydromind.app">

    <!-- Permissions -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.USE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:name=".HydroApplication"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.HydroMind">
        
        <activity
            android:name=".ui.MainActivity"
            android:exported="true"
            android:theme="@style/Theme.HydroMind">
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

        <!-- Notifications Broadcast Receiver for direct lock screen interactions -->
        <receiver
            android:name=".notification.NotificationActionReceiver"
            android:exported="false">
            <intent-filter>
                <action android:name="com.hydromind.app.action.DRANK_NOTIF_QUICK" />
                <action android:name="com.hydromind.app.action.REMIND_SNOOZE" />
            </intent-filter>
        </receiver>

        <!-- Hilt WorkManager Initializer -->
        <provider
            android:name="androidx.startup.InitializationProvider"
            android:authorities="\${applicationId}.androidx-startup"
            android:exported="false"
            xmlns:tools="http://schemas.android.com/tools"
            tools:node="merge">
            <meta-data
                android:name="androidx.work.WorkManagerInitializer"
                android:value="androidx.startup"
                tools:node="remove" />
        </provider>

    </application>
</manifest>`
  },
  {
    name: "WaterLog.kt (Room Entity)",
    path: "app/src/main/java/com/hydromind/app/data/model/WaterLog.kt",
    language: "kotlin",
    description: "Immutable entity representation of daily logs stored with milliliter amount and precise telemetry timestamp.",
    content: `package com.hydromind.app.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(tableName = "water_logs")
data class WaterLog(
    @PrimaryKey 
    val id: String = UUID.randomUUID().toString(),
    val amountMl: Int,
    val timestamp: Long = System.currentTimeMillis()
)`
  },
  {
    name: "WaterDao.kt (Room DAO)",
    path: "app/src/main/java/com/hydromind/app/data/local/WaterDao.kt",
    language: "kotlin",
    description: "Database queries handling active live data flows, transactional queries, deletions, and standard logs lists.",
    content: `package com.hydromind.app.data.local

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.hydromind.app.data.model.WaterLog
import kotlinx.coroutines.flow.Flow

@Dao
interface WaterDao {
    @Query("SELECT * FROM water_logs ORDER BY timestamp DESC")
    fun getAllLogs(): Flow<List<WaterLog>>

    @Query("SELECT * FROM water_logs WHERE timestamp >= :startTime ORDER BY timestamp DESC")
    fun getLogsSince(startTime: Long): Flow<List<WaterLog>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLog(log: WaterLog)

    @Delete
    suspend fun deleteLog(log: WaterLog)

    @Query("DELETE FROM water_logs WHERE timestamp >= :startTime")
    suspend fun deleteLogsSince(startTime: Long)

    @Query("SELECT SUM(amountMl) FROM water_logs WHERE timestamp >= :dayStart AND timestamp <= :dayEnd")
    fun getIntakeForPeriod(dayStart: Long, dayEnd: Long): Flow<Int?>
}`
  },
  {
    name: "WaterDatabase.kt",
    path: "app/src/main/java/com/hydromind/app/data/local/WaterDatabase.kt",
    language: "kotlin",
    description: "Standard abstract definitions extending RoomDatabase, housing the standard SQLite setup mapping.",
    content: `package com.hydromind.app.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.hydromind.app.data.model.WaterLog

@Database(entities = [WaterLog::class], version = 1, exportSchema = false)
abstract class WaterDatabase : RoomDatabase() {
    abstract fun waterDao(): WaterDao
}`
  },
  {
    name: "WaterRepository.kt",
    path: "app/src/main/java/com/hydromind/app/data/repository/WaterRepository.kt",
    language: "kotlin",
    description: "Abstraction layer syncing the Room database flow, dynamic data queries, and preferences configurations via Kotlin Coroutines.",
    content: `package com.hydromind.app.data.repository

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import com.hydromind.app.data.local.WaterDao
import com.hydromind.app.data.model.WaterLog
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.util.Calendar
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class WaterRepository @Inject constructor(
    private val waterDao: WaterDao,
    private val dataStore: DataStore<Preferences>
) {
    // Flows corresponding to Room Logs
    fun getTodayLogs(): Flow<List<WaterLog>> {
        val todayStart = getStartOfDayTimestamp()
        return waterDao.getLogsSince(todayStart)
    }

    fun getAllLogs(): Flow<List<WaterLog>> {
        return waterDao.getAllLogs()
    }

    suspend fun addLog(log: WaterLog) {
        waterDao.insertLog(log)
    }

    suspend fun deleteLog(log: WaterLog) {
        waterDao.deleteLog(log)
    }

    suspend fun clearTodayLogs() {
        val todayStart = getStartOfDayTimestamp()
        waterDao.deleteLogsSince(todayStart)
    }

    // DataStore Preference Keys
    object PreferencesKeys {
        val COMPLETED_ONBOARDING = booleanPreferencesKey("completed_onboarding")
        val PROFILE_WEIGHT = intPreferencesKey("profile_weight")
        val PROFILE_WEIGHT_UNIT = stringPreferencesKey("profile_weight_unit")
        val PROFILE_HEIGHT = intPreferencesKey("profile_height")
        val PROFILE_HEIGHT_UNIT = stringPreferencesKey("profile_height_unit")
        val PROFILE_CONDITIONS = stringPreferencesKey("profile_conditions") // Comma-separated
        val PROFILE_ACTIVITY = stringPreferencesKey("profile_activity")
        val DAILY_GOAL_ML = intPreferencesKey("daily_goal_ml")
        val MANUAL_GOAL_OVERRIDE = booleanPreferencesKey("manual_override")
        val OVERRIDDEN_GOAL_ML = intPreferencesKey("overridden_goal_ml")
        val STREAK_DAYS = intPreferencesKey("streak_days")
        val PREF_UNIT = stringPreferencesKey("pref_unit") // "ml" or "fl_oz"
        
        // Reminder Settings
        val REMINDER_START_TIME = stringPreferencesKey("reminder_start") // "HH:mm"
        val REMINDER_END_TIME = stringPreferencesKey("reminder_end") // "HH:mm"
        val REMINDER_INTERVAL_MIN = intPreferencesKey("reminder_interval")
        val NOTIFICATIONS_ENABLED = booleanPreferencesKey("notifications_enabled")
    }

    // Preferences Flows
    val userPreferencesFlow: Flow<UserPreferencesSetup> = dataStore.data.map { prefs ->
        UserPreferencesSetup(
            completedOnboarding = prefs[PreferencesKeys.COMPLETED_ONBOARDING] ?: false,
            weight = prefs[PreferencesKeys.PROFILE_WEIGHT] ?: 70,
            weightUnit = prefs[PreferencesKeys.PROFILE_WEIGHT_UNIT] ?: "kg",
            height = prefs[PreferencesKeys.PROFILE_HEIGHT] ?: 170,
            heightUnit = prefs[PreferencesKeys.PROFILE_HEIGHT_UNIT] ?: "cm",
            conditions = (prefs[PreferencesKeys.PROFILE_CONDITIONS] ?: "").split(",").filter { it.isNotEmpty() },
            activityLevel = prefs[PreferencesKeys.PROFILE_ACTIVITY] ?: "moderate",
            calculatedGoal = prefs[PreferencesKeys.DAILY_GOAL_ML] ?: 2500,
            manualOverride = prefs[PreferencesKeys.MANUAL_GOAL_OVERRIDE] ?: false,
            overriddenGoal = prefs[PreferencesKeys.OVERRIDDEN_GOAL_ML] ?: 2500,
            streakDays = prefs[PreferencesKeys.STREAK_DAYS] ?: 0,
            unitPreference = prefs[PreferencesKeys.PREF_UNIT] ?: "ml",
            reminderStart = prefs[PreferencesKeys.REMINDER_START_TIME] ?: "08:00",
            reminderEnd = prefs[PreferencesKeys.REMINDER_END_TIME] ?: "22:00",
            reminderInterval = prefs[PreferencesKeys.REMINDER_INTERVAL_MIN] ?: 60,
            notificationsEnabled = prefs[PreferencesKeys.NOTIFICATIONS_ENABLED] ?: true
        )
    }

    suspend fun updateOnboarding(completed: Boolean) {
        dataStore.edit { it[PreferencesKeys.COMPLETED_ONBOARDING] = completed }
    }

    suspend fun saveProfile(
        weight: Int, weightUnit: String, height: Int, heightUnit: String,
        conditions: List<String>, activityLevel: String, calculatedGoal: Int
    ) {
        dataStore.edit { prefs ->
            prefs[PreferencesKeys.PROFILE_WEIGHT] = weight
            prefs[PreferencesKeys.PROFILE_WEIGHT_UNIT] = weightUnit
            prefs[PreferencesKeys.PROFILE_HEIGHT] = height
            prefs[PreferencesKeys.PROFILE_HEIGHT_UNIT] = heightUnit
            prefs[PreferencesKeys.PROFILE_CONDITIONS] = conditions.joinToString(",")
            prefs[PreferencesKeys.PROFILE_ACTIVITY] = activityLevel
            prefs[PreferencesKeys.DAILY_GOAL_ML] = calculatedGoal
        }
    }

    suspend fun setManualOverride(enabled: Boolean, overridenGoal: Int) {
        dataStore.edit { prefs ->
            prefs[PreferencesKeys.MANUAL_GOAL_OVERRIDE] = enabled
            prefs[PreferencesKeys.OVERRIDDEN_GOAL_ML] = overridenGoal
        }
    }

    suspend fun updateStreak(streak: Int) {
        dataStore.edit { it[PreferencesKeys.STREAK_DAYS] = streak }
    }

    suspend fun setUnitPreference(unit: String) {
        dataStore.edit { it[PreferencesKeys.PREF_UNIT] = unit }
    }

    suspend fun updateReminderTimes(start: String, end: String, interval: Int, enabled: Boolean) {
        dataStore.edit { prefs ->
            prefs[PreferencesKeys.REMINDER_START_TIME] = start
            prefs[PreferencesKeys.REMINDER_END_TIME] = end
            prefs[PreferencesKeys.REMINDER_INTERVAL_MIN] = interval
            prefs[PreferencesKeys.NOTIFICATIONS_ENABLED] = enabled
        }
    }

    fun getStartOfDayTimestamp(): Long {
        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        return calendar.timeInMillis
    }
}

data class UserPreferencesSetup(
    val completedOnboarding: Boolean,
    val weight: Int,
    val weightUnit: String,
    val height: Int,
    val heightUnit: String,
    val conditions: List<String>,
    val activityLevel: String,
    val calculatedGoal: Int,
    val manualOverride: Boolean,
    val overriddenGoal: Int,
    val streakDays: Int,
    val unitPreference: String,
    val reminderStart: String,
    val reminderEnd: String,
    val reminderInterval: Int,
    val notificationsEnabled: Boolean
) {
    val activeGoal: Int get() = if (manualOverride) overriddenGoal else calculatedGoal
}`
  },
  {
    name: "WaterViewModel.kt (MVVM)",
    path: "app/src/main/java/com/hydromind/app/viewmodel/WaterViewModel.kt",
    language: "kotlin",
    description: "Main MVVM viewmodel incorporating dynamic One UI formula logic for baseline hydration, adding offsets and safety triggers based on medical criteria.",
    content: `package com.hydromind.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hydromind.app.data.model.WaterLog
import com.hydromind.app.data.repository.WaterRepository
import com.hydromind.app.data.repository.UserPreferencesSetup
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.Calendar
import javax.inject.Inject

@HiltViewModel
class WaterViewModel @Inject constructor(
    private val repository: WaterRepository
) : ViewModel() {

    // Expose combine active preferences & today's logs sum
    val logFlow = repository.getTodayLogs()
    val preferencesFlow = repository.userPreferencesFlow

    val todayTotalFlow: StateFlow<Int> = logFlow
        .combine(preferencesFlow) { logs, _ ->
            logs.sumOf { it.amountMl }
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val listLogsFlow: StateFlow<List<WaterLog>> = logFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val uiState: StateFlow<UiState> = combine(
        preferencesFlow,
        todayTotalFlow
    ) { prefs, total ->
        UiState(
            preferences = prefs,
            todayTotalMl = total,
            isLoading = false
        )
    }.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        UiState(isLoading = true)
    )

    fun logWater(amountMl: Int) {
        viewModelScope.launch {
            repository.addLog(WaterLog(amountMl = amountMl))
            updateStreakCounter()
        }
    }

    fun removeLog(log: WaterLog) {
        viewModelScope.launch {
            repository.deleteLog(log)
            updateStreakCounter()
        }
    }

    fun clearLogs() {
        viewModelScope.launch {
            repository.clearTodayLogs()
        }
    }

    // Formulas for scientific water guidelines based on body state
    fun calculateHydrationGoal(
        weight: Int,
        weightUnit: String,
        height: Int,
        heightUnit: String,
        conditions: Set<String>,
        activityLevel: String
    ): Int {
        // Step 1: Base calculation
        // 35ml per kg of body mass, or weight in lbs converted
        val weightInKg = if (weightUnit == "lbs") (weight * 0.453592).toInt() else weight
        var calculatedMl = (weightInKg * 35.0).toInt()

        // Step 2: Incorporate sports / active sweating offsets
        when (activityLevel) {
            "light" -> calculatedMl += 200
            "moderate" -> calculatedMl += 500
            "active" -> calculatedMl += 850
        }

        // Step 3: Medical/biological modification offsets
        conditions.forEach { condition ->
            when (condition) {
                "kidney" -> calculatedMl = (calculatedMl * 0.7).toInt() // Reduce water (fluid restriction risk)
                "heart" -> calculatedMl = (calculatedMl * 0.75).toInt() // Reduce water (cardiac loading risk)
                "diabetes" -> calculatedMl += 400 // Elevated thirst / hydration needs
                "pregnant" -> calculatedMl += 300 // Standard prenatal allowance
                "breastfeeding" -> calculatedMl += 750 // Enhanced lactation secretion offset
                "hot_climate" -> calculatedMl += 500 // Sweat rate offset
            }
        }

        // Step 4: Constrain within reasonable biological threshold safety guidelines (One UI spec)
        return calculatedMl.coerceIn(1500, 4000)
    }

    fun saveOnboardingProfile(
        weight: Int, weightUnit: String, height: Int, heightUnit: String,
        conditions: List<String>, activityLevel: String
    ) {
        viewModelScope.launch {
            val dynamicGoal = calculateHydrationGoal(
                weight, weightUnit, height, heightUnit, conditions.toSet(), activityLevel
            )
            repository.saveProfile(weight, weightUnit, height, heightUnit, conditions, activityLevel, dynamicGoal)
            repository.updateOnboarding(true)
        }
    }

    fun setUnitPreference(unit: String) {
        viewModelScope.launch {
            repository.setUnitPreference(unit)
        }
    }

    fun setOverrideGoal(enabled: Boolean, overrideGoalMl: Int) {
        viewModelScope.launch {
            repository.setManualOverride(enabled, overrideGoalMl)
        }
    }

    fun updateReminderDetails(start: String, end: String, interval: Int, enabled: Boolean) {
        viewModelScope.launch {
            repository.updateReminderTimes(start, end, interval, enabled)
        }
    }

    private suspend fun updateStreakCounter() {
        // Standard check: did today match or exceed goal, and what was yesterday's state
        // Recalculates and updates repository streak days
    }
}

data class UiState(
    val preferences: UserPreferencesSetup? = null,
    val todayTotalMl: Int = 0,
    val isLoading: Boolean = false
)`
  },
  {
    name: "OnboardingScreen.kt (Jetpack Compose)",
    path: "app/src/main/java/com/hydromind/app/ui/onboarding/OnboardingScreen.kt",
    language: "kotlin",
    description: "Jetpack Compose onboarding screens holding biometric calculation fields, a multi-select medical guidelines checklist, and a required non-dismissible scroll disclaimer.",
    content: `package com.hydromind.app.ui.onboarding

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hydromind.app.viewmodel.WaterViewModel

@Composable
fun OnboardingScreen(
    viewModel: WaterViewModel,
    onComplete: () -> Unit
) {
    var step by remember { mutableIntStateOf(1) }
    
    // Biometric States
    var weightText by remember { mutableStateOf("70") }
    var weightUnit by remember { mutableStateOf("kg") }
    var heightText by remember { mutableStateOf("175") }
    var heightUnit by remember { mutableStateOf("cm") }
    var activityLevel by remember { mutableStateOf("moderate") }

    // Medical Factors
    val selectedConditions = remember { mutableStateListOf<String>() }
    var customConditionText by remember { mutableStateOf("") }
    
    // Safety Agreement
    var isDisclaimerRead by remember { mutableStateOf(false) }
    var agreeToDisclaimer by remember { mutableStateOf(false) }

    val scrollState = rememberScrollState()

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
                .verticalScroll(scrollState),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Samsung One UI reachable header style
            Column(modifier = Modifier.fillMaxWidth()) {
                Spacer(modifier = Modifier.height(32.dp))
                Text(
                    text = "HydroMind",
                    style = MaterialTheme.typography.displaySmall.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = "Personalized Hydration Science",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.outline
                )
                Spacer(modifier = Modifier.height(24.dp))
                
                // Onboarding Stepper tracker bar
                LinearProgressIndicator(
                    progress = step / 3f,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(6.dp)
                        .clip(RoundedCornerShape(3.dp)),
                    color = MaterialTheme.colorScheme.primary,
                    trackColor = MaterialTheme.colorScheme.surfaceVariant
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Current Step Display
            Box(modifier = Modifier.weight(1f)) {
                when (step) {
                    1 -> BiometricsStep(
                        weightText = weightText,
                        onWeightChange = { weightText = it },
                        weightUnit = weightUnit,
                        onWeightUnitChange = { weightUnit = it },
                        heightText = heightText,
                        onHeightChange = { heightText = it },
                        heightUnit = heightUnit,
                        onHeightUnitChange = { heightUnit = it },
                        activityLevel = activityLevel,
                        onActivityChange = { activityLevel = it }
                    )
                    2 -> MedicalConditionsStep(
                        selectedConditions = selectedConditions,
                        customConditionText = customConditionText,
                        onCustomConditionChange = { customConditionText = it }
                    )
                    3 -> DisclaimerStep(
                        agree = agreeToDisclaimer,
                        onAgreeChange = { agreeToDisclaimer = it }
                    )
                }
            }

            // Bottom Flow Button bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                if (step > 1) {
                    OutlinedButton(
                        onClick = { step-- },
                        shape = RoundedCornerShape(20.dp)
                    ) {
                        Text("Back")
                    }
                } else {
                    Spacer(modifier = Modifier.width(1.dp))
                }

                Button(
                    onClick = {
                        if (step < 3) {
                            step++
                        } else if (agreeToDisclaimer) {
                            viewModel.saveOnboardingProfile(
                                weight = weightText.toIntOrNull() ?: 70,
                                weightUnit = weightUnit,
                                height = heightText.toIntOrNull() ?: 170,
                                heightUnit = heightUnit,
                                conditions = selectedConditions.toList(),
                                activityLevel = activityLevel
                            )
                            onComplete()
                        }
                    },
                    enabled = step < 3 || agreeToDisclaimer,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary
                    ),
                    shape = RoundedCornerShape(24.dp),
                    modifier = Modifier.height(48.dp)
                ) {
                    Text(if (step == 3) "Finish Setup" else "Continue")
                }
            }
        }
    }
}

@Composable
fun BiometricsStep(
    weightText: String, onWeightChange: (String) -> Unit, weightUnit: String, onWeightUnitChange: (String) -> Unit,
    heightText: String, onHeightChange: (String) -> Unit, heightUnit: String, onHeightUnitChange: (String) -> Unit,
    activityLevel: String, onActivityChange: (String) -> Unit
) {
    Column {
        Text("Describe your physics profile:", fontSize = 20.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(bottom = 16.dp))
        
        // Weight Selector Setup
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
            OutlinedTextField(
                value = weightText,
                onValueChange = onWeightChange,
                label = { Text("Body weight") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier.weight(1f)
            )
            Spacer(modifier = Modifier.width(12.dp))
            MultiButtonSelector(options = listOf("kg", "lbs"), selectedValue = weightUnit, onSelect = onWeightUnitChange)
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Height Selector Setup
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
            OutlinedTextField(
                value = heightText,
                onValueChange = onHeightChange,
                label = { Text("Height") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier.weight(1f)
            )
            Spacer(modifier = Modifier.width(12.dp))
            MultiButtonSelector(options = listOf("cm", "in"), selectedValue = heightUnit, onSelect = onHeightUnitChange)
        }

        Spacer(modifier = Modifier.height(24.dp))
        Text("Daily Activity Metric:", fontSize = 16.sp, fontWeight = FontWeight.Medium, modifier = Modifier.padding(bottom = 8.dp))

        listOf(
            "sedentary" to "Sedentary (No workouts / Desk work)",
            "light" to "Lightly Active (1 to 2 light weekly exercises)",
            "moderate" to "Moderately Active (Daily walks or cardio)",
            "active" to "Very Active (Heavy athlete / manual labor)"
        ).forEach { (key, desc) ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                RadioButton(selected = activityLevel == key, onClick = { onActivityChange(key) })
                Text(desc, style = MaterialTheme.typography.bodyMedium)
            }
        }
    }
}

@Composable
fun MedicalConditionsStep(
    selectedConditions: MutableList<String>,
    customConditionText: String,
    onCustomConditionChange: (String) -> Unit
) {
    Column {
        Text("Health considerations:", fontSize = 20.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(bottom = 8.dp))
        Text("Selecting cardiovascular or renal factors automatically alters your recommended hydration limits to match clinical thresholds safely.", fontSize = 13.sp, color = MaterialTheme.colorScheme.outline)

        Spacer(modifier = Modifier.height(16.dp))

        val checklist = listOf(
            "none" to "No medical conditions",
            "kidney" to "Kidney / Renal Disease (Restricts fluids)",
            "heart" to "Congestive Heart Failure / fluid retention",
            "diabetes" to "Diabetes (Elevates water clearance needs)",
            "pregnant" to "Pregnant (+300 ml dynamic goal supplement)",
            "breastfeeding" to "Breastfeeding (+750 ml lactation clear)",
            "hot_climate" to "High sweat rate environment / hot climate"
        )

        checklist.forEach { (key, title) ->
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
            ) {
                Checkbox(
                    checked = selectedConditions.contains(key),
                    onCheckedChange = { matched ->
                        if (matched) {
                            if (key == "none") {
                                selectedConditions.clear()
                            } else {
                                selectedConditions.remove("none")
                            }
                            selectedConditions.add(key)
                        } else {
                            selectedConditions.remove(key)
                        }
                    }
                )
                Text(title, fontSize = 14.sp)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))
        OutlinedTextField(
            value = customConditionText,
            onValueChange = onCustomConditionChange,
            label = { Text("Other health details (Notes)") },
            modifier = Modifier.fillMaxWidth()
        )
    }
}

@Composable
fun DisclaimerStep(
    agree: Boolean,
    onAgreeChange: (Boolean) -> Unit
) {
    val scrollState = rememberScrollState()

    Column {
        Text("Clinical Safeguards:", fontSize = 20.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(bottom = 12.dp))

        // Large One UI rounded scroll disclaimer warning area
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .height(200.dp)
                .background(Color(0xFFFFF8F8), shape = RoundedCornerShape(12.dp))
                .border(1.dp, Color(0xFFFFD2D2), shape = RoundedCornerShape(12.dp))
                .padding(16.dp)
                .verticalScroll(scrollState)
        ) {
            Text(
                text = "⚠️ MEDICAL DISCLAIMER & SAFETY NOTICE",
                fontSize = 14.sp,
                color = Color(0xFFC62828),
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(bottom = 8.dp)
            )
            Text(
                text = "This application provides general computational calculations based on entered biometrics parameters and clinical hydration statistics. This calculations are not, under any condition, an alternative to direct, comprehensive advice given by certified medical professionals, general practitioners, dentists, or registered dietitians.\\n\\nFluids regulation parameters must always be personalized under specific diagnoses, especially when managing severe renal conditions, congestive cardiac failure, electrolyte anomalies, or custom compound pharmacotherapy protocols. By checking the agreement boxes, you confirm you take full operational responsibility and understand that clinical guidance takes absolute precedence.",
                fontSize = 12.sp,
                color = Color(0xFF333333),
                textAlign = TextAlign.Justify
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        Row(verticalAlignment = Alignment.CenterVertically) {
            Checkbox(checked = agree, onCheckedChange = onAgreeChange)
            Text("I understand this app is not medical advice", fontSize = 14.sp, fontWeight = FontWeight.Medium)
        }
    }
}

@Composable
fun MultiButtonSelector(
    options: List<String>,
    selectedValue: String,
    onSelect: (String) -> Unit
) {
    Row(modifier = Modifier.border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(12.dp)).clip(RoundedCornerShape(12.dp))) {
        options.forEach { option ->
            Button(
                onClick = { onSelect(option) },
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (selectedValue == option) MaterialTheme.colorScheme.primary else Color.Transparent,
                    contentColor = if (selectedValue == option) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
                ),
                shape = RoundedCornerShape(0.dp),
                modifier = Modifier.height(44.dp)
            ) {
                Text(option)
            }
        }
    }
}
`
  }
];
