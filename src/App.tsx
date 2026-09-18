import { FormEvent, useEffect, useRef, useState } from 'react'
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckCheck,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Cloud,
  Flag,
  FolderKanban,
  Github,
  GitBranch,
  LogIn,
  LogOut,
  Mail,
  LayoutDashboard,
  ListChecks,
  Mic,
  Menu,
  MessageSquare,
  Pencil,
  Pause,
  Play,
  MoreVertical,
  MoreHorizontal,
  Network,
  Plus,
  ReceiptText,
  Paperclip,
  Phone,
  RefreshCw,
  Search,
  ServerCog,
  ShieldCheck,
  Smile,
  Send,
  Settings2,
  Tag,
  Trash2,
  Users,
  Video,
  WalletCards,
  X,
} from 'lucide-react'
import { supabase } from './lib/supabase'

const navItems = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Delivery', icon: ListChecks, count: '3' },
  { label: 'Projects', icon: FolderKanban, count: '6' },
  { label: 'Clients', icon: Users },
  { label: 'Infrastructure', icon: Network },
  { label: 'Finance', icon: CircleDollarSign },
]

const utilityItems = [
  { label: 'Calendar', icon: CalendarDays },
  { label: 'Documents', icon: ReceiptText },
  { label: 'Credentials', icon: ShieldCheck },
  { label: 'Integrations', icon: Github },
  { label: 'Messages', icon: MessageSquare },
]

const fallbackProjects = [
  { name: 'Northstar Office Network', client: 'Northstar Legal', type: 'Infrastructure', color: '#2d6257', progress: 74, status: 'On track', due: 'Due Oct 18', initials: 'NL' },
  { name: 'Lumen brand refresh', client: 'Lumen & Co.', type: 'Brand system', color: '#b46d45', progress: 42, status: 'Review needed', due: 'Due Oct 24', initials: 'LC' },
  { name: 'Pine & Pixel website', client: 'Pine & Pixel', type: 'Web build', color: '#586c9b', progress: 89, status: 'On track', due: 'Due Nov 02', initials: 'PP' },
]

const fallbackActivity = [
  { title: 'Invoice #1048 paid', detail: 'Northstar Legal · UGX 5,328,000', time: '12 min ago', icon: WalletCards, tone: 'green' },
  { title: 'Review requested', detail: 'Lumen brand refresh · Homepage', time: '1 hr ago', icon: GitBranch, tone: 'orange' },
  { title: 'Credential rotated', detail: 'Pine & Pixel · Supabase', time: 'Yesterday', icon: ShieldCheck, tone: 'blue' },
]

type Project = (typeof fallbackProjects)[number] & { id?: string; due_date?: string | null }
type ActivityEvent = (typeof fallbackActivity)[number] & { id?: string; created_at?: string }
type AgendaItem = { id: string; title: string; client_name: string; meeting_type: string; starts_at: string; accent: string }
type Invoice = { id: string; invoice_number: string; client_name: string; amount: number; currency: 'UGX'; status: 'pending' | 'paid' | 'overdue' }
type TimeEntry = { id: string; project_name: string; minutes: number; entry_date: string }
type Expense = { id: string; description: string; category: string; amount: number; currency: 'UGX'; incurred_on: string }
type Quote = { id: string; quote_number: string; title: string; amount: number; currency: 'UGX'; status: string; valid_until: string | null; client_id: string | null }
type PaymentReceipt = { id: string; receipt_number: string; amount: number; currency: 'UGX'; paid_at: string; client_id: string | null }
type Client = { id: string; name: string; contact_name: string; email: string; status: string; project_count: number; accent: string }
type InfrastructureAsset = { id: string; name: string; asset_type: string; provider: string; status: string; region: string; last_checked_at: string }
type Document = { id: string; name: string; document_type: string; owner_name: string; size_label: string; updated_at: string }
type Credential = { id: string; name: string; service: string; owner_name: string; status: string; rotated_at: string | null; secret_ref?: string | null }
type Milestone = { id: string; project_id: string; title: string; status: string; progress: number; due_date: string | null }
type Task = { id: string; project_id: string | null; title: string; status: string; priority: string; assigned_to: string | null; due_date: string | null }
type Review = { id: string; project_id: string; title: string; status: string; feedback: string | null; requested_at: string }
type GithubConnection = { id: string; account_name: string; status: string; repository_count: number; last_synced_at: string | null }
type GithubRepository = { id: string; connection_id: string; name: string; url: string; default_branch: string; last_synced_at: string | null }
type SupabaseAccount = { id: string; name: string; project_ref: string; project_url: string; status: string; last_checked_at: string | null }
type MonitoringCheck = { id: string; supabase_account_id: string; check_type: string; status: string; latency_ms: number | null; last_checked_at: string }
type NetworkDiagram = { id: string; client_id: string | null; project_id: string | null; name: string; description: string | null; diagram_json: { nodes?: Array<{ id: string; label: string; kind?: string; x?: number; y?: number }>; links?: Array<{ from: string; to: string; label?: string }> }; is_published: boolean; updated_at: string }
type InfrastructureSecret = { id: string; label: string; network_name: string | null; secret_ref: string; secret_type: string; status: string }
type ChatThread = { id: string; access_token: string; visitor_name: string | null; visitor_email: string | null; agent_id?: string | null; agent_name?: string | null; chat_agents?: { name: string } | null; status: string; created_at: string; last_message_at: string }
type ChatMessage = { id: string; thread_id: string; sender_type: 'visitor' | 'owner'; sender_name: string; body: string; media_url?: string | null; media_type?: string | null; media_name?: string | null; edited_at?: string | null; deleted_at?: string | null; tags?: string[]; created_at: string }
type ReplyTarget = Pick<ChatMessage, 'id' | 'sender_name' | 'body' | 'media_name'>
type ChatAgent = { id: string; name: string; role: string }

const activityIcons = { wallet: WalletCards, review: GitBranch, shield: ShieldCheck, activity: Activity }
const FlagIcon = Flag
const RefreshIcon = RefreshCw
const PIN_LENGTH = 4
const MAX_PIN_ATTEMPTS = 5
const LOCKOUT_MS = 60_000
const DEFAULT_PROFILE_NAME = 'Alex Morgan'

const formatDueDate = (date: string | null) => date ? `Due ${new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', { month: 'short', day: '2-digit' })}` : 'No due date'
const formatTime = (date: string) => new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
const formatCurrency = (amount: number) => `UGX ${new Intl.NumberFormat('en-UG', { maximumFractionDigits: 0 }).format(amount)}`

function VoiceNotePlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  const toggle = async () => {
    if (!audioRef.current) return
    if (playing) audioRef.current.pause()
    else await audioRef.current.play()
    setPlaying(!playing)
  }

  const formatDuration = (seconds: number) => {
    if (!Number.isFinite(seconds)) return '0:00'
    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
  }

  return <div className="voice-note-player"><audio ref={audioRef} src={src} preload="metadata" onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onTimeUpdate={(event) => setProgress(event.currentTarget.currentTime)} onEnded={() => { setPlaying(false); setProgress(0) }} /><button type="button" className="voice-note-play" onClick={() => void toggle()} aria-label={playing ? 'Pause voice note' : 'Play voice note'}>{playing ? <Pause size={16} /> : <Play size={16} />}</button><div className="voice-note-track" role="progressbar" aria-valuenow={progress} aria-valuemax={duration} onClick={(event) => { if (!audioRef.current || !duration) return; const bounds = event.currentTarget.getBoundingClientRect(); audioRef.current.currentTime = ((event.clientX - bounds.left) / bounds.width) * duration }}><span style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }} /><i>{Array.from({ length: 24 }, (_, index) => <b key={index} style={{ height: `${8 + ((index * 17) % 13)}px` }} />)}</i></div><time>{formatDuration(progress || duration)}</time></div>
}

