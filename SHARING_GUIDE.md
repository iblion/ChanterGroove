# ChanterGroove — Build & Share Guide

This walks through making a real, installable build of the app you can send to
friends. Two paths covered:

- **Internal preview build** — fastest, easiest. Friends install via a link.
- **Production build** — for the App Store / Play Store later.

We use Expo's [EAS Build](https://docs.expo.dev/build/introduction/) service.
The free tier is plenty for sharing with friends.

---

## 0. One-time setup (5 min)

### a) Install the EAS CLI

```bash
npm install -g eas-cli
```

Verify:

```bash
eas --version
```

### b) Make an Expo account

If you don't already have one:

```bash
eas login
```

(or sign up at <https://expo.dev/signup>, then run `eas login`).

### c) Link the project to EAS

From inside `~/ChanterGroove-main`:

```bash
eas init
```

This creates a project on the EAS dashboard and writes a `projectId` into
`app.json` automatically. Commit that change to git.

> If `eas init` says the project already exists with a different slug, accept
> the prompt to reuse it.

`eas.json` is already in this repo with `preview` and `production` profiles
configured.

---

## 1. Internal preview build (recommended for sharing with friends)

This produces installable artifacts:

- **Android:** an `.apk` file friends can sideload.
- **iOS:** an `.ipa` you can install via TestFlight or directly on registered
  devices using ad-hoc provisioning.

### Android (`.apk` for any phone)

```bash
eas build --profile preview --platform android
```

You'll see prompts the first time:

- **Generate a new Android Keystore?** → `Yes`. Let EAS manage it.
- It will queue the build on EAS servers. You can close the terminal and
  watch progress at <https://expo.dev/accounts/_your_user_/projects/chantergroove/builds>.

When the build finishes (10–25 min), you get an `.apk` URL. Send that link
or the QR code to your friends. They install with:

1. Open the link on their Android phone.
2. Allow "Install unknown apps" for the browser when prompted.
3. Tap **Install**.

### iOS (`.ipa` — needs an Apple Developer account)

iOS distribution requires either:

- **Apple Developer Program account** ($99/yr) — needed for TestFlight or
  ad-hoc installs on real devices.
- **Simulator-only build** — free, no account needed, but only runs in
  Xcode's iOS Simulator on a Mac.

**Free path: simulator build for yourself**

```bash
eas build --profile preview --platform ios
```

When it asks: **Build for an iOS simulator?** → `Yes`. After ~15 min, you
get a `.tar.gz` you extract and drag-drop onto a running iOS Simulator.

**Paid path: real iOS install**

```bash
# Same command but answer "No" to simulator
eas build --profile preview --platform ios
```

You'll be prompted for Apple credentials. EAS handles cert + provisioning
profile generation. Once built, you can:

- Use **TestFlight** (recommended): `eas submit -p ios --latest`. Friends
  install the TestFlight app, you invite them by email or share a link.
- Or distribute the `.ipa` ad-hoc by registering each friend's device UDID
  in your Apple Developer account.

---

## 2. Faster iteration: Expo Go

Before doing a full build, you can let friends play directly using the
**Expo Go** app from the App Store / Play Store:

```bash
npm start
```

Scan the QR code with the Expo Go app. Caveats:

- Friends need internet on the same network as you, OR you publish a tunnel
  (Expo Go shows a public URL).
- Expo Go's runtime won't include any native modules you add later (e.g.
  in-app purchases) — but the current ChanterGroove stack works fine in it.

This is fine for casual demos but slow over cellular. Use it for early
feedback; use the EAS preview build for "real" sharing.

---

## 3. Updating the app after build

Once you've shipped a build, you can push **OTA (over-the-air) JS updates**
without rebuilding:

```bash
eas update --branch preview --message "Fix track filter bug"
```

Friends who already have the build installed will get the update next time
they open the app — usually within a few seconds. This works for any change
that's pure JS/TS (most of what we've been doing). If you change `app.json`
config or add a native dependency, you need a fresh `eas build`.

To enable OTA on the preview profile, run once:

```bash
eas update:configure
```

It adds the `expo-updates` plugin and a `runtimeVersion` policy.

---

## 4. Production build (when you're ready)

```bash
eas build --profile production --platform all
```

Then submit to stores:

```bash
eas submit -p android --latest    # Google Play (requires Play Console account)
eas submit -p ios --latest        # App Store (requires Apple Developer)
```

`autoIncrement: true` in `eas.json` will bump the build number for you.

---

## 5. Troubleshooting

**Build fails with "Not connected to a managed Expo project"**
→ Run `eas init` first.

**Android build fails on `gradlew`**
→ Almost always a native dependency mismatch. Run:
```bash
npx expo install --fix
```
Then commit and rebuild.

**iOS build fails on credentials**
→ Run `eas credentials -p ios`, choose "Remove credentials" for the failing
build profile, and let EAS regenerate them on the next build.

**Preview build runs but Spotify doesn't work**
→ Your `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` and `EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET`
need to be set in EAS too. From this repo:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SPOTIFY_CLIENT_ID --value "your_client_id"
eas secret:create --scope project --name EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET --value "your_client_secret"
```

Then rebuild. Don't put real secrets in `.env` and commit them — only use
EAS Secrets for production.

---

## 6. Summary cheat-sheet

```bash
# Install once
npm install -g eas-cli && eas login

# First-time link (in repo)
eas init

# Build & share with friends (Android)
eas build --profile preview --platform android

# Push JS-only fix without rebuild
eas update --branch preview --message "tweak copy"

# Production
eas build --profile production --platform all
eas submit -p android --latest
eas submit -p ios --latest
```

Happy shipping. Most "I want to send my app to a friend" needs are answered by
**Step 1 → Android preview build**. Get that working first, then layer on iOS
and OTA updates as needed.
