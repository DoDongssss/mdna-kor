import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import * as THREE from 'three'
import { getUpcomingEvents } from '../lib/events'
import type { ClubEvent, EventType } from '../types/events'
import { formatDate } from '../utils/formatDate'
import { formatCurrency } from '../utils/formatCurrency'
import { supabase } from '../supabase/client'

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  meetup:       'Meetup',
  charity_ride: 'Charity Ride',
  announcement: 'Announcement',
  other:        'Other',
}

// ── Three.js Hero Component ───────────────────────────────────────

const HeroCanvas = () => {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return

    const W = mountRef.current.clientWidth
    const H = mountRef.current.clientHeight

    // Scene
    const scene    = new THREE.Scene()
    const camera   = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })

    renderer.setSize(W, H)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)
    camera.position.z = 5

    // ── Rings ──────────────────────────────────────────────────────
    const rings: THREE.Mesh[] = []
    const RING_COLORS = [0xCC0001, 0x003893, 0xFFD100, 0xffffff]

    for (let i = 0; i < 6; i++) {
      const geometry = new THREE.TorusGeometry(
        1.2 + i * 0.6,   // radius
        0.015 + Math.random() * 0.02, // tube
        16,
        100
      )
      const material = new THREE.MeshBasicMaterial({
        color:       RING_COLORS[i % RING_COLORS.length],
        transparent: true,
        opacity:     0.15 + Math.random() * 0.25,
      })
      const ring = new THREE.Mesh(geometry, material)
      ring.rotation.x = Math.random() * Math.PI
      ring.rotation.y = Math.random() * Math.PI
      scene.add(ring)
      rings.push(ring)
    }

    // ── Particles ──────────────────────────────────────────────────
    const PARTICLE_COUNT = 600
    const positions      = new Float32Array(PARTICLE_COUNT * 3)
    const colors         = new Float32Array(PARTICLE_COUNT * 3)

    const particleColors = [
      new THREE.Color(0xCC0001), // red
      new THREE.Color(0x003893), // blue
      new THREE.Color(0xFFD100), // gold
      new THREE.Color(0xffffff), // white
    ]

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 14
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8

      const c = particleColors[Math.floor(Math.random() * particleColors.length)]
      colors[i * 3]     = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }

    const particleGeo = new THREE.BufferGeometry()
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeo.setAttribute('color',    new THREE.BufferAttribute(colors, 3))

    const particleMat = new THREE.PointsMaterial({
      size:         0.05,
      vertexColors: true,
      transparent:  true,
      opacity:      0.7,
    })

    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    // ── Center glow sphere ─────────────────────────────────────────
    const glowGeo = new THREE.SphereGeometry(0.3, 32, 32)
    const glowMat = new THREE.MeshBasicMaterial({
      color:       0xFFD100,
      transparent: true,
      opacity:     0.12,
    })
    const glow = new THREE.Mesh(glowGeo, glowMat)
    scene.add(glow)

    // ── Mouse interaction ──────────────────────────────────────────
    const mouse = { x: 0, y: 0 }
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / W) * 2 - 1
      mouse.y = -(e.clientY / H) * 2 + 1
    }
    window.addEventListener('mousemove', onMouseMove)

    // ── Animation ──────────────────────────────────────────────────
    let animId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      rings.forEach((ring, i) => {
        ring.rotation.x += 0.001 * (i % 2 === 0 ? 1 : -1)
        ring.rotation.y += 0.002 * (i % 3 === 0 ? 1 : -1)
        ring.rotation.z += 0.0005
      })

      particles.rotation.y = t * 0.04
      particles.rotation.x = t * 0.02

      // Gentle camera drift with mouse
      camera.position.x += (mouse.x * 0.5 - camera.position.x) * 0.02
      camera.position.y += (mouse.y * 0.3 - camera.position.y) * 0.02
      camera.lookAt(scene.position)

      // Glow pulse
      glowMat.opacity = 0.08 + Math.sin(t * 1.5) * 0.06

      renderer.render(scene, camera)
    }

    animate()

    // ── Resize ─────────────────────────────────────────────────────
    const onResize = () => {
      if (!mountRef.current) return
      const W2 = mountRef.current.clientWidth
      const H2 = mountRef.current.clientHeight
      camera.aspect = W2 / H2
      camera.updateProjectionMatrix()
      renderer.setSize(W2, H2)
    }
    window.addEventListener('resize', onResize)

    // ── Cleanup ────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full"
    />
  )
}

// ── Landing Page ──────────────────────────────────────────────────

