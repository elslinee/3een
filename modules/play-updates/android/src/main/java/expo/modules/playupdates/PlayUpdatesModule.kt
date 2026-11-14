package expo.modules.playupdates

import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.install.model.UpdateAvailability
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class PlayUpdatesModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("PlayUpdates")

    // Asks Google Play whether a newer version than the installed one is published.
    // Only works for installs that came from Play; sideloaded/dev builds reject.
    AsyncFunction("checkForUpdate") { promise: Promise ->
      val context = appContext.reactContext
      if (context == null) {
        promise.reject("ERR_NO_CONTEXT", "React context is not available", null)
        return@AsyncFunction
      }
      AppUpdateManagerFactory.create(context).appUpdateInfo
        .addOnSuccessListener { info ->
          promise.resolve(
            mapOf(
              "available" to (info.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE),
              "availableVersionCode" to info.availableVersionCode(),
            )
          )
        }
        .addOnFailureListener { error ->
          promise.reject("ERR_PLAY_UPDATE", error.message, error)
        }
    }
  }
}
