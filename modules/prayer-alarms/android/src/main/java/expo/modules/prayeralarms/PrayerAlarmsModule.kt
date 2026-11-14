package expo.modules.prayeralarms

import android.app.AlarmManager
import android.app.UiModeManager
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class PrayerAlarmsModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw IllegalStateException("React context is not available")

  override fun definition() = ModuleDefinition {
    Name("PrayerAlarms")

    // Without this, expo-notifications falls back to inexact alarms that Android
    // defers/batches while the device is idle (Android 12+).
    Function("canScheduleExactAlarms") {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
        true
      } else {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        alarmManager.canScheduleExactAlarms()
      }
    }

    Function("openExactAlarmSettings") {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        startSettings(
          Intent(
            Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM,
            Uri.parse("package:${context.packageName}")
          )
        )
      }
    }

    Function("isIgnoringBatteryOptimizations") {
      val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
      powerManager.isIgnoringBatteryOptimizations(context.packageName)
    }

    Function("openBatteryOptimizationSettings") {
      startSettings(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS))
    }

    // Android 13+ persists a per-app night mode that the system splash screen honors,
    // so the splash matches the in-app theme choice instead of the device setting.
    Function("setAppNightMode") { mode: String ->
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        val uiModeManager = context.getSystemService(UiModeManager::class.java)
        uiModeManager.setApplicationNightMode(
          when (mode) {
            "light" -> UiModeManager.MODE_NIGHT_NO
            "dark" -> UiModeManager.MODE_NIGHT_YES
            else -> UiModeManager.MODE_NIGHT_AUTO
          }
        )
      }
    }
  }

  // Some OEM ROMs don't expose every settings screen; fall back to the app's details page.
  private fun startSettings(intent: Intent) {
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    try {
      context.startActivity(intent)
    } catch (e: ActivityNotFoundException) {
      val fallback = Intent(
        Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
        Uri.parse("package:${context.packageName}")
      ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(fallback)
    }
  }
}
