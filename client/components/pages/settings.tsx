"use client"

import { useEffect, useState } from "react"
import { getCurrentUser, updatePreferences, loadLocalSettings, saveLocalSettings } from "@/lib/api"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"
import { SettingsSection } from "@/components/settings-section"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Palette, Bell, Mic, MapPin, Heart, Volume2, Smartphone, Save, RotateCcw } from "lucide-react"

export function Settings() {
  const [settings, setSettings] = useState({
    // Appearance
    theme: "light",
    temperatureUnit: "fahrenheit",
    windSpeedUnit: "mph",
    pressureUnit: "inHg",

    // Notifications
    weatherAlerts: true,
    dailyForecast: true,
    healthTips: true,
    pushNotifications: true,

    // Voice Assistant
    voiceEnabled: true,
    voiceVolume: [75],
    wakeWord: "Hey AtmosAI",

    // Location
    autoLocation: true,
    defaultLocation: "San Francisco, CA",

    // Health & Wellness
    healthTipsEnabled: true,
    uvReminders: true,
    airQualityAlerts: true,
    activitySuggestions: true,

    // Advanced
    backgroundAnimations: true,
    reducedMotion: false,
    dataUsage: "standard",
  })

  // Load from backend if authenticated; otherwise from localStorage
  useEffect(() => {
    const init = async () => {
      try {
        const me = await getCurrentUser()
        const prefs = me?.data?.user?.preferences
        if (prefs) {
          setSettings({
            theme: prefs.theme || "light",
            temperatureUnit: prefs.temperatureUnit || "fahrenheit",
            windSpeedUnit: prefs.windSpeedUnit || "mph",
            pressureUnit: prefs.pressureUnit || "inHg",
            weatherAlerts: prefs.notifications?.weatherAlerts ?? true,
            dailyForecast: prefs.notifications?.dailyForecast ?? true,
            healthTips: prefs.notifications?.healthTips ?? true,
            pushNotifications: prefs.notifications?.pushNotifications ?? true,
            voiceEnabled: prefs.voice?.enabled ?? true,
            voiceVolume: [prefs.voice?.volume ?? 75],
            wakeWord: prefs.voice?.wakeWord ?? "Hey AtmosAI",
            autoLocation: prefs.location?.autoDetect ?? true,
            defaultLocation: prefs.location?.defaultLocation ?? "San Francisco, CA",
            healthTipsEnabled: prefs.health?.tipsEnabled ?? true,
            uvReminders: prefs.health?.uvReminders ?? true,
            airQualityAlerts: prefs.health?.airQualityAlerts ?? true,
            activitySuggestions: prefs.health?.activitySuggestions ?? true,
            backgroundAnimations: prefs.advanced?.backgroundAnimations ?? true,
            reducedMotion: prefs.advanced?.reducedMotion ?? false,
            dataUsage: prefs.advanced?.dataUsage ?? "standard",
          })
          return
        }
      } catch {
        // not logged in or server unavailable; fall back to local storage
      }
      const local = loadLocalSettings("atmosai_settings", null as any)
      if (local) setSettings(local)
    }
    init()
  }, [])

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const resetSettings = () => {
    // Reset to default values
    setSettings({
      theme: "light",
      temperatureUnit: "fahrenheit",
      windSpeedUnit: "mph",
      pressureUnit: "inHg",
      weatherAlerts: true,
      dailyForecast: true,
      healthTips: true,
      pushNotifications: true,
      voiceEnabled: true,
      voiceVolume: [75],
      wakeWord: "Hey AtmosAI",
      autoLocation: true,
      defaultLocation: "San Francisco, CA",
      healthTipsEnabled: true,
      uvReminders: true,
      airQualityAlerts: true,
      activitySuggestions: true,
      backgroundAnimations: true,
      reducedMotion: false,
      dataUsage: "standard",
    })
  }

  const saveSettings = () => {
    // Save to backend if authenticated; else persist locally
    const payload = {
      theme: settings.theme,
      temperatureUnit: settings.temperatureUnit,
      windSpeedUnit: settings.windSpeedUnit,
      pressureUnit: settings.pressureUnit,
      notifications: {
        weatherAlerts: settings.weatherAlerts,
        dailyForecast: settings.dailyForecast,
        healthTips: settings.healthTips,
        pushNotifications: settings.pushNotifications,
      },
      voice: {
        enabled: settings.voiceEnabled,
        volume: settings.voiceVolume?.[0] ?? 75,
        wakeWord: settings.wakeWord,
      },
      location: {
        autoDetect: settings.autoLocation,
        defaultLocation: settings.defaultLocation,
      },
      health: {
        tipsEnabled: settings.healthTipsEnabled,
        uvReminders: settings.uvReminders,
        airQualityAlerts: settings.airQualityAlerts,
        activitySuggestions: settings.activitySuggestions,
      },
      advanced: {
        backgroundAnimations: settings.backgroundAnimations,
        reducedMotion: settings.reducedMotion,
        dataUsage: settings.dataUsage,
      },
    }

    updatePreferences(payload)
      .then(() => {
        // Also store locally as a cache
        saveLocalSettings("atmosai_settings", settings)
      })
      .catch(() => {
        // If not authenticated, persist locally
        saveLocalSettings("atmosai_settings", settings)
      })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-foreground mb-2"
        >
          Settings
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-lg"
        >
          Customize your AtmosAI experience
        </motion.p>
      </div>

      {/* Appearance Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="border-1 rounded-2xl p-6 glass-strong">
        <SettingsSection icon={Palette} title="Appearance" description="Customize the look and feel">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Theme</Label>
                <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
              </div>
              <ThemeToggle />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Temperature Unit</Label>
                <Select
                  value={settings.temperatureUnit}
                  onValueChange={(value) => updateSetting("temperatureUnit", value)}
                >
                  <SelectTrigger className="glass border-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                    <SelectItem value="celsius">Celsius (°C)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Wind Speed</Label>
                <Select value={settings.windSpeedUnit} onValueChange={(value) => updateSetting("windSpeedUnit", value)}>
                  <SelectTrigger className="glass border-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mph">Miles per hour</SelectItem>
                    <SelectItem value="kmh">Kilometers per hour</SelectItem>
                    <SelectItem value="ms">Meters per second</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Pressure Unit</Label>
                <Select value={settings.pressureUnit} onValueChange={(value) => updateSetting("pressureUnit", value)}>
                  <SelectTrigger className="glass border-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inHg">Inches of Mercury</SelectItem>
                    <SelectItem value="hPa">Hectopascals</SelectItem>
                    <SelectItem value="mb">Millibars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </SettingsSection>
      </motion.div>

      {/* Notifications Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="border-1 rounded-2xl p-6 glass-strong">
        <SettingsSection icon={Bell} title="Notifications" description="Manage your alert preferences">
          <div className="space-y-4">
            {[
              {
                key: "weatherAlerts",
                label: "Severe Weather Alerts",
                description: "Get notified about dangerous conditions",
              },
              { key: "dailyForecast", label: "Daily Forecast", description: "Morning weather summary" },
              { key: "healthTips", label: "Health Tips", description: "Weather-based health recommendations" },
              {
                key: "pushNotifications",
                label: "Push Notifications",
                description: "Allow notifications on this device",
              },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <Label className="text-base font-medium">{item.label}</Label>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Switch
                  checked={settings[item.key as keyof typeof settings] as boolean}
                  onCheckedChange={(checked) => updateSetting(item.key, checked)}
                />
              </div>
            ))}
          </div>
        </SettingsSection>
      </motion.div>

      {/* Voice Assistant Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="border-1 rounded-2xl p-6 glass-strong">
        <SettingsSection icon={Mic} title="Voice Assistant" description="Configure voice interactions">
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div>
                <Label className="text-base font-medium">Enable Voice Assistant</Label>
                <p className="text-sm text-muted-foreground">Use voice commands to interact with AtmosAI</p>
              </div>
              <Switch
                checked={settings.voiceEnabled}
                onCheckedChange={(checked) => updateSetting("voiceEnabled", checked)}
              />
            </div>

            {settings.voiceEnabled && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <Label>Voice Volume: {settings.voiceVolume[0]}%</Label>
                  </div>
                  <Slider
                    value={settings.voiceVolume}
                    onValueChange={(value) => updateSetting("voiceVolume", value)}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Wake Word</Label>
                  <Input
                    value={settings.wakeWord}
                    onChange={(e) => updateSetting("wakeWord", e.target.value)}
                    placeholder="Hey AtmosAI"
                    className="glass border-1"
                  />
                </div>
              </>
            )}
          </div>
        </SettingsSection>
      </motion.div>

      {/* Location Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="border-1 rounded-2xl p-6 glass-strong">
        <SettingsSection icon={MapPin} title="Location" description="Manage location preferences">
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div>
                <Label className="text-base font-medium">Auto-detect Location</Label>
                <p className="text-sm text-muted-foreground">Automatically use your current location</p>
              </div>
              <Switch
                checked={settings.autoLocation}
                onCheckedChange={(checked) => updateSetting("autoLocation", checked)}
              />
            </div>

            {!settings.autoLocation && (
              <div className="space-y-2">
                <Label>Default Location</Label>
                <Input
                  value={settings.defaultLocation}
                  onChange={(e) => updateSetting("defaultLocation", e.target.value)}
                  placeholder="Enter city, state or zip code"
                  className="glass border-1"
                />
              </div>
            )}
          </div>
        </SettingsSection>
      </motion.div>

      {/* Health & Wellness Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="border-1 rounded-2xl p-6 glass-strong">
        <SettingsSection icon={Heart} title="Health & Wellness" description="Personalize health recommendations">
          <div className="space-y-4">
            {[
              { key: "healthTipsEnabled", label: "Health Tips", description: "Receive personalized health advice" },
              { key: "uvReminders", label: "UV Protection Reminders", description: "Alerts for high UV index days" },
              {
                key: "airQualityAlerts",
                label: "Air Quality Alerts",
                description: "Notifications for poor air quality",
              },
              {
                key: "activitySuggestions",
                label: "Activity Suggestions",
                description: "Weather-based activity recommendations",
              },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <Label className="text-base font-medium">{item.label}</Label>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Switch
                  checked={settings[item.key as keyof typeof settings] as boolean}
                  onCheckedChange={(checked) => updateSetting(item.key, checked)}
                />
              </div>
            ))}
          </div>
        </SettingsSection>
      </motion.div>

      {/* Advanced Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="border-1 rounded-2xl p-6 glass-strong">
        <SettingsSection icon={Smartphone} title="Advanced" description="Advanced app preferences">
          <div className="space-y-6">
            <div className="space-y-4">
              {[
                {
                  key: "backgroundAnimations",
                  label: "Background Animations",
                  description: "Weather-reactive background effects",
                },
                { key: "reducedMotion", label: "Reduced Motion", description: "Minimize animations for accessibility" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <Label className="text-base font-medium">{item.label}</Label>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch
                    checked={settings[item.key as keyof typeof settings] as boolean}
                    onCheckedChange={(checked) => updateSetting(item.key, checked)}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Data Usage</Label>
              <Select value={settings.dataUsage} onValueChange={(value) => updateSetting("dataUsage", value)}>
                <SelectTrigger className="glass border-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal - Basic weather only</SelectItem>
                  <SelectItem value="standard">Standard - All features</SelectItem>
                  <SelectItem value="unlimited">Unlimited - High quality images</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </SettingsSection>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex gap-4 justify-center pt-8"
      >
        <Button variant="outline" onClick={resetSettings} className="glass border-1 bg-transparent">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
        <Button onClick={saveSettings}>
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </motion.div>
    </div>
  )
}
