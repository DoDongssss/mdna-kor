import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';

// Reusable component for the 3D perspective image cards to keep the main code clean
const TiltCard = ({ src, alt, baseTransform, className, style = {} }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-zinc-200 bg-white group cursor-pointer ${className}`}
      style={{
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        transform: baseTransform,
        transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease",
        ...style
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1.02)";
        e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = baseTransform;
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
      }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      {/* Dark gradient overlay for better contrast if text is added later */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-zinc-900/10 to-transparent pointer-events-none z-10 transition-opacity duration-300 group-hover:opacity-70" />
    </div>
  );
};

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row relative bg-zinc-50 overflow-hidden text-zinc-900">
      
      {/* ================= LEFT PANEL ================= */}
      <div className="w-full lg:w-[55%] flex flex-col justify-between px-6 py-10 lg:px-14 lg:py-12 bg-white relative z-10 shadow-xl shadow-zinc-200/50 lg:shadow-none lg:border-r border-zinc-100">
        
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-red-100 rounded-full opacity-60 mix-blend-multiply blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-red-50 rounded-full mix-blend-multiply blur-2xl" />
          <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-red-200 to-transparent" />
          
          {/* Dot pattern matrix */}
          <div className="hidden md:block">
            {[...Array(6)].map((_, row) =>
              [...Array(4)].map((_, col) => (
                <div
                  key={`dot-${row}-${col}`}
                  className="absolute w-1.5 h-1.5 bg-zinc-200 rounded-full"
                  style={{ top: `${15 + row * 14}%`, right: `${8 + col * 6}%` }}
                />
              ))
            )}
          </div>
        </div>

        {/* MIDDLE: Main content */}
        <div className="relative flex flex-col gap-8 flex-1 justify-center my-12 lg:my-0 max-w-2xl mx-auto lg:mx-0">
          
          {/* Badge */}
          <div className="flex items-center gap-2 w-fit px-4 py-2 rounded-full border border-red-200/60 text-red-500 text-xs font-bold tracking-widest uppercase bg-red-50/50 backdrop-blur-sm shadow-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Est. Koronadal City
          </div>

          {/* Title Area */}
          <div className="flex flex-col gap-1">
            <p className="text-zinc-400 text-sm tracking-[0.3em] uppercase mb-2 font-medium">Welcome to</p>
            <h1 
              className="text-zinc-900 font-black leading-none tracking-tighter italic"
              style={{ fontSize: "clamp(3rem, 6vw, 5rem)" }}
            >
              Malaysian
            </h1>
            <h1
              className="font-black leading-none tracking-tighter pb-2"
              style={{
                fontSize: "clamp(3rem, 6vw, 5rem)",
                background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              DNA
            </h1>
            
            <div className="flex items-center gap-4 mt-4 opacity-80">
              <div className="h-px w-12 bg-red-500" />
              <p className="text-zinc-500 text-xs font-bold tracking-[0.2em] uppercase">Zone: Koronadal</p>
              <div className="h-px flex-1 bg-gradient-to-r from-zinc-200 to-transparent" />
            </div>
          </div>

          {/* Tagline */}
          <div className="relative pl-5 py-1">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-red-200 rounded-full" />
            <p className="text-zinc-600 text-xl lg:text-2xl font-medium italic leading-relaxed">
              "Built to inspire, <br className="hidden sm:block lg:hidden" /> not to impress."
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mt-2">
            <button className="flex items-center gap-2 py-3 px-6 rounded-lg text-white text-sm font-bold tracking-wide transition-all hover:-translate-y-0.5 hover:shadow-lg bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-red-600/30">
              Explore Archive
              <ArrowRight size={16} className="text-red-100" />
            </button>
            <button className="flex items-center gap-2 py-3 px-6 rounded-lg border-2 border-zinc-200 text-zinc-600 text-sm font-bold tracking-wide transition-all hover:border-red-200 hover:text-red-600 hover:bg-red-50 hover:-translate-y-0.5 bg-white">
              <BookOpen size={16} />
              Our Story
            </button>
          </div>
        </div>

        {/* BOTTOM: Stats strip */}
        <div className="relative grid grid-cols-2 gap-y-8 lg:flex w-full border-t border-zinc-100 pt-8 mt-8 lg:mt-0">
          {[
            ["10+", "Years"], 
            ["500+", "Members"], 
            ["∞", "Culture"], 
            ["1", "Community"]
          ].map(([num, label], i, arr) => (
            <div 
              key={label} 
              className={`flex-1 flex flex-col items-center justify-center
                ${i % 2 === 0 ? "border-r border-zinc-100 lg:border-r" : ""} 
                ${i !== arr.length - 1 && i % 2 !== 0 ? "lg:border-r border-zinc-100" : ""}
              `}
            >
              <span className="text-zinc-900 text-3xl font-black mb-1">{num}</span>
              <span className="text-zinc-400 text-xs font-bold tracking-widest uppercase">{label}</span>
            </div>
          ))}
        </div>
        
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center gap-6 px-6 py-12 lg:px-12 bg-zinc-50/50">
        
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl lg:max-w-none">
          {/* Top Left Card */}
          <TiltCard
            src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=800&auto=format&fit=crop"
            alt="Community gathering"
            className="flex-1 h-56 sm:h-64"
            baseTransform="perspective(800px) rotateX(4deg) rotateY(-6deg)"
          />

          {/* Top Right Card */}
          <TiltCard
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop"
            alt="Team collaboration"
            className="flex-1 h-56 sm:h-64"
            baseTransform="perspective(800px) rotateX(4deg) rotateY(6deg)"
          />
        </div>

        {/* Bottom Wide Card */}
        <TiltCard
          src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1200&auto=format&fit=crop"
          alt="Large group photo"
          className="w-full max-w-2xl lg:max-w-none h-64 sm:h-[350px]"
          baseTransform="perspective(1000px) rotateX(6deg)"
        />
        
      </div>
    </div>
  );
}