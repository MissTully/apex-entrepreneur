import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Phone, PhoneOff, Loader2 } from "lucide-react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";

/**
 * Custom in-app voice call built on the ElevenLabs React SDK, rendered inside
 * our own reef-styled UI instead of the stock floating widget. Idle → a single
 * "Start the call" button; connected → a speaking/listening indicator plus mute
 * and end-call controls. The agent (e.g. Maren Cole) handles turn-taking and
 * runs the full coach-and-close arc.
 *
 * This module is the ONLY place that imports the (heavy, WebRTC-laden) SDK, so
 * it can be lazy-loaded — the SDK chunk is fetched only when a learner actually
 * enters a voice conversation, keeping the main bundle lean.
 */
export default function VoiceCall({
  agentId,
  characterName,
  avatarSrc,
}: {
  agentId: string;
  characterName: string;
  avatarSrc?: string;
}) {
  return (
    <ConversationProvider>
      <VoiceCallInner agentId={agentId} characterName={characterName} avatarSrc={avatarSrc} />
    </ConversationProvider>
  );
}

function VoiceCallInner({
  agentId,
  characterName,
  avatarSrc,
}: {
  agentId: string;
  characterName: string;
  avatarSrc?: string;
}) {
  const conversation = useConversation();
  const { status, isSpeaking, isMuted } = conversation;
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  // A portrait that fails to load falls back to the mic icon rather than a
  // broken-image box in the middle of a live call.
  const [portraitOk, setPortraitOk] = useState(true);

  // Always end the live session when this step goes away (Finish/close/replay).
  // The ref is written from an effect rather than during render — a live call is
  // exactly the kind of resource that must not be torn down by a render that
  // React later discards.
  const endRef = useRef(conversation.endSession);
  useEffect(() => {
    endRef.current = conversation.endSession;
  }, [conversation.endSession]);
  useEffect(() => () => endRef.current(), []);

  const connected = status === "connected";
  const connecting = starting || status === "connecting";

  async function start() {
    setError(null);
    setStarting(true);
    try {
      // Prompt for mic up front so a denial surfaces a clear message.
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({ agentId, connectionType: "webrtc" });
    } catch {
      setError("Couldn't start the call. Allow microphone access in your browser, then try again.");
    } finally {
      setStarting(false);
    }
  }

  if (!connected) {
    return (
      <div className="mt-6 flex flex-col items-center gap-3">
        <button onClick={start} disabled={connecting} className="btn-primary px-6 py-3 text-base disabled:opacity-60">
          {connecting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Phone className="h-5 w-5" />}
          {connecting ? "Connecting…" : "Start the call"}
        </button>
        {error ? (
          <p className="max-w-xs text-center text-xs text-ember">{error}</p>
        ) : (
          <p className="text-xs text-foam/40">{characterName} opens when the call connects.</p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col items-center gap-5">
      <div className="relative flex h-40 w-40 items-center justify-center">
        <span className={`absolute inset-0 rounded-full ${isSpeaking ? "animate-ping bg-glow/20" : "bg-urchin/10"}`} />
        <span className={`absolute inset-3 rounded-full ${isSpeaking ? "bg-glow/15" : "bg-white/5"}`} />
        <span
          className={`relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-deep/80 ring-2 transition ${
            isSpeaking ? "ring-glow/70" : "ring-white/10"
          }`}
        >
          {avatarSrc && portraitOk ? (
            <img
              src={avatarSrc}
              alt={characterName}
              onError={() => setPortraitOk(false)}
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <Mic className={`h-12 w-12 ${isSpeaking ? "text-glow" : "text-foam/70"}`} />
          )}
        </span>
      </div>
      <p className="text-sm font-medium text-foam/80">
        {isSpeaking ? `${characterName} is speaking…` : "Listening — your turn"}
      </p>

      <div className="flex items-center gap-3">
        <button onClick={() => conversation.setMuted(!isMuted)} className="btn-ghost px-4 py-2 text-sm">
          {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          {isMuted ? "Unmute" : "Mute"}
        </button>
        <button
          onClick={() => conversation.endSession()}
          className="inline-flex items-center gap-2 rounded-xl border border-ember/40 bg-ember/15 px-4 py-2 text-sm font-semibold text-ember transition hover:bg-ember/25"
        >
          <PhoneOff className="h-4 w-4" /> End call
        </button>
      </div>
    </div>
  );
}
