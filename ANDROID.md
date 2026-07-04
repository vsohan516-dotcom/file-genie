# Smart Files — Android build

## Requirements
- Node 20+, Bun (or npm)
- Android Studio (with SDK + NDK), JDK 17

## Build the web bundle
```bash
bun install
bun run build           # outputs to dist/
```

## Add Android platform (first time)
```bash
bunx cap add android
bunx cap sync android
```

## Open / build APK
```bash
bunx cap open android    # opens Android Studio
# Or from CLI (in android/):
./gradlew assembleDebug          # APK
./gradlew bundleRelease          # AAB
```

## Permissions to add in `android/app/src/main/AndroidManifest.xml`
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
<uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE"
                 tools:ignore="ScopedStorage" />
```
Add `xmlns:tools="http://schemas.android.com/tools"` to the `<manifest>` tag.

## Notes
- The current template uses TanStack Start. For pure Capacitor packaging you
  may want to switch the Vite config to a plain SPA build (`index.html` at
  root) before running `cap add android`.
- File browsing, categories and search rely on `@capacitor/filesystem` and
  only return real data when running on device.