function PublicChatPage() {
  const [accessToken, setAccessToken] = useState(() => new URLSearchParams(window.location.search).get('chat') || window.localStorage.getItem('tennahub-chat-token') || '')
  const [selectedAgentId, setSelectedAgentId] = useState(() => window.localStorage.getItem('tennahub-chat-agent-id') ?? '')
  const [selectedAgentName, setSelectedAgentName] = useState(() => window.localStorage.getItem('tennahub-chat-agent-name') ?? '')
  const [agents, setAgents] = useState<ChatAgent[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [visitorName, setVisitorName] = useState(() => window.localStorage.getItem('ummahlink-chat-visitor-name') ?? '')
  const [visitorEmail, setVisitorEmail] = useState(() => window.localStorage.getItem('ummahlink-chat-visitor-email') ?? '')
  const [body, setBody] = useState('')
  const [message, setMessage] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [recording, setRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null)
  const replySwipeStart = useRef<number | null>(null)

  useEffect(() => {
    const emojiButton = document.querySelector('.relay-composer button[aria-label="Add an emoji"]')
    if (!emojiButton) return
    const addEmoji = () => setBody((current) => `${current}${current ? ' ' : ''}🙂`)
    emojiButton.addEventListener('click', addEmoji)
    return () => emojiButton.removeEventListener('click', addEmoji)
  }, [accessToken])

  useEffect(() => {
    if (!accessToken) return
    window.localStorage.setItem('tennahub-chat-token', accessToken)
    if (visitorName.trim()) window.localStorage.setItem('ummahlink-chat-visitor-name', visitorName.trim())
    if (visitorEmail.trim()) window.localStorage.setItem('ummahlink-chat-visitor-email', visitorEmail.trim())
  }, [accessToken, visitorName, visitorEmail])

  useEffect(() => {
    document.querySelectorAll<HTMLImageElement>('.relay-mark img, .relay-setup-brand img').forEach((image) => {
      image.src = '/assets/ummahlink-logo.svg'
      image.alt = 'Ummahlink'
    })
    document.querySelectorAll<HTMLElement>('.relay-context .overline').forEach((label) => { label.textContent = 'Ummahlink' })
  }, [accessToken])

  useEffect(() => {
    const bubbles = Array.from(document.querySelectorAll<HTMLElement>('.relay-bubble'))
    const starts = new WeakMap<HTMLElement, number>()
    const cleanups = bubbles.map((bubble, index) => {
      const down = (event: PointerEvent) => starts.set(bubble, event.clientX)
      const up = (event: PointerEvent) => {
        const start = starts.get(bubble)
        if (start !== undefined && Math.abs(event.clientX - start) > 55) {
          const item = messages[index]
          if (item) { setReplyTarget({ id: item.id, sender_name: item.sender_name, body: item.body, media_name: item.media_name }); setBody((current) => current || `↪ ${item.sender_name}: ${item.body || item.media_name || 'Media'}\n`) }
        }
        starts.delete(bubble)
      }
      bubble.addEventListener('pointerdown', down)
      bubble.addEventListener('pointerup', up)
      return () => { bubble.removeEventListener('pointerdown', down); bubble.removeEventListener('pointerup', up) }
    })
    return () => cleanups.forEach((cleanup) => cleanup())
  }, [messages])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const { data: agentData, error: agentError } = await supabase.rpc('public_chat_agents')
      if (agentError) { setMessage(agentError.message); return }
      if (mounted) setAgents((agentData ?? []) as ChatAgent[])
      if (!accessToken) return
      const { data: context } = await supabase.rpc('public_chat_context', { access_token_input: accessToken })
      if (context?.agent_id && mounted) {
        setSelectedAgentId(context.agent_id)
        setSelectedAgentName(context.agent_name || '')
        window.localStorage.setItem('tennahub-chat-agent-id', context.agent_id)
        window.localStorage.setItem('tennahub-chat-agent-name', context.agent_name || '')
      }
      const { data, error } = await supabase.rpc('public_chat_history', { access_token_input: accessToken })
      if (!error && mounted) setMessages((data ?? []) as ChatMessage[])
    }
    void load()
    return () => { mounted = false }
  }, [accessToken])

  const beginChat = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!visitorName.trim() || !selectedAgentId) return
    const { data, error } = await supabase.rpc('create_public_chat_thread', { visitor_name_input: visitorName.trim(), visitor_email_input: visitorEmail.trim() || null, agent_id_input: selectedAgentId })
    if (error) { setMessage(error.message); return }
    const agent = agents.find((item) => item.id === selectedAgentId)
    window.localStorage.setItem('tennahub-chat-token', data.access_token)
    window.localStorage.setItem('tennahub-chat-agent-id', selectedAgentId)
    window.localStorage.setItem('tennahub-chat-agent-name', agent?.name || '')
    window.localStorage.setItem('ummahlink-chat-visitor-name', visitorName.trim())
    window.localStorage.setItem('ummahlink-chat-visitor-email', visitorEmail.trim())
    window.history.replaceState({}, '', `/chat?chat=${encodeURIComponent(data.access_token)}`)
    setSelectedAgentName(agent?.name || '')
    setAccessToken(data.access_token)
  }

  useEffect(() => {
    if (!accessToken) return
    const channel = supabase.channel(`public-chat:${accessToken}`)
      .on('broadcast', { event: 'message' }, ({ payload }) => setMessages((current) => current.some((item) => item.id === payload.id) ? current : [...current, payload as ChatMessage]))
      .on('broadcast', { event: 'message-update' }, ({ payload }) => setMessages((current) => current.map((item) => item.id === payload.id ? payload as ChatMessage : item)))
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [accessToken])

  useEffect(() => {
    const button = document.querySelector<HTMLButtonElement>('.relay-actions button[aria-label="Conversation options"]')
    const actions = button?.parentElement
    if (!button || !actions) return
    const menu = document.createElement('div')
    menu.className = 'relay-menu'
    menu.innerHTML = '<button type="button" data-action="copy"><span>↗</span> Copy conversation link</button><button type="button" data-action="refresh"><span>↻</span> Refresh messages</button>'
    const toggleMenu = () => { menu.classList.toggle('is-open'); button.setAttribute('aria-expanded', String(menu.classList.contains('is-open'))) }
    const handleMenuClick = async (event: Event) => {
      const target = event.target as HTMLElement
      const action = target.closest<HTMLButtonElement>('button')?.dataset.action
      if (action === 'copy') { await navigator.clipboard?.writeText(window.location.href); menu.classList.remove('is-open'); button.setAttribute('aria-expanded', 'false') }
      if (action === 'refresh') window.location.reload()
    }
    button.addEventListener('click', toggleMenu)
    menu.addEventListener('click', handleMenuClick)
    actions.appendChild(menu)
    return () => { button.removeEventListener('click', toggleMenu); menu.removeEventListener('click', handleMenuClick); menu.remove() }
  }, [accessToken])

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedBody = body.trim()
    if ((!trimmedBody && !mediaFile) || !visitorName.trim() || !accessToken) return
    let mediaUrl = ''
    if (mediaFile) {
      const path = `${accessToken}/${crypto.randomUUID()}-${mediaFile.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`
      const upload = await supabase.storage.from('chat-media').upload(path, mediaFile, { contentType: mediaFile.type, upsert: false })
      if (upload.error) { setMessage(upload.error.message); return }
      mediaUrl = supabase.storage.from('chat-media').getPublicUrl(path).data.publicUrl
    }
    const { data, error } = await supabase.rpc('send_public_chat_message', { access_token_input: accessToken, sender_name_input: visitorName.trim(), body_input: trimmedBody || mediaFile?.name || 'Media', media_url_input: mediaUrl || null, media_type_input: mediaFile?.type || null, media_name_input: mediaFile?.name || null })
    if (error) { setMessage(error.message); return }
    const nextMessage = { ...data, media_url: mediaUrl || null, media_type: mediaFile?.type || null, media_name: mediaFile?.name || null } as ChatMessage
    setMessages((current) => [...current, nextMessage])
    setBody('')
    setMediaFile(null)
    setReplyTarget(null)
    setMessage('')
    await supabase.channel(`public-chat:${accessToken}`).send({ type: 'broadcast', event: 'message', payload: nextMessage })
  }

  const toggleRecording = async () => {
    if (recording && mediaRecorder) { mediaRecorder.stop(); return }
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setMessage('Microphone access is required to record a voice note.')
      return
    }
    const recorder = new MediaRecorder(stream)
    const chunks: Blob[] = []
    recorder.ondataavailable = (event) => chunks.push(event.data)
    recorder.onstop = () => { setMediaFile(new File([new Blob(chunks, { type: 'audio/webm' })], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' })); stream.getTracks().forEach((track) => track.stop()); setRecording(false); setMediaRecorder(null) }
    recorder.start()
    setMediaRecorder(recorder)
    setRecording(true)
  }

  const focusReply = (item: ChatMessage) => setReplyTarget({ id: item.id, sender_name: item.sender_name, body: item.body, media_name: item.media_name })
  const handleReplyPointerDown = (event: React.PointerEvent<HTMLElement>) => { replySwipeStart.current = event.clientX }
  const handleReplyPointerUp = (item: ChatMessage, event: React.PointerEvent<HTMLElement>) => { if (replySwipeStart.current !== null && Math.abs(event.clientX - replySwipeStart.current) > 55) focusReply(item); replySwipeStart.current = null }

  const renderMedia = (item: ChatMessage) => item.media_url ? (item.media_type?.startsWith('audio/') ? <VoiceNotePlayer src={item.media_url} /> : item.media_type?.startsWith('image/') ? <img className="relay-media-image" src={item.media_url} alt={item.media_name || 'Shared image'} /> : <a className="relay-media-file" href={item.media_url} target="_blank" rel="noreferrer">{item.media_name || 'Open shared file'}</a>) : null

  const ownerName = selectedAgentName || DEFAULT_PROFILE_NAME
  const ownerInitials = ownerName.split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase()
  if (!accessToken) return <div className="relay-shell"><section className="relay-setup"><div className="relay-setup-brand"><img src="/assets/tennahub_wordmark.svg" alt="Tennahub" /></div><p className="overline">Private conversation</p><h1>Who are you chatting as?</h1><p className="subheading">Choose the Tennahub agent you want to reach. Your conversation will open in a private live channel.</p><form onSubmit={beginChat}><label>Your name<input autoComplete="name" value={visitorName} onChange={(event) => setVisitorName(event.target.value)} placeholder="e.g. Sarah Kato" required /></label><label>Email <span>(optional)</span><input autoComplete="email" value={visitorEmail} onChange={(event) => setVisitorEmail(event.target.value)} placeholder="you@example.com" type="email" /></label><fieldset><legend>Who would you like to talk to?</legend><div className="agent-grid">{agents.map((agent) => <button type="button" className={`agent-choice ${selectedAgentId === agent.id ? 'active' : ''}`} key={agent.id} onClick={() => setSelectedAgentId(agent.id)}><span className="agent-avatar">{agent.name.split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase()}</span><span><strong>{agent.name}</strong><small>{agent.role}</small></span></button>)}</div></fieldset>{message && <p className="relay-error">{message}</p>}<button className="new-button" type="submit" disabled={!selectedAgentId}><MessageSquare size={16} /> Start conversation</button></form></section></div>
  return <div className="relay-shell"><section className="relay-window"><aside className="relay-context"><div className="relay-mark"><img src="/assets/tennahub_wordmark.svg" alt="Tennahub" /></div><p className="overline">Tennahub Studio</p><h1>A direct line to {ownerName.split(' ')[0]}<span className="title-dot">.</span></h1><p>Bring the question, idea, or next move. This is a focused private channel, built for quick human replies.</p><div className="relay-presence"><i /><span><strong>{ownerName}</strong> is online<br /><small>Usually replies within a few minutes</small></span></div><div className="relay-note"><ShieldCheck size={17} /><span>Private by design. Your conversation is only visible to you and {ownerName.split(' ')[0]}.</span></div></aside><section className="relay-conversation"><header className="relay-header"><button className="relay-mobile-back" aria-label="Back"><ArrowLeft size={18} /></button><div className="relay-avatar">{ownerInitials}</div><div><strong>{ownerName}</strong><span>Live conversation</span></div><div className="relay-actions"><button aria-label="Search conversation"><Search size={18} /></button><button aria-label="Conversation options"><MoreVertical size={19} /></button></div></header><div className="relay-messages"><div className="relay-date">TODAY</div>{messages.length ? messages.map((item) => <article className={`relay-bubble ${item.sender_type} ${item.deleted_at ? 'deleted' : ''}`} key={item.id}>{item.deleted_at ? <p className="deleted-message">Message deleted</p> : <>{renderMedia(item)}{item.body && item.body !== item.media_name && <p>{item.body}</p>}</>}<div><time>{new Date(item.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}{item.edited_at && ' · edited'}</time>{item.sender_type === 'visitor' && <CheckCheck size={14} />}</div></article>) : <div className="relay-empty"><MessageSquare size={22} /><strong>Your conversation starts here</strong><span>Send a note and {ownerName.split(' ')[0]} will see it in the workspace.</span></div>}</div><form className="relay-composer" onSubmit={sendMessage}><div className="relay-profile-fields"><input value={visitorName} onChange={(event) => setVisitorName(event.target.value)} placeholder="Your name" required /><input value={visitorEmail} onChange={(event) => setVisitorEmail(event.target.value)} placeholder="Email (optional)" type="email" /></div>{mediaFile && <div className="relay-attachment">Attached: {mediaFile.name}</div>}<div className="relay-compose-row"><button type="button" aria-label="Add an emoji"><Smile size={20} /></button><label className="relay-attach" aria-label="Attach media"><Paperclip size={18} /><input type="file" accept="image/*,video/*,audio/*,.pdf,.doc,.docx" onChange={(event) => setMediaFile(event.target.files?.[0] || null)} /></label><button type="button" className={recording ? 'relay-recording' : ''} onClick={() => void toggleRecording()} aria-label={recording ? 'Stop recording' : 'Record voice note'}><Mic size={18} /></button><input value={body} onChange={(event) => setBody(event.target.value)} placeholder={recording ? 'Recording voice note...' : 'Write a message...'} /><button className="relay-send" type="submit" aria-label="Send message"><Send size={18} /></button></div></form>{message && <p className="relay-error">{message}</p>}</section></section></div>
}

function MessagesPage({ authenticated, onSignIn }: { authenticated: boolean; onSignIn: () => void }) {
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [reply, setReply] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [recording, setRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [error, setError] = useState('')
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null)

  useEffect(() => {
    const emojiButton = document.querySelector('.workspace-reply-form button[aria-label="Add an emoji"]')
    if (!emojiButton) return
    const addEmoji = () => setReply((current) => `${current}${current ? ' ' : ''}🙂`)
    emojiButton.addEventListener('click', addEmoji)
    return () => emojiButton.removeEventListener('click', addEmoji)
  }, [selectedThread])

  useEffect(() => {
    const bubbles = Array.from(document.querySelectorAll<HTMLElement>('.conversation-messages .chat-bubble'))
    const starts = new WeakMap<HTMLElement, number>()
    const cleanups = bubbles.map((bubble, index) => {
      const down = (event: PointerEvent) => starts.set(bubble, event.clientX)
      const up = (event: PointerEvent) => {
        const start = starts.get(bubble)
        if (start !== undefined && Math.abs(event.clientX - start) > 55) {
          const item = messages[index]
          if (item) { setReplyTarget({ id: item.id, sender_name: item.sender_name, body: item.body, media_name: item.media_name }); setReply((current) => current || `↪ ${item.sender_name}: ${item.body || item.media_name || 'Media'}\n`) }
        }
        starts.delete(bubble)
      }
      bubble.addEventListener('pointerdown', down)
      bubble.addEventListener('pointerup', up)
      return () => { bubble.removeEventListener('pointerdown', down); bubble.removeEventListener('pointerup', up) }
    })
    return () => cleanups.forEach((cleanup) => cleanup())
  }, [messages])

  const loadThreads = async () => {
    const { data, error: queryError } = await supabase.rpc('workspace_chat_threads') /*
      return <section className="workspace-page messages-page"><div className="page-title-row"><div><p className="overline">Live client channel</p><h1>Messages<span className="title-dot">.</span></h1><p className="subheading">Share this link to let people reach you in real time.</p></div><button className="new-button" onClick={() => void navigator.clipboard?.writeText(`${window.location.origin}/chat`)}><ArrowUpRight size={16} /> Copy public link</button></div>{error && <div className="data-notice">{error}</div>}<div className="messages-layout"><aside className="thread-list panel"><div className="section-heading"><div><p className="overline">Inbox</p><h2>Conversations</h2></div><MessageSquare size={18} className="muted-icon" /></div>{threads.length ? threads.map((thread) => <button className={`thread-row ${selectedThread?.id === thread.id ? 'active' : ''}`} key={thread.id} onClick={() => setSelectedThread(thread)}><strong>{thread.visitor_name || 'New visitor'}</strong><span>{thread.chat_agents?.name || 'Unassigned agent'} · {new Date(thread.last_message_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></button>) : <p className="empty-state">No conversations yet.</p>}</aside><section className="conversation-panel panel">{selectedThread ? <><div className="conversation-heading"><div><p className="overline">Live conversation · {selectedThread.chat_agents?.name || 'Unassigned'}</p><h2>{selectedThread.visitor_name || 'Visitor'}</h2></div><span className="live-label"><i /> Realtime</span></div>
    */ if (queryError) { setError(queryError.message); return }
    setThreads((data ?? []) as ChatThread[])
    if (!selectedThread && data?.[0]) setSelectedThread(data[0] as ChatThread)
  }

  useEffect(() => {
    void loadThreads()
    const channel = supabase.channel('workspace-chat-threads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_threads' }, () => { void loadThreads() })
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [])
  useEffect(() => {
    if (!selectedThread) return
    const loadMessages = async () => {
      const { data, error: queryError } = await supabase.rpc('workspace_chat_messages', { thread_id_input: selectedThread.id })
      if (queryError) setError(queryError.message); else setMessages((data ?? []).map((item: ChatMessage) => item.sender_type === 'owner' && selectedThread.chat_agents?.name ? { ...item, sender_name: selectedThread.chat_agents.name } : item) as ChatMessage[])
    }
    void loadMessages()
    const channel = supabase.channel(`workspace-chat:${selectedThread.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `thread_id=eq.${selectedThread.id}` }, ({ new: next }) => setMessages((current) => current.some((item) => item.id === next.id) ? current : [...current, next as ChatMessage]))
      .on('broadcast', { event: 'message' }, ({ payload }) => setMessages((current) => current.some((item) => item.id === payload.id) ? current : [...current, payload as ChatMessage]))
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [selectedThread])

  const sendReply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedReply = reply.trim()
    if (!selectedThread || (!trimmedReply && !mediaFile)) return
    let mediaUrl = ''
    if (mediaFile) {
      const path = `${selectedThread.id}/${crypto.randomUUID()}-${mediaFile.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`
      const upload = await supabase.storage.from('chat-media').upload(path, mediaFile, { contentType: mediaFile.type, upsert: false })
      if (upload.error) { setError(upload.error.message); return }
      mediaUrl = supabase.storage.from('chat-media').getPublicUrl(path).data.publicUrl
    }
    const { data, error: insertError } = await supabase.rpc('send_workspace_chat_message', { thread_id_input: selectedThread.id, body_input: trimmedReply || mediaFile?.name || 'Media', media_url_input: mediaUrl || null, media_type_input: mediaFile?.type || null, media_name_input: mediaFile?.name || null })
    if (insertError) { setError(insertError.message); return }
    const nextMessage = (selectedThread.chat_agents?.name ? { ...(data as ChatMessage), sender_name: selectedThread.chat_agents.name } : data) as ChatMessage
    setMessages((current) => [...current, nextMessage])
    setReply('')
    setMediaFile(null)
    setReplyTarget(null)
    await supabase.channel(`public-chat:${selectedThread.access_token}`).send({ type: 'broadcast', event: 'message', payload: nextMessage })
  }

  const toggleRecording = async () => {
    if (recording && mediaRecorder) { mediaRecorder.stop(); return }
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setError('Microphone access is required to record a voice note.')
      return
    }
    const recorder = new MediaRecorder(stream)
    const chunks: Blob[] = []
    recorder.ondataavailable = (event) => chunks.push(event.data)
    recorder.onstop = () => { setMediaFile(new File([new Blob(chunks, { type: 'audio/webm' })], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' })); stream.getTracks().forEach((track) => track.stop()); setRecording(false); setMediaRecorder(null) }
    recorder.start()
    setMediaRecorder(recorder)
    setRecording(true)
  }

  const updateMessage = async (item: ChatMessage, action: 'edit' | 'delete' | 'tag') => {
    if (!selectedThread) return
    const accessToken = selectedThread.access_token
    if (action === 'edit') {
      const nextBody = window.prompt('Edit reply', item.body)
      if (!nextBody?.trim()) return
      const { data, error: actionError } = await supabase.rpc('edit_chat_message', { message_id_input: item.id, body_input: nextBody.trim() })
      if (actionError) { setError(actionError.message); return }
      setMessages((current) => current.map((message) => message.id === item.id ? data as ChatMessage : message))
      await supabase.channel(`public-chat:${accessToken}`).send({ type: 'broadcast', event: 'message-update', payload: data })
    }
    if (action === 'delete') {
      const { data, error: actionError } = await supabase.rpc('delete_chat_message', { message_id_input: item.id })
      if (actionError) { setError(actionError.message); return }
      setMessages((current) => current.map((message) => message.id === item.id ? data as ChatMessage : message))
      await supabase.channel(`public-chat:${accessToken}`).send({ type: 'broadcast', event: 'message-update', payload: data })
    }
    if (action === 'tag') {
      const nextTags = window.prompt('Tags separated by commas', item.tags?.join(', ') || '')
      if (nextTags === null) return
      const tags = nextTags.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 5)
      const { data, error: actionError } = await supabase.rpc('tag_chat_message', { message_id_input: item.id, tags_input: tags })
      if (actionError) { setError(actionError.message); return }
      setMessages((current) => current.map((message) => message.id === item.id ? data as ChatMessage : message))
      await supabase.channel(`public-chat:${accessToken}`).send({ type: 'broadcast', event: 'message-update', payload: data })
    }
  }

  const inboxMedia = (item: ChatMessage) => item.media_url ? <div className="inbox-media"><span className="inbox-media-agent">{item.sender_type === 'owner' ? selectedThread?.chat_agents?.name || item.sender_name : item.sender_name}</span>{item.media_type?.startsWith('audio/') ? <VoiceNotePlayer src={item.media_url} /> : item.media_type?.startsWith('image/') ? <img className="relay-media-image" src={item.media_url} alt={item.media_name || 'Shared image'} /> : <a className="relay-media-file" href={item.media_url} target="_blank" rel="noreferrer">{item.media_name || 'Open shared file'}</a>}</div> : null
  return <section className="workspace-page messages-page"><div className="page-title-row"><div><p className="overline">Live client channel</p><h1>Messages<span className="title-dot">.</span></h1><p className="subheading">Share this link to let people reach you in real time.</p></div><button className="new-button" onClick={() => void navigator.clipboard?.writeText(`${window.location.origin}/chat`)}><ArrowUpRight size={16} /> Copy public link</button></div>{error && <div className="data-notice">{error}</div>}<div className="messages-layout"><aside className="thread-list panel"><div className="section-heading"><div><p className="overline">Inbox</p><h2>Conversations</h2></div><MessageSquare size={18} className="muted-icon" /></div>{threads.length ? threads.map((thread) => <button className={`thread-row ${selectedThread?.id === thread.id ? 'active' : ''}`} key={thread.id} onClick={() => setSelectedThread(thread)}><strong>{thread.visitor_name || 'New visitor'}</strong><span>{thread.chat_agents?.name || 'Unassigned agent'}</span><small>{new Date(thread.last_message_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</small></button>) : <p className="empty-state">No conversations yet.</p>}</aside><section className="conversation-panel panel">{selectedThread ? <><div className="conversation-heading"><div><p className="overline">Live conversation</p><h2>{selectedThread.visitor_name || 'Visitor'}</h2><span className="conversation-agent"><Users size={13} /> Replying as {selectedThread.chat_agents?.name || 'Unassigned agent'}</span></div><span className="live-label"><i /> Realtime</span></div><div className="conversation-messages">{messages.map((item) => <article className={`chat-bubble ${item.sender_type} ${item.deleted_at ? 'deleted' : ''}`} key={item.id}><div className="message-row-top"><span>{item.sender_name}</span>{item.sender_type === 'owner' && !item.deleted_at && <div className="message-actions"><button type="button" aria-label="Tag message" onClick={() => void updateMessage(item, 'tag')}><Tag size={13} /></button><button type="button" aria-label="Edit message" onClick={() => void updateMessage(item, 'edit')}><Pencil size={13} /></button><button type="button" aria-label="Delete message" onClick={() => void updateMessage(item, 'delete')}><Trash2 size={13} /></button></div>}</div>{item.deleted_at ? <p className="deleted-message">Message deleted</p> : <>{inboxMedia(item)}{item.body && item.body !== item.media_name && <p>{item.body}</p>}</>}<time>{new Date(item.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}{item.edited_at && ' · edited'}</time>{item.tags?.length ? <div className="message-tags">{item.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div> : null}</article>)}</div><form className="reply-form workspace-reply-form" onSubmit={sendReply}>{mediaFile && <div className="relay-attachment">Attached: {mediaFile.name}</div>}<div className="relay-compose-row"><button type="button" aria-label="Add an emoji"><Smile size={19} /></button><label className="relay-attach" aria-label="Attach media"><Paperclip size={18} /><input type="file" accept="image/*,video/*,audio/*,.pdf,.doc,.docx" onChange={(event) => setMediaFile(event.target.files?.[0] || null)} /></label><button type="button" className={recording ? 'relay-recording' : ''} onClick={() => void toggleRecording()} aria-label={recording ? 'Stop recording' : 'Record voice note'}><Mic size={18} /></button><input value={reply} onChange={(event) => setReply(event.target.value)} placeholder={recording ? 'Recording voice note...' : 'Reply to this conversation...'} /><button className="new-button" type="submit" aria-label="Send reply"><Send size={16} /> Reply</button></div></form></> : <div className="integration-empty"><MessageSquare size={22} /><strong>Select a conversation</strong><p>New messages from your public link will appear here.</p></div>}</section></div></section>
}

function InfrastructureWorkspace({ assets, diagrams, secrets, authenticated, onCreateDiagram }: { assets: InfrastructureAsset[]; diagrams: NetworkDiagram[]; secrets: InfrastructureSecret[]; authenticated: boolean; onCreateDiagram: () => void }) {
  const activeDiagram = diagrams[0]
  const nodes = activeDiagram?.diagram_json.nodes ?? []
  const links = activeDiagram?.diagram_json.links ?? []
  return <section className="workspace-page infrastructure-page"><div className="page-title-row"><div><p className="overline">Systems and topology</p><h1>Infrastructure<span className="title-dot">.</span></h1><p className="subheading">Build a visual school network plan, keep operational references private, and publish a safe view for clients.</p></div><div className="infrastructure-actions"><span className="system-health"><i />{assets.filter((asset) => asset.status === 'Operational').length} of {assets.length} operational</span><button className="new-button" disabled={!authenticated} onClick={onCreateDiagram}><Plus size={17} /> New diagram</button></div></div>{!authenticated && <div className="integration-gate"><ShieldCheck size={20} /><div><strong>Sign in to manage infrastructure</strong><p>Topology editing and Wi-Fi/admin references are protected. Published diagrams can be shared through the client portal.</p></div></div>}<div className="infra-summary"><div><span>System health</span><strong>{assets.length ? Math.round((assets.filter((asset) => asset.status === 'Operational').length / assets.length) * 100) : 0}%</strong></div><div><span>Published diagrams</span><strong>{diagrams.filter((diagram) => diagram.is_published).length}</strong></div><div><span>Private references</span><strong>{authenticated ? secrets.length : '--'}</strong></div></div><div className="topology-layout"><section className="topology-panel panel"><div className="section-heading"><div><p className="overline">Client-safe topology</p><h2>{activeDiagram?.name ?? 'No diagram yet'}</h2></div><span className="live-label"><i />{activeDiagram?.is_published ? 'Published' : 'Draft'}</span></div>{activeDiagram ? <><p className="topology-description">{activeDiagram.description}</p><div className="topology-canvas">{nodes.map((node) => <div className={`topology-node ${node.kind ?? 'device'}`} style={{ left: `${node.x ?? 10}%`, top: `${node.y ?? 20}%` }} key={node.id}><strong>{node.label}</strong><span>{node.kind ?? 'device'}</span></div>)}{links.map((link) => <div className="topology-link" key={`${link.from}-${link.to}`}><span>{link.label ?? 'connection'}</span></div>)}</div><div className="topology-links"><strong>Connections</strong>{links.map((link) => <span key={`${link.from}-${link.to}`}>{link.from} to {link.to}{link.label ? ` · ${link.label}` : ''}</span>)}</div></> : <div className="integration-empty"><Network size={22} /><strong>Create the first school topology</strong><p>Map internet, switches, servers, wireless, CCTV, labs, and client-owned equipment.</p><button className="new-button" disabled={!authenticated} onClick={onCreateDiagram}><Plus size={16} /> Create diagram</button></div>}</section><aside className="topology-side"><section className="panel asset-list"><div className="section-heading"><div><p className="overline">Managed assets</p><h2>Infrastructure</h2></div><Network size={18} className="muted-icon" /></div>{assets.map((asset) => <article className="asset-row" key={asset.id}><div className="asset-icon"><Network size={19} /></div><div className="asset-copy"><strong>{asset.name}</strong><span>{asset.asset_type} · {asset.provider}</span></div><span className={`asset-status ${asset.status.toLowerCase()}`}><i />{asset.status}</span></article>)}</section><section className="panel secret-reference-panel"><div className="section-heading"><div><p className="overline">Private vault</p><h2>Network references</h2></div><ShieldCheck size={18} className="muted-icon" /></div>{authenticated ? secrets.map((secret) => <div className="secret-reference" key={secret.id}><strong>{secret.label}</strong><span>{secret.network_name ?? 'Network'} · {secret.secret_type}</span><code>{secret.secret_ref}</code></div>) : <p className="empty-state">Private Wi-Fi and admin references are hidden until sign-in.</p>}</section></aside></div></section>
}

function SecondaryPage({ activeNav, clients, infrastructure, diagrams, secrets, invoices, timeEntries, expenses, quotes, receipts, agenda, documents, credentials, milestones, tasks, reviews, githubConnections, githubRepositories, supabaseAccounts, monitoringChecks, authenticated, onCreateAppointment, onCreateTask, onCreateDiagram, onConnectGithub, onSignIn }: { activeNav: string; clients: Client[]; infrastructure: InfrastructureAsset[]; diagrams: NetworkDiagram[]; secrets: InfrastructureSecret[]; invoices: Invoice[]; timeEntries: TimeEntry[]; expenses: Expense[]; quotes: Quote[]; receipts: PaymentReceipt[]; agenda: AgendaItem[]; documents: Document[]; credentials: Credential[]; milestones: Milestone[]; tasks: Task[]; reviews: Review[]; githubConnections: GithubConnection[]; githubRepositories: GithubRepository[]; supabaseAccounts: SupabaseAccount[]; monitoringChecks: MonitoringCheck[]; authenticated: boolean; onCreateAppointment: () => void; onCreateTask: () => void; onCreateDiagram: () => void; onConnectGithub: () => void; onSignIn: () => void }) {
  const totalInvoiced = invoices.reduce((total, invoice) => total + Number(invoice.amount), 0)
  const totalMinutes = timeEntries.reduce((total, entry) => total + entry.minutes, 0)
  const liveAssets = infrastructure.filter((asset) => asset.status === 'Operational').length
  const totalExpenses = expenses.reduce((total, expense) => total + Number(expense.amount), 0)
  const acceptedQuotes = quotes.filter((quote) => quote.status === 'Accepted').reduce((total, quote) => total + Number(quote.amount), 0)
  const totalReceipts = receipts.reduce((total, receipt) => total + Number(receipt.amount), 0)

  if (activeNav === 'Messages') return <MessagesPage authenticated={authenticated} onSignIn={onSignIn} />

  if (activeNav === 'Integrations') return <section className="workspace-page integrations-page"><div className="page-title-row"><div><p className="overline">Connected systems</p><h1>Integrations<span className="title-dot">.</span></h1><p className="subheading">Bring code, client environments, and operational signals into one place.</p></div><span className={`integration-access ${authenticated ? 'ready' : 'locked'}`}>{authenticated ? 'Workspace access' : 'Sign in required'}</span></div>{!authenticated && <div className="integration-gate"><ShieldCheck size={20} /><div><strong>Private integrations are protected</strong><p>Sign in to view GitHub repositories, Supabase accounts, and monitoring results. Provider tokens never enter the browser.</p></div></div>}<div className="integration-grid"><section className="integration-card panel"><div className="integration-card-heading"><div className="integration-brand github-brand"><Github size={22} /></div><div><h2>GitHub</h2><span>Repositories and delivery context</span></div><span className="integration-status">{githubConnections.length ? `${githubConnections.length} connected` : 'Not connected'}</span></div>{authenticated && githubConnections.length ? githubConnections.map((connection) => <div className="connection-row" key={connection.id}><div><strong>{connection.account_name}</strong><span>{connection.repository_count} repositories · {connection.status}</span></div><button className="text-button" onClick={onConnectGithub}>Sync repositories <RefreshIcon /></button></div>) : <div className="integration-empty"><Github size={20} /><strong>Connect your GitHub account</strong><p>{authenticated ? 'Add a connection to sync repositories into project records.' : 'Authentication is required before a GitHub connection can be managed.'}</p><button className="new-button" disabled={!authenticated} onClick={onConnectGithub}><Github size={16} /> Connect GitHub</button></div>}{authenticated && githubRepositories.length > 0 && <div className="repository-list">{githubRepositories.slice(0, 5).map((repository) => <a href={repository.url} target="_blank" rel="noreferrer" className="repository-row" key={repository.id}><span>{repository.name}</span><small>{repository.default_branch}</small><ArrowUpRight size={14} /></a>)}</div>}</section><section className="integration-card panel"><div className="integration-card-heading"><div className="integration-brand supabase-brand"><ServerCog size={22} /></div><div><h2>Supabase monitoring</h2><span>Client project health and latency</span></div><span className="integration-status">{supabaseAccounts.length ? `${supabaseAccounts.length} monitored` : 'No accounts'}</span></div>{authenticated && supabaseAccounts.length ? supabaseAccounts.map((account) => { const latestCheck = monitoringChecks.find((check) => check.supabase_account_id === account.id); return <div className="connection-row" key={account.id}><div><strong>{account.name}</strong><span>{account.project_ref} · {latestCheck?.latency_ms ?? '--'}ms latency</span></div><span className={`health-label ${account.status.toLowerCase()}`}><i />{account.status}</span></div> }) : <div className="integration-empty"><ServerCog size={20} /><strong>Monitor client Supabase projects</strong><p>{authenticated ? 'Add a project URL and project reference to begin health checks.' : 'Sign in to manage monitored client environments.'}</p><button className="new-button" disabled={!authenticated}><Plus size={16} /> Add Supabase account</button></div>}</section></div><div className="integration-note"><ShieldCheck size={16} /><span>GitHub sync and Supabase monitoring run through JWT-protected Edge Functions. Configure provider secrets in Supabase before syncing.</span></div></section>

  if (activeNav === 'Delivery') return <section className="workspace-page delivery-page"><div className="page-title-row"><div><p className="overline">Production control</p><h1>Delivery<span className="title-dot">.</span></h1><p className="subheading">Turn commitments into visible progress, one handoff at a time.</p></div><button className="new-button" onClick={onCreateTask}><Plus size={17} /> New task</button></div><div className="delivery-summary"><div><span>Open tasks</span><strong>{tasks.filter((task) => task.status !== 'Done').length}</strong><small>Across {new Set(tasks.map((task) => task.project_id)).size} projects</small></div><div><span>Milestones</span><strong>{milestones.filter((milestone) => milestone.status === 'Complete').length}/{milestones.length}</strong><small>Completed milestones</small></div><div><span>Reviews</span><strong>{reviews.filter((review) => review.status !== 'Approved').length}</strong><small>Need attention</small></div></div><div className="delivery-grid"><section className="task-board panel"><div className="section-heading"><div><p className="overline">Work queue</p><h2>Tasks</h2></div><ListChecks size={18} className="muted-icon" /></div>{tasks.map((task) => <article className="task-row" key={task.id}><div className={`task-check ${task.status === 'Done' ? 'complete' : ''}`}>{task.status === 'Done' ? '✓' : ''}</div><div><strong>{task.title}</strong><span>{task.assigned_to ?? 'Unassigned'} · Due {task.due_date ? new Date(`${task.due_date}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'No date'}</span></div><span className={`priority-label ${task.priority.toLowerCase()}`}>{task.priority}</span></article>)}</section><section className="milestone-panel panel"><div className="section-heading"><div><p className="overline">Project rhythm</p><h2>Milestones</h2></div><FlagIcon /></div>{milestones.map((milestone) => <article className="milestone-row" key={milestone.id}><div className="milestone-heading"><strong>{milestone.title}</strong><span>{milestone.status}</span></div><div className="progress-track"><span style={{ width: `${milestone.progress}%` }} /></div><small>{milestone.progress}% · Due {milestone.due_date ? new Date(`${milestone.due_date}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'No date'}</small></article>)}</section></div><section className="review-strip panel"><div className="section-heading"><div><p className="overline">Client feedback</p><h2>Reviews and approvals</h2></div><MessageSquare size={18} className="muted-icon" /></div><div className="review-grid">{reviews.map((review) => <article className="review-card" key={review.id}><span className={`review-status ${review.status.toLowerCase().replace(' ', '-')}`}>{review.status}</span><strong>{review.title}</strong><p>{review.feedback ?? 'Waiting for reviewer feedback.'}</p></article>)}</div></section></section>

  if (activeNav === 'Clients') return <section className="workspace-page clients-page"><div className="page-title-row"><div><p className="overline">Relationships</p><h1>Clients<span className="title-dot">.</span></h1><p className="subheading">A clear view of the people behind the work.</p></div><span className="page-count">{clients.length} active records</span></div><div className="client-grid">{clients.map((client) => <article className="client-card" key={client.id}><div className="client-card-top"><div className="client-avatar" style={{ background: client.accent }}>{client.name.split(' ').map((word) => word[0]).join('').slice(0, 2)}</div><span className={`status-pill ${client.status === 'Active' ? 'status-green' : 'status-orange'}`}><i />{client.status}</span></div><h2>{client.name}</h2><p>{client.contact_name}</p><a href={`mailto:${client.email}`}>{client.email}</a><div className="client-card-footer"><span>{client.project_count} project{client.project_count === 1 ? '' : 's'}</span><ArrowUpRight size={15} /></div></article>)}</div></section>

  if (activeNav === 'Infrastructure') return <InfrastructureWorkspace assets={infrastructure} diagrams={diagrams} secrets={secrets} authenticated={authenticated} onCreateDiagram={onCreateDiagram} />

  if (activeNav === 'Finance') return <section className="workspace-page finance-page"><div className="page-title-row"><div><p className="overline">Money desk</p><h1>Finance<span className="title-dot">.</span></h1><p className="subheading">Invoices, quotes, expenses, and time measured in UGX.</p></div><span className="currency-badge">UGX</span></div><div className="finance-hero"><div><span>Outstanding balance</span><strong>{formatCurrency(totalInvoiced)}</strong><p>{invoices.length} open invoices across your studio</p></div><div className="finance-hero-mark"><CircleDollarSign size={35} /></div></div><div className="finance-summary"><div><span>Accepted quotes</span><strong>{formatCurrency(acceptedQuotes)}</strong></div><div><span>Expenses logged</span><strong>{formatCurrency(totalExpenses)}</strong></div><div><span>Receipts issued</span><strong>{formatCurrency(totalReceipts)}</strong></div></div><div className="finance-grid"><section className="invoice-panel panel"><div className="section-heading"><div><p className="overline">Receivables</p><h2>Open invoices</h2></div><ReceiptText size={18} className="muted-icon" /></div>{invoices.map((invoice) => <div className="invoice-row" key={invoice.id}><div><strong>#{invoice.invoice_number}</strong><span>{invoice.client_name}</span></div><strong>{formatCurrency(Number(invoice.amount))}</strong><span className="status-pill status-orange"><i />{invoice.status}</span></div>)}</section><section className="time-panel panel"><div className="section-heading"><div><p className="overline">Delivery effort</p><h2>This week</h2></div><Clock3 size={18} className="muted-icon" /></div><strong className="time-total">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</strong>{timeEntries.map((entry) => <div className="time-row" key={entry.id}><span>{entry.project_name}</span><strong>{Math.floor(entry.minutes / 60)}h {entry.minutes % 60}m</strong></div>)}</section></div><div className="finance-record-grid"><section className="commercial-panel panel"><div className="section-heading"><div><p className="overline">Commercial pipeline</p><h2>Quotes</h2></div><CircleDollarSign size={18} className="muted-icon" /></div>{quotes.map((quote) => <div className="commercial-row" key={quote.id}><div><strong>{quote.quote_number}</strong><span>{quote.title}</span></div><strong>{formatCurrency(Number(quote.amount))}</strong><span className={`commercial-status ${quote.status.toLowerCase()}`}>{quote.status}</span></div>)}</section><section className="commercial-panel panel"><div className="section-heading"><div><p className="overline">Cash received</p><h2>Payment receipts</h2></div><WalletCards size={18} className="muted-icon" /></div>{receipts.map((receipt) => <div className="commercial-row" key={receipt.id}><div><strong>{receipt.receipt_number}</strong><span>{new Date(receipt.paid_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span></div><strong>{formatCurrency(Number(receipt.amount))}</strong></div>)}</section></div><section className="expense-panel panel"><div className="section-heading"><div><p className="overline">Cost control</p><h2>Recent expenses</h2></div><ReceiptText size={18} className="muted-icon" /></div><div className="expense-grid">{expenses.map((expense) => <div className="expense-row" key={expense.id}><div><strong>{expense.description}</strong><span>{expense.category} · {new Date(`${expense.incurred_on}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span></div><strong>{formatCurrency(Number(expense.amount))}</strong></div>)}</div></section></section>

  if (activeNav === 'Calendar') return <section className="workspace-page calendar-page"><div className="page-title-row"><div><p className="overline">Schedule</p><h1>Calendar<span className="title-dot">.</span></h1><p className="subheading">Make space for the conversations that move work forward.</p></div><div className="calendar-actions"><button className="new-button" onClick={onCreateAppointment}><Plus size={17} /> New appointment</button><button className="date-button"><CalendarDays size={17} /> This week <ChevronDown size={15} /></button></div></div><div className="calendar-layout"><div className="calendar-date-card"><span>{agenda[0] ? new Date(agenda[0].starts_at).toLocaleDateString('en-GB', { weekday: 'long' }).toUpperCase() : 'TODAY'}</span><strong>{agenda[0] ? new Date(agenda[0].starts_at).getDate() : '--'}</strong><small>{agenda[0] ? new Date(agenda[0].starts_at).toLocaleDateString('en-GB', { month: 'long' }).toUpperCase() : 'NO EVENTS'}</small></div><div className="calendar-timeline">{agenda.length ? agenda.map((item) => <article className="calendar-event" key={item.id}><time>{formatTime(item.starts_at)}</time><div className={`calendar-event-bar ${item.accent}`} /><div><h2>{item.title}</h2><p>{item.client_name} · {item.meeting_type}</p></div></article>) : <p className="empty-state">Your calendar is clear.</p>}</div></div></section>

  if (activeNav === 'Documents') return <section className="workspace-page documents-page"><div className="page-title-row"><div><p className="overline">Library</p><h1>Documents<span className="title-dot">.</span></h1><p className="subheading">The latest files from across the workspace.</p></div><span className="page-count">{documents.length} files</span></div><div className="document-shelf panel">{documents.map((document) => <article className="document-row" key={document.id}><div className="document-icon"><ReceiptText size={18} /></div><div><strong>{document.name}</strong><span>{document.document_type} · {document.size_label}</span></div><span className="document-owner">{document.owner_name}</span><time>{new Date(document.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</time><button className="icon-button" aria-label={`Open ${document.name}`}><ArrowUpRight size={16} /></button></article>)}</div></section>

  return <section className="workspace-page credentials-page"><div className="page-title-row"><div><p className="overline">Access control</p><h1>Credentials<span className="title-dot">.</span></h1><p className="subheading">Keep service access visible, owned, and current.</p></div><div className="credential-score"><ShieldCheck size={17} /> {credentials.filter((credential) => credential.status === 'Healthy').length}/{credentials.length} healthy</div></div><div className="credential-list">{credentials.map((credential) => <article className="credential-row" key={credential.id}><div className="credential-icon"><ShieldCheck size={18} /></div><div className="credential-copy"><strong>{credential.name}</strong><span>{credential.service} · Owned by {credential.owner_name}</span></div><span className={`credential-status ${credential.status.toLowerCase()}`}>{credential.status}</span><time>{credential.rotated_at ? `Rotated ${new Date(`${credential.rotated_at}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : 'Never rotated'}</time><button className="icon-button" aria-label={`Manage ${credential.name}`}><MoreHorizontal size={17} /></button></article>)}</div></section>
}

function App() {
  const [activeNav, setActiveNav] = useState('Overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [activity, setActivity] = useState<ActivityEvent[]>([])
  const [agenda, setAgenda] = useState<AgendaItem[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [infrastructure, setInfrastructure] = useState<InfrastructureAsset[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [githubConnections, setGithubConnections] = useState<GithubConnection[]>([])
  const [githubRepositories, setGithubRepositories] = useState<GithubRepository[]>([])
  const [supabaseAccounts, setSupabaseAccounts] = useState<SupabaseAccount[]>([])
  const [monitoringChecks, setMonitoringChecks] = useState<MonitoringCheck[]>([])
  const [diagrams, setDiagrams] = useState<NetworkDiagram[]>([])
  const [secrets, setSecrets] = useState<InfrastructureSecret[]>([])
  const [authenticated, setAuthenticated] = useState(false)
  const [workspaceUnlocked, setWorkspaceUnlocked] = useState(false)
  const [securityReady, setSecurityReady] = useState(false)
  const [lockUntilTime, setLockUntilTime] = useState<number | null>(null)
  const [pinInput, setPinInput] = useState('')
  const [pinMessage, setPinMessage] = useState('')
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authEmail, setAuthEmail] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [profileName, setProfileName] = useState(() => window.localStorage.getItem('tennahub-profile-name') || DEFAULT_PROFILE_NAME)
  const [profileRole, setProfileRole] = useState(() => window.localStorage.getItem('tennahub-profile-role') || 'Owner')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [diagramDialogOpen, setDiagramDialogOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notificationsRead, setNotificationsRead] = useState<string[]>([])
  const [projectQuery, setProjectQuery] = useState('')
  const [projectStatus, setProjectStatus] = useState('All')

  const hydrateWorkspaceSecurity = async () => {
    try {
      const { error: sessionError } = await supabase.rpc('start_workspace_session')
      if (sessionError) {
        setWorkspaceUnlocked(false)
        setPinMessage('Unable to start the secure workspace session.')
        return
      }
      const { data, error } = await supabase.rpc('workspace_security_status')
      if (error) {
        setPinMessage('Unable to load the workspace security state.')
        setWorkspaceUnlocked(false)
        setSecurityReady(true)
        return
      }

      const lockRemainingMs = Number(data?.lock_remaining_ms ?? 0)
      if (data?.unlocked === false && lockRemainingMs > 0) {
        setLockUntilTime(Date.now() + lockRemainingMs)
        setWorkspaceUnlocked(false)
        setPinMessage(data?.message ?? 'Workspace locked. Please wait before trying again.')
      } else {
        setLockUntilTime(null)
        setWorkspaceUnlocked(false)
        setPinMessage('Enter the 4-digit workspace PIN to unlock the app.')
      }
    } catch {
      setPinMessage('Unable to verify the workspace security state.')
      setWorkspaceUnlocked(false)
    } finally {
      setSecurityReady(true)
    }
  }

  const handleWorkspacePinSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!securityReady) return

    const sanitizedPin = pinInput.replace(/\D/g, '')
    if (sanitizedPin.length !== PIN_LENGTH) {
      setPinMessage('Enter the 4-digit workspace PIN to unlock the app.')
      return
    }

    try {
      const { data, error } = await supabase.rpc('verify_workspace_pin', { pin_input: sanitizedPin })
      if (error) {
        setPinMessage('Unable to verify the workspace PIN.')
        return
      }

      if (data?.ok === true && data?.unlocked === true) {
        setWorkspaceUnlocked(true)
        setLockUntilTime(null)
        setPinInput('')
        setPinMessage('')
        await loadDashboard()
        return
      }

      const lockRemainingMs = Number(data?.lock_remaining_ms ?? 0)
      if (lockRemainingMs > 0) {
        setLockUntilTime(Date.now() + lockRemainingMs)
        setWorkspaceUnlocked(false)
      }

      setPinMessage(data?.message ?? 'Incorrect PIN. Please try again.')
    } catch {
      setPinMessage('Unable to verify the workspace PIN.')
    }
  }

  useEffect(() => {
    void hydrateWorkspaceSecurity()
  }, [])

  useEffect(() => {
    if (!lockUntilTime) return

    const timer = window.setInterval(() => {
      const remainingMs = lockUntilTime - Date.now()
      if (remainingMs <= 0) {
        setLockUntilTime(null)
        setWorkspaceUnlocked(true)
        setPinMessage('')
        window.clearInterval(timer)
      }
    }, 1000)

    return () => window.clearInterval(timer)
  }, [lockUntilTime])

  const loadDashboard = async () => {
    setLoading(true)
    setError('')
    const { data: { session } } = await supabase.auth.getSession()
    setAuthenticated(Boolean(session))
    const [projectResult, agendaResult, activityResult, invoiceResult, timeResult, expenseResult, quoteResult, receiptResult, clientResult, infrastructureResult, documentResult, milestoneResult, taskResult, reviewResult] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: true }),
      supabase.from('agenda_items').select('*').order('starts_at', { ascending: true }),
      supabase.from('activity_events').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('invoices').select('*').in('status', ['pending', 'overdue']).order('due_date', { ascending: true }),
      supabase.from('time_entries').select('*').gte('entry_date', new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)),
      supabase.from('expenses').select('*').order('incurred_on', { ascending: false }),
      supabase.from('quotes').select('*').order('created_at', { ascending: false }),
      supabase.from('payment_receipts').select('*').order('paid_at', { ascending: false }),
      supabase.from('clients').select('*').order('created_at', { ascending: true }),
      supabase.from('infrastructure_assets').select('*').order('created_at', { ascending: true }),
      supabase.from('documents').select('*').order('updated_at', { ascending: false }),
      supabase.from('milestones').select('*').order('due_date', { ascending: true }),
      supabase.from('tasks').select('*').order('due_date', { ascending: true }),
      supabase.from('reviews').select('*').order('requested_at', { ascending: false }),
    ])
    const credentialResult = session
      ? await supabase.from('credentials').select('*').order('created_at', { ascending: true })
      : { data: [], error: null }
    const [githubConnectionResult, githubRepositoryResult, supabaseAccountResult, monitoringCheckResult, diagramResult, secretResult] = session ? await Promise.all([
      supabase.from('github_connections').select('*').order('created_at', { ascending: true }),
      supabase.from('github_repositories').select('*').order('created_at', { ascending: true }),
      supabase.from('supabase_accounts').select('*').order('created_at', { ascending: true }),
      supabase.from('monitoring_checks').select('*').order('last_checked_at', { ascending: false }),
      supabase.from('network_diagrams').select('*').order('updated_at', { ascending: false }),
      supabase.from('infrastructure_secrets').select('*').order('created_at', { ascending: true }),
    ]) : [{ data: [], error: null }, { data: [], error: null }, { data: [], error: null }, { data: [], error: null }, { data: [], error: null }, { data: [], error: null }]

    const firstError = projectResult.error || agendaResult.error || activityResult.error || invoiceResult.error || timeResult.error || expenseResult.error || quoteResult.error || receiptResult.error || clientResult.error || infrastructureResult.error || documentResult.error || credentialResult.error || milestoneResult.error || taskResult.error || reviewResult.error
    if (firstError) {
      setError(firstError.message)
      setProjects(fallbackProjects)
      setAgenda([])
      setActivity(fallbackActivity)
      setInvoices([])
      setTimeEntries([])
      setExpenses([])
      setQuotes([])
      setReceipts([])
      setClients([])
      setInfrastructure([])
      setDocuments([])
      setCredentials([])
      setMilestones([])
      setTasks([])
      setReviews([])
      setGithubConnections([])
      setGithubRepositories([])
      setSupabaseAccounts([])
      setMonitoringChecks([])
      setDiagrams([])
      setSecrets([])
    } else {
      setProjects((projectResult.data ?? []).map((project) => ({
        ...project,
        client: project.client_name,
        type: project.project_type,
        due: formatDueDate(project.due_date),
      })))
      setAgenda(agendaResult.data ?? [])
      setActivity((activityResult.data ?? []).map((event) => ({
        ...event,
        icon: activityIcons[event.icon as keyof typeof activityIcons] ?? Activity,
      })))
      setInvoices(invoiceResult.data ?? [])
      setTimeEntries(timeResult.data ?? [])
      setExpenses(expenseResult.data ?? [])
      setQuotes(quoteResult.data ?? [])
      setReceipts(receiptResult.data ?? [])
      setClients(clientResult.data ?? [])
      setInfrastructure(infrastructureResult.data ?? [])
      setDocuments(documentResult.data ?? [])
      setCredentials(credentialResult.data ?? [])
      setMilestones(milestoneResult.data ?? [])
      setTasks(taskResult.data ?? [])
      setReviews(reviewResult.data ?? [])
      setGithubConnections(githubConnectionResult.data ?? [])
      setGithubRepositories(githubRepositoryResult.data ?? [])
      setSupabaseAccounts(supabaseAccountResult.data ?? [])
      setMonitoringChecks(monitoringCheckResult.data ?? [])
      setDiagrams(diagramResult.data ?? [])
      setSecrets(secretResult.data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!workspaceUnlocked) return
    void loadDashboard()
    const { data: listener } = supabase.auth.onAuthStateChange(() => { void loadDashboard() })
    return () => listener.subscription.unsubscribe()
  }, [workspaceUnlocked])

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAuthMessage('')
    const email = authEmail.trim()
    const options = { emailRedirectTo: window.location.origin }
    let { error: signInError } = await supabase.auth.signInWithOtp({ email, options })
    if (signInError?.message.toLowerCase().includes('database error')) {
      const retry = await supabase.auth.signInWithOtp({ email, options: { ...options, shouldCreateUser: false } })
      signInError = retry.error
    }
    setAuthMessage(signInError ? signInError.message : 'Check your email for a secure sign-in link.')
  }

  const connectGithub = async () => {
    if (!authenticated) { setAuthDialogOpen(true); return }
    const { error: oauthError } = await supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: window.location.origin } })
    if (oauthError) setError(oauthError.message.includes('Unsupported provider') ? 'GitHub OAuth is not enabled in Supabase. Add the GitHub Client ID and Secret under Authentication > Providers > GitHub, then try again.' : `GitHub connection unavailable: ${oauthError.message}`)
  }

  const signOut = async () => {
    await supabase.rpc('lock_workspace')
    await supabase.auth.signOut()
    setAuthenticated(false)
    setWorkspaceUnlocked(false)
    setPinInput('')
    setPinMessage('')
    setActiveNav('Overview')
  }

  const visibleProjects = projects.filter((project) => {
    const matchesQuery = `${project.name} ${project.client} ${project.type}`.toLowerCase().includes(projectQuery.toLowerCase())
    return matchesQuery && (projectStatus === 'All' || project.status === projectStatus)
  })

  const createProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') || '').trim()
    const clientName = String(formData.get('client_name') || '').trim()
    if (!name || !clientName) return
    const { error: insertError } = await supabase.from('projects').insert({
      name,
      client_name: clientName,
      project_type: String(formData.get('project_type') || 'Web build'),
      initials: name.split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase(),
      color: '#2d6257',
      progress: 0,
      status: 'On track',
      due_date: formData.get('due_date') || null,
    })
    if (insertError) { setError(insertError.message); return }
    setDialogOpen(false)
    await loadDashboard()
  }

  const createAppointment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const title = String(formData.get('title') || '').trim()
    const clientName = String(formData.get('client_name') || '').trim()
    const startsAt = String(formData.get('starts_at') || '')
    if (!title || !clientName || !startsAt) return
    const { error: insertError } = await supabase.from('agenda_items').insert({
      title,
      client_name: clientName,
      meeting_type: String(formData.get('meeting_type') || 'Video call'),
      starts_at: new Date(startsAt).toISOString(),
      accent: String(formData.get('accent') || 'green'),
    })
    if (insertError) { setError(insertError.message); return }
    setCalendarDialogOpen(false)
    await loadDashboard()
  }

  const createTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const title = String(formData.get('title') || '').trim()
    if (!title) return
    const { error: insertError } = await supabase.from('tasks').insert({
      title,
      project_id: String(formData.get('project_id') || '') || null,
      status: 'Todo',
      priority: String(formData.get('priority') || 'Normal'),
      assigned_to: String(formData.get('assigned_to') || '').trim() || null,
      due_date: formData.get('due_date') || null,
    })
    if (insertError) { setError(insertError.message); return }
    setTaskDialogOpen(false)
    await loadDashboard()
  }

  const createDiagram = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!authenticated) return
    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') || '').trim()
    const description = String(formData.get('description') || '').trim()
    const nodeLabels = String(formData.get('nodes') || '').split(',').map((label) => label.trim()).filter(Boolean)
    const connectionLabels = String(formData.get('connections') || '').split(',').map((connection) => connection.trim()).filter(Boolean)
    if (!name || !nodeLabels.length) return
    const nodes = nodeLabels.map((label, index) => ({ id: `node-${index + 1}`, label, kind: 'device', x: 10 + (index % 4) * 24, y: 25 + Math.floor(index / 4) * 35 }))
    const links = connectionLabels.map((connection) => {
      const [from, to, ...labelParts] = connection.split('>').map((part) => part.trim())
      const fromNode = nodes.find((node) => node.label.toLowerCase() === from?.toLowerCase())
      const toNode = nodes.find((node) => node.label.toLowerCase() === to?.toLowerCase())
      return fromNode && toNode ? { from: fromNode.id, to: toNode.id, label: labelParts.join(' > ') || 'network link' } : null
    }).filter((link): link is { from: string; to: string; label: string } => Boolean(link))
    const { error: insertError } = await supabase.from('network_diagrams').insert({ name, description, diagram_json: { nodes, links }, is_published: formData.get('is_published') === 'on' })
    if (insertError) { setError(insertError.message); return }
    setDiagramDialogOpen(false)
    await loadDashboard()
  }

  const outstandingTotal = invoices.reduce((total, invoice) => total + Number(invoice.amount), 0)
  const weeklyMinutes = timeEntries.reduce((total, entry) => total + entry.minutes, 0)
  const weeklyHours = Math.floor(weeklyMinutes / 60)
  const remainingMinutes = weeklyMinutes % 60
  const nextAppointment = agenda[0]
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'
  const profileInitials = profileName.split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase()
  const notificationItems = activity.slice(0, 5).map((item, index) => ({ ...item, notificationId: item.id ?? `${item.title}-${index}` }))
  const unreadNotifications = notificationItems.filter((item) => !notificationsRead.includes(item.notificationId))

  const remainingLockSeconds = lockUntilTime ? Math.max(Math.ceil((lockUntilTime - Date.now()) / 1000), 0) : 0

  if (window.location.pathname === '/chat') return <PublicChatPage />

  if (!securityReady || !workspaceUnlocked) {
    return (
      <div className="pin-lock-screen">
        <div className="pin-lock-panel">
          <div className="pin-lock-header">
            <div className="workspace-mark">T</div>
            <div>
              <p className="overline">Secure access</p>
              <h1>Tennahub Workspace</h1>
            </div>
          </div>
          <div className="pin-profile"><div className="avatar avatar-small">{profileInitials}</div><div><span>PIN assigned to</span><strong>{profileName}</strong></div></div>
          <p className="pin-lock-copy">Enter the 4-digit workspace PIN to unlock the studio. Failed attempts trigger a persistent 1-minute lockout.</p>
          <form className="pin-lock-form" onSubmit={handleWorkspacePinSubmit}>
            <label>
              Workspace PIN
              <input
                type="password"
                inputMode="numeric"
                maxLength={PIN_LENGTH}
                pattern="\d*"
                value={pinInput}
                onChange={(event) => setPinInput(event.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH))}
                placeholder="••••"
                autoComplete="one-time-code"
                autoFocus
              />
            </label>
            {pinMessage && <p className="pin-status">{pinMessage}</p>}
            {lockUntilTime && <p className="pin-status warning">Locked for {remainingLockSeconds}s</p>}
            <button className="new-button modal-submit" type="submit" disabled={Boolean(lockUntilTime)}>
              Unlock workspace
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="brand-lockup">
          <img src="/assets/tennahub_wordmark.svg" alt="Tennahub" />
          <button className="icon-button collapse-toggle" onClick={() => setSidebarCollapsed((prev) => !prev)} aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {sidebarCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
          <button className="icon-button mobile-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>
        <div className="workspace-switcher">
          <div className="workspace-mark">T</div>
          <div><span className="eyebrow">Workspace</span><strong>Tennahub Studio</strong></div>
          <ChevronDown size={16} className="muted-icon" />
        </div>
        <nav className="nav-section" aria-label="Main navigation">
          <span className="nav-label">Workspace</span>
          {navItems.map(({ label, icon: Icon, count }) => (
            <button key={label} className={`nav-item ${activeNav === label ? 'active' : ''}`} onClick={() => { setActiveNav(label); setSidebarOpen(false) }}>
              <Icon size={18} strokeWidth={activeNav === label ? 2.4 : 1.8} /><span>{label}</span>{count && <em>{label === 'Projects' && !loading ? projects.length : label === 'Delivery' && !loading ? tasks.filter((task) => task.status !== 'Done').length : count}</em>}
            </button>
          ))}
        </nav>
        <nav className="nav-section secondary-nav" aria-label="Tools">
          <span className="nav-label">Tools</span>
          {utilityItems.map(({ label, icon: Icon }) => <button key={label} className="nav-item" onClick={() => setActiveNav(label)}><Icon size={18} /><span>{label}</span></button>)}
        </nav>
        <div className="sidebar-spacer" />
        <div className="storage-card"><div className="storage-header"><Cloud size={16} /><span>Storage</span><strong>68%</strong></div><div className="storage-track"><span /></div><p>6.8 GB of 10 GB used</p></div>
        <button className="profile-row" onClick={() => setProfileDialogOpen(true)}><div className="avatar avatar-small">{profileInitials}</div><div className="profile-copy"><strong>{profileName}</strong><span>{profileRole}</span></div><Settings2 size={17} className="muted-icon" /></button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="icon-button menu-trigger" onClick={() => { setSidebarCollapsed(false); setSidebarOpen(true) }} aria-label="Open menu"><Menu size={20} /></button>
          <div className="breadcrumb"><span>Workspace</span><span>/</span><strong>{activeNav}</strong></div>
          <div className="topbar-actions"><button className="icon-button search-trigger" aria-label="Search"><Search size={19} /></button><div className="notification-wrap"><button className="icon-button notification-trigger" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((open) => !open)}><Bell size={19} />{unreadNotifications.length > 0 && <i />}</button>{notificationsOpen && <div className="notification-panel"><div className="notification-panel-header"><div><p className="overline">Workspace</p><strong>Notifications</strong></div>{unreadNotifications.length > 0 && <button type="button" className="text-button" onClick={() => setNotificationsRead(notificationItems.map((item) => item.notificationId))}>Mark all read</button>}</div>{notificationItems.length ? notificationItems.map((item) => <button type="button" className={`notification-item ${notificationsRead.includes(item.notificationId) ? 'read' : ''}`} key={item.notificationId} onClick={() => setNotificationsRead((current) => current.includes(item.notificationId) ? current : [...current, item.notificationId])}><span className={`notification-icon ${item.tone}`}><item.icon size={15} /></span><span><strong>{item.title}</strong><small>{item.detail}</small><time>{item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : item.time}</time></span></button>) : <p className="notification-empty">No new activity yet.</p>}</div>}</div>{workspaceUnlocked && (authenticated ? <button className="auth-button" onClick={() => void signOut()}><LogOut size={16} /> Sign out</button> : <button className="auth-button" onClick={() => setAuthDialogOpen(true)}><LogIn size={16} /> Sign in</button>)}<button className="new-button" onClick={() => setDialogOpen(true)}><Plus size={17} /> New item</button></div>
        </header>

        <div className="page-content">
          {activeNav === 'Projects' ? <section className="projects-page"><div className="page-title-row"><div><p className="overline">Workspace</p><h1>Projects<span className="title-dot">.</span></h1><p className="subheading">Keep every engagement moving from kickoff to delivery.</p></div><button className="new-button" onClick={() => setDialogOpen(true)}><Plus size={17} /> New project</button></div><div className="project-toolbar"><label className="search-field"><Search size={16} /><input value={projectQuery} onChange={(event) => setProjectQuery(event.target.value)} placeholder="Search projects" /></label><select value={projectStatus} onChange={(event) => setProjectStatus(event.target.value)} aria-label="Filter projects by status"><option>All</option><option>On track</option><option>Review needed</option><option>At risk</option><option>Complete</option></select></div><section className="projects-list panel"><div className="projects-list-heading"><div><p className="overline">{visibleProjects.length} of {projects.length} shown</p><h2>Project pipeline</h2></div><span className="live-label"><i /> Live data</span></div><div className="table-head"><span>Project</span><span>Progress</span><span>Status</span><span>Due date</span><span /></div>{visibleProjects.length ? visibleProjects.map((project) => <div className="project-row" key={project.id ?? project.name}><div className="project-identity"><div className="project-logo" style={{ backgroundColor: project.color }}>{project.initials}</div><div><strong>{project.name}</strong><span>{project.client} <b>·</b> {project.type}</span></div></div><div className="progress-cell"><div className="progress-meta"><span>{project.progress}%</span><span>{project.progress > 80 ? 'Nearly there' : 'In progress'}</span></div><div className="progress-track"><span style={{ width: `${project.progress}%`, backgroundColor: project.color }} /></div></div><span className={`status-pill ${project.status === 'On track' ? 'status-green' : 'status-orange'}`}><i />{project.status}</span><span className="due-date">{project.due}</span><button className="icon-button row-more" aria-label={`More options for ${project.name}`}><MoreHorizontal size={17} /></button></div>) : <p className="empty-state">No projects match this view.</p>}</section></section> : activeNav === 'Overview' ? <>
          <section className="welcome-row"><div><p className="overline">{new Date().toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p><h1>{greeting}, Alex<span className="title-dot">.</span></h1><p className="subheading">Here is what is moving across your studio today.</p></div><button className="date-button"><CalendarDays size={17} /> This week <ChevronDown size={15} /></button></section>
          {error && <div className="data-notice" role="alert"><span>Showing the last available view. {error}</span><button onClick={() => void loadDashboard()}>Retry</button></div>}

          <section className="metric-grid" aria-label="Workspace summary">
            <article className="metric-card accent-green"><div className="metric-top"><span>Active projects</span><div className="metric-icon"><BriefcaseBusiness size={17} /></div></div><strong>{loading ? '--' : String(projects.length).padStart(2, '0')}</strong><p><span className="trend-up">Live</span> from Supabase</p></article>
            <article className="metric-card accent-amber"><div className="metric-top"><span>Outstanding</span><div className="metric-icon"><CircleDollarSign size={17} /></div></div><strong>{loading ? '--' : formatCurrency(outstandingTotal)}</strong><p><span className="trend-neutral">{loading ? '--' : invoices.length} invoices</span> awaiting payment</p></article>
            <article className="metric-card accent-blue"><div className="metric-top"><span>Hours this week</span><div className="metric-icon"><Clock3 size={17} /></div></div><strong>{loading ? '--' : weeklyHours}<span className="metric-unit">h</span> {loading ? '--' : remainingMinutes}<span className="metric-unit">m</span></strong><p><span className="trend-up">Live</span> from time entries</p></article>
            <article className="metric-card accent-coral"><div className="metric-top"><span>Next appointment</span><div className="metric-icon"><CalendarDays size={17} /></div></div><strong>{loading ? '--' : nextAppointment ? formatTime(nextAppointment.starts_at) : 'None'}</strong><p>{nextAppointment ? `${nextAppointment.client_name} · ${nextAppointment.title}` : 'No appointments scheduled'}</p></article>
          </section>

          <div className="content-grid">
            <section className="projects-panel panel"><div className="panel-heading"><div><p className="overline">Your pipeline</p><h2>Active projects</h2></div><button className="text-button" onClick={() => setActiveNav('Projects')}>View all <ArrowUpRight size={15} /></button></div><div className="table-head"><span>Project</span><span>Progress</span><span>Status</span><span>Due date</span><span /></div>{projects.map((project) => <div className="project-row" key={project.name}><div className="project-identity"><div className="project-logo" style={{ backgroundColor: project.color }}>{project.initials}</div><div><strong>{project.name}</strong><span>{project.client} <b>·</b> {project.type}</span></div></div><div className="progress-cell"><div className="progress-meta"><span>{project.progress}%</span><span>{project.progress > 80 ? 'Nearly there' : 'In progress'}</span></div><div className="progress-track"><span style={{ width: `${project.progress}%`, backgroundColor: project.color }} /></div></div><div><span className={`status-pill ${project.status === 'On track' ? 'status-green' : 'status-orange'}`}><i />{project.status}</span></div><span className="due-date">{project.due}</span><button className="icon-button row-more" aria-label={`More options for ${project.name}`}><MoreHorizontal size={17} /></button></div>)}</section>

            <aside className="right-column"><section className="agenda-panel panel"><div className="panel-heading"><div><p className="overline">Your day</p><h2>Agenda</h2></div><button className="icon-button" aria-label="Agenda options"><MoreHorizontal size={18} /></button></div><div className="agenda-date"><strong>{agenda[0] ? new Date(agenda[0].starts_at).toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase() : 'TODAY'}</strong><span>{agenda[0] ? new Date(agenda[0].starts_at).getDate() : '--'}</span><small>{agenda[0] ? new Date(agenda[0].starts_at).toLocaleDateString('en-GB', { month: 'long' }).toUpperCase() : 'AGENDA'}</small></div>{agenda.length ? agenda.map((item) => <div className="agenda-item" key={item.id}><span className="agenda-time">{formatTime(item.starts_at)}</span><div className={`agenda-line ${item.accent}-line`} /><div><strong>{item.title}</strong><span>{item.client_name} · {item.meeting_type}</span></div></div>) : <p className="empty-state">No appointments scheduled.</p>}<button className="agenda-footer">Open calendar <ArrowUpRight size={15} /></button></section><section className="activity-panel panel"><div className="panel-heading"><div><p className="overline">Live feed</p><h2>Recent activity</h2></div><Activity size={18} className="muted-icon" /></div>{activity.map(({ title, detail, time, icon: Icon, tone, created_at }) => <div className="activity-item" key={title}><div className={`activity-icon ${tone}`}><Icon size={16} /></div><div><strong>{title}</strong><span>{detail}</span></div><time>{created_at ? new Date(created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : time}</time></div>)}<button className="activity-footer">See all activity <ArrowUpRight size={15} /></button></section></aside>
          </div>
          </> : <SecondaryPage activeNav={activeNav} clients={clients} infrastructure={infrastructure} diagrams={diagrams} secrets={secrets} invoices={invoices} timeEntries={timeEntries} expenses={expenses} quotes={quotes} receipts={receipts} agenda={agenda} documents={documents} credentials={credentials} milestones={milestones} tasks={tasks} reviews={reviews} githubConnections={githubConnections} githubRepositories={githubRepositories} supabaseAccounts={supabaseAccounts} monitoringChecks={monitoringChecks} authenticated={authenticated} onCreateAppointment={() => setCalendarDialogOpen(true)} onCreateTask={() => setTaskDialogOpen(true)} onCreateDiagram={() => setDiagramDialogOpen(true)} onConnectGithub={connectGithub} onSignIn={() => setAuthDialogOpen(true)} />}
          <footer className="page-footer"><span><span className="online-dot" /> All systems operational</span><span>Tennahub Workspace <b>·</b> v0.1</span></footer>
        </div>
      </main>
      {dialogOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setDialogOpen(false) }}><form className="project-modal" onSubmit={createProject}><div className="modal-heading"><div><p className="overline">Workspace</p><h2>Start a project</h2></div><button type="button" className="icon-button" aria-label="Close dialog" onClick={() => setDialogOpen(false)}><X size={18} /></button></div><label>Project name<input name="name" required autoFocus placeholder="e.g. New brand system" /></label><label>Client<input name="client_name" required placeholder="e.g. Northstar Legal" /></label><label>Type<input name="project_type" defaultValue="Web build" /></label><label>Due date<input name="due_date" type="date" /></label><button className="new-button modal-submit" type="submit"><Plus size={17} /> Create project</button></form></div>}
      {calendarDialogOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setCalendarDialogOpen(false) }}><form className="project-modal" onSubmit={createAppointment}><div className="modal-heading"><div><p className="overline">Calendar</p><h2>Schedule appointment</h2></div><button type="button" className="icon-button" aria-label="Close appointment dialog" onClick={() => setCalendarDialogOpen(false)}><X size={18} /></button></div><label>Appointment title<input name="title" required autoFocus placeholder="e.g. Project review" /></label><label>Client<input name="client_name" required placeholder="e.g. Northstar Legal" /></label><label>Meeting type<select name="meeting_type" defaultValue="Video call"><option>Video call</option><option>Meet</option><option>In person</option></select></label><label>Date and time<input name="starts_at" required type="datetime-local" /></label><label>Accent<select name="accent" defaultValue="green"><option value="green">Green</option><option value="orange">Orange</option><option value="blue">Blue</option></select></label><button className="new-button modal-submit" type="submit"><CalendarDays size={17} /> Schedule appointment</button></form></div>}
      {taskDialogOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setTaskDialogOpen(false) }}><form className="project-modal" onSubmit={createTask}><div className="modal-heading"><div><p className="overline">Delivery</p><h2>Add task</h2></div><button type="button" className="icon-button" aria-label="Close task dialog" onClick={() => setTaskDialogOpen(false)}><X size={18} /></button></div><label>Task title<input name="title" required autoFocus placeholder="e.g. Prepare client handoff" /></label><label>Project<select name="project_id" defaultValue=""><option value="">No project</option>{projects.map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}</select></label><label>Priority<select name="priority" defaultValue="Normal"><option>Low</option><option>Normal</option><option>High</option><option>Urgent</option></select></label><label>Assigned to<input name="assigned_to" placeholder="e.g. Alex Morgan" /></label><label>Due date<input name="due_date" type="date" /></label><button className="new-button modal-submit" type="submit"><ListChecks size={17} /> Add task</button></form></div>}
      {authDialogOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setAuthDialogOpen(false) }}><form className="project-modal auth-modal" onSubmit={signIn}><div className="modal-heading"><div><p className="overline">Private workspace</p><h2>Sign in to Tennahub</h2></div><button type="button" className="icon-button" aria-label="Close sign in dialog" onClick={() => setAuthDialogOpen(false)}><X size={18} /></button></div><p className="auth-intro">Use a magic link to access credentials, integrations, and client records securely.</p><label>Email address<input name="email" type="email" required value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="you@company.com" /></label>{authMessage && <p className="auth-message">{authMessage}</p>}<button className="new-button modal-submit" type="submit"><Mail size={17} /> Email me a sign-in link</button></form></div>}
      {profileDialogOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setProfileDialogOpen(false) }}><form className="project-modal profile-modal" onSubmit={(event) => { event.preventDefault(); window.localStorage.setItem('tennahub-profile-name', profileName.trim() || DEFAULT_PROFILE_NAME); window.localStorage.setItem('tennahub-profile-role', profileRole.trim() || 'Owner'); setProfileDialogOpen(false) }}><div className="modal-heading"><div><p className="overline">Workspace identity</p><h2>Edit your profile</h2></div><button type="button" className="icon-button" aria-label="Close profile settings" onClick={() => setProfileDialogOpen(false)}><X size={18} /></button></div><label>Display name<input value={profileName} onChange={(event) => setProfileName(event.target.value)} placeholder="Alex Morgan" required /></label><label>Role<input value={profileRole} onChange={(event) => setProfileRole(event.target.value)} placeholder="Owner" required /></label><button className="new-button modal-submit" type="submit"><Settings2 size={16} /> Save profile</button></form></div>}
      {diagramDialogOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setDiagramDialogOpen(false) }}><form className="project-modal diagram-modal" onSubmit={createDiagram}><div className="modal-heading"><div><p className="overline">Infrastructure</p><h2>New network diagram</h2></div><button type="button" className="icon-button" aria-label="Close diagram dialog" onClick={() => setDiagramDialogOpen(false)}><X size={18} /></button></div><p className="auth-intro">Create a client-safe topology. Keep passwords and keys in the protected vault, never in the diagram.</p><label>Diagram name<input name="name" required autoFocus placeholder="e.g. Main campus topology" /></label><label>Description<input name="description" placeholder="What this plan explains" /></label><label>Devices or zones<input name="nodes" required placeholder="Internet, Core switch, Server room, Wi-Fi" /></label><label>Connections<input name="connections" placeholder="Internet > Core switch > WAN, Core switch > Wi-Fi > PoE" /></label><label className="checkbox-label"><input name="is_published" type="checkbox" /> Publish this safe topology to the client portal</label><button className="new-button modal-submit" type="submit"><Network size={17} /> Save network diagram</button></form></div>}
    </div>
  )
}

export default App
