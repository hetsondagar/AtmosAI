"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react"
import { getVoiceAssistant, type VoiceAssistantState } from "@/lib/voice-assistant"

export function VoiceDemo() {
  const [voiceState, setVoiceState] = useState<VoiceAssistantState>({
    isListening: false,
    isProcessing: false,
    lastCommand: null,
    error: null
  })

  useEffect(() => {
    const voiceAssistant = getVoiceAssistant()
    const unsubscribe = voiceAssistant.subscribe(setVoiceState)
    
    return unsubscribe
  }, [])

  const toggleListening = () => {
    const voiceAssistant = getVoiceAssistant()
    
    if (voiceState.isListening) {
      voiceAssistant.stopListening()
    } else {
      voiceAssistant.startListening()
    }
  }

  const testCommands = [
    "Hey AtmosAI, what's the weather?",
    "Hey AtmosAI, navigate to dashboard",
    "Hey AtmosAI, navigate to planner",
    "Hey AtmosAI, navigate to alerts",
    "Hey AtmosAI, navigate to settings",
    "Hey AtmosAI, where am I?",
    "Hey AtmosAI, help"
  ]

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Voice Assistant Demo</h2>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={toggleListening}
              className={cn(
                "w-16 h-16 rounded-full",
                voiceState.isListening 
                  ? "bg-red-500 hover:bg-red-600" 
                  : "bg-green-500 hover:bg-green-600"
              )}
            >
              {voiceState.isListening ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>
            
            <div>
              <div className="font-medium">
                {voiceState.isListening ? "Listening..." : "Click to start"}
              </div>
              {voiceState.error && (
                <div className="text-red-500 text-sm">{voiceState.error}</div>
              )}
            </div>
          </div>

          {voiceState.lastCommand && (
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Last command:</div>
              <div className="font-medium">{voiceState.lastCommand}</div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="font-medium">Try these voice commands:</h3>
            <div className="grid grid-cols-1 gap-2">
              {testCommands.map((command, index) => (
                <div key={index} className="text-sm text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-900 rounded">
                  "{command}"
                </div>
              ))}
            </div>
          </div>

          <div className="text-sm text-gray-500">
            <strong>Note:</strong> Make sure your browser has microphone permissions enabled.
            The voice assistant will respond with speech and perform the requested actions.
          </div>
        </div>
      </Card>
    </div>
  )
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