const LandingPage = () => {
  const [events, setEvents]           = useState<ClubEvent[]>([])
  const [netBalance, setNetBalance]   = useState<number>(0)
  const [memberCount, setMemberCount] = useState<number>(0)
  const [isLoading, setIsLoading]     = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [eventsData, fundData, membersData] = await Promise.all([
          getUpcomingEvents(),
          supabase.from('fund_summary').select('*').single(),
          supabase
            .from('members')
            .select('id', { count: 'exact' })
            .is('deleted_at', null)
            .eq('is_active', true),
        ])
        setEvents(eventsData.slice(0, 3))
        setNetBalance(fundData.data?.net_balance ?? 0)
        setMemberCount(membersData.count ?? 0)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="bg-white">

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0f]">
        {/* Three.js canvas */}
        <HeroCanvas />

        {/* Malaysian flag color bar at top */}
        <div className="absolute top-0 left-0 right-0 h-1 flex z-10">
          <div className="flex-1 bg-[#CC0001]" />
          <div className="flex-1 bg-[#FFD100]" />
          <div className="flex-1 bg-[#003893]" />
          <div className="flex-1 bg-white" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFD100] animate-pulse" />
            <span className="text-[11px] text-white/60 tracking-[0.2em] uppercase font-medium">
              Malaysian DNA · Philippines Chapter
            </span>
          </div>

          {/* Club name */}
          <h1
            className="text-white mb-2 font-black tracking-tight leading-none"
            style={{ fontSize: 'clamp(3.5rem, 12vw, 9rem)' }}
          >
            MDNA
            <span className="text-[#FFD100]"> KOR</span>
          </h1>

          {/* Full name */}
          <p className="text-white/30 text-sm tracking-[0.3em] uppercase mb-6 font-medium">
            Malaysian DNA Motorcycle Club
          </p>

          {/* Tagline */}
          <p className="text-white/70 text-lg md:text-xl font-light mb-10 max-w-lg mx-auto leading-relaxed">
            Built to inspire, not to impress.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/events"
              className="bg-[#CC0001] hover:bg-red-700 text-white text-sm font-semibold px-8 py-3 rounded-xl transition-all hover:scale-105 shadow-lg shadow-red-900/30"
            >
              View Events
            </Link>
            <Link
              to="/transparency"
              className="bg-white/5 hover:bg-white/10 border border-white/20 text-white text-sm font-semibold px-8 py-3 rounded-xl transition-all hover:scale-105"
            >
              Fund Transparency
            </Link>
          </div>

        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <span className="text-white/30 text-[10px] tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10" />
      </section>

      {/* ── Stats Bar ──────────────────────────────────────────────── */}
      <section className="bg-white border-b border-stone-100 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="group">
              <p className="text-3xl font-black text-[#0a0a0f] mb-1">
                {isLoading ? '—' : memberCount}
              </p>
              <div className="w-8 h-0.5 bg-[#CC0001] mx-auto mb-2 group-hover:w-12 transition-all" />
              <p className="text-[11px] text-stone-400 uppercase tracking-widest font-medium">
                Active Members
              </p>
            </div>
            <div className="group">
              <p className="text-3xl font-black text-[#0a0a0f] mb-1">
                {isLoading ? '—' : formatCurrency(netBalance)}
              </p>
              <div className="w-8 h-0.5 bg-[#FFD100] mx-auto mb-2 group-hover:w-12 transition-all" />
              <p className="text-[11px] text-stone-400 uppercase tracking-widest font-medium">
                Club Fund
              </p>
            </div>
            <div className="group">
              <p className="text-3xl font-black text-[#0a0a0f] mb-1">
                {isLoading ? '—' : events.length}
              </p>
              <div className="w-8 h-0.5 bg-[#003893] mx-auto mb-2 group-hover:w-12 transition-all" />
              <p className="text-[11px] text-stone-400 uppercase tracking-widest font-medium">
                Upcoming Events
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── About ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-0.5 bg-[#CC0001]" />
                <p className="text-[11px] text-[#CC0001] tracking-[0.2em] uppercase font-bold">
                  Our Story
                </p>
              </div>
              <h2 className="text-3xl font-black text-[#0a0a0f] mb-5 leading-tight">
                Malaysian DNA.<br />
                <span className="text-[#003893]">Philippine Heart.</span>
              </h2>
              <p className="text-stone-500 leading-relaxed mb-4 text-sm">
                MDNA KOR is a motorcycle club born from a deep admiration of
                Malaysian riding culture. Founded in the Philippines, we carry
                the spirit of the Malaysian brotherhood — discipline, pride,
                and unity — into every ride.
              </p>
              <p className="text-stone-500 leading-relaxed text-sm">
                We are not just a club. We are a statement. Built to inspire
                those around us, not to impress them. Every kilometer we ride
                is a testament to that commitment.
              </p>
              <div className="flex items-center gap-4 mt-8">
                <div className="text-center">
                  <p className="text-xl font-black text-[#CC0001]">100%</p>
                  <p className="text-[10px] text-stone-400 uppercase tracking-wider">Transparent</p>
                </div>
                <div className="w-px h-10 bg-stone-200" />
                <div className="text-center">
                  <p className="text-xl font-black text-[#003893]">PH</p>
                  <p className="text-[10px] text-stone-400 uppercase tracking-wider">Based</p>
                </div>
                <div className="w-px h-10 bg-stone-200" />
                <div className="text-center">
                  <p className="text-xl font-black text-[#FFD100]">MY</p>
                  <p className="text-[10px] text-stone-400 uppercase tracking-wider">Inspired</p>
                </div>
              </div>
            </div>

            {/* Photo placeholder with Malaysian flag accent */}
            <div className="relative">
              <div className="bg-stone-100 rounded-2xl h-72 flex items-center justify-center overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-1 flex">
                  <div className="flex-1 bg-[#CC0001]" />
                  <div className="flex-1 bg-[#FFD100]" />
                  <div className="flex-1 bg-[#003893]" />
                </div>
                <p className="text-stone-400 text-sm">Club photo coming soon</p>
              </div>
              {/* Accent border */}
              <div className="absolute -bottom-3 -right-3 w-full h-full border-2 border-[#CC0001]/20 rounded-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Upcoming Events ────────────────────────────────────────── */}
      {events.length > 0 && (
        <section className="py-20 px-6 bg-[#f8f8fa]">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-0.5 bg-[#FFD100]" />
                  <p className="text-[11px] text-[#003893] tracking-[0.2em] uppercase font-bold">
                    What's Coming
                  </p>
                </div>
                <h2 className="text-3xl font-black text-[#0a0a0f]">
                  Upcoming Events
                </h2>
              </div>
              <Link
                to="/events"
                className="text-sm text-[#CC0001] font-semibold hover:underline"
              >
                View all →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {events.map((event, i) => (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl border border-stone-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-1 h-8 rounded-full ${
                      i === 0 ? 'bg-[#CC0001]' :
                      i === 1 ? 'bg-[#003893]' :
                                'bg-[#FFD100]'
                    }`} />
                    <span className="text-[10px] text-stone-400 uppercase tracking-widest font-medium">
                      {EVENT_TYPE_LABELS[event.type]}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#0a0a0f] mb-2">
                    {event.title}
                  </h3>
                  <p className="text-xs text-stone-400 mb-1">
                    📅 {formatDate(event.date)}
                  </p>
                  {event.location && (
                    <p className="text-xs text-stone-400">
                      📍 {event.location}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Transparency Teaser ─────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-[#0a0a0f] rounded-3xl p-10 overflow-hidden text-center">

            {/* Background accent */}
            <div className="absolute top-0 left-0 right-0 h-1 flex">
              <div className="flex-1 bg-[#CC0001]" />
              <div className="flex-1 bg-[#FFD100]" />
              <div className="flex-1 bg-[#003893]" />
              <div className="flex-1 bg-white/20" />
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 bg-[#FFD100]/3 rounded-3xl" />

            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-8 h-0.5 bg-[#FFD100]" />
                <p className="text-[11px] text-[#FFD100] tracking-[0.2em] uppercase font-bold">
                  Open Books
                </p>
                <div className="w-8 h-0.5 bg-[#FFD100]" />
              </div>

              <h2 className="text-3xl font-black text-white mb-2">
                Club Fund Balance
              </h2>
              <p className="text-white/40 text-sm mb-6">
                Every peso is accounted for. Always.
              </p>

              <p className={`text-5xl font-black my-6 ${
                netBalance >= 0 ? 'text-white' : 'text-[#CC0001]'
              }`}>
                {isLoading ? '...' : formatCurrency(netBalance)}
              </p>

              <p className="text-white/40 text-sm mb-8 max-w-sm mx-auto">
                Every contribution and expense is recorded and made publicly
                available. Nothing hidden, nothing fabricated.
              </p>

              <Link
                to="/transparency"
                className="inline-flex items-center gap-2 bg-[#FFD100] hover:bg-yellow-400 text-[#0a0a0f] text-sm font-black px-8 py-3 rounded-xl transition-all hover:scale-105 shadow-lg shadow-yellow-500/20"
              >
                View Full Report →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="bg-[#0a0a0f] px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-white font-black text-lg">
                MNDA <span className="text-[#FFD100]">KOR</span>
              </h3>
              <p className="text-white/30 text-xs mt-0.5">
                Malaysian DNA Motorcycle Club
              </p>
            </div>
            <div className="flex items-center gap-6">
              <Link
                to="/events"
                className="text-white/40 hover:text-white text-xs transition-colors"
              >
                Events
              </Link>
              <Link
                to="/transparency"
                className="text-white/40 hover:text-white text-xs transition-colors"
              >
                Transparency
              </Link>
              <Link
                to="/login"
                className="text-white/40 hover:text-white text-xs transition-colors"
              >
                Admin
              </Link>
            </div>
          </div>
          <div className="border-t border-white/5 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-white/20 text-xs">
              © {new Date().getFullYear()} MNDA KOR. All rights reserved.
            </p>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full bg-[#CC0001]" />
              <div className="w-3 h-3 rounded-full bg-[#FFD100]" />
              <div className="w-3 h-3 rounded-full bg-[#003893]" />
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default LandingPage