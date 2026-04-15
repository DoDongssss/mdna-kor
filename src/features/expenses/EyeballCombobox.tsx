import { useState, useRef, useEffect, useId } from 'react'

export interface ComboOption {
  value: string
  label: string
}

interface EyeballComboboxProps {
  options:      ComboOption[]
  value:        string
  onChange:     (value: string) => void
  placeholder?: string
  emptyLabel?:  string
  className?:   string
  disabled?:    boolean
}

/**
 * Accessible searchable combobox — drop-in replacement for <select>.
 * Fully keyboard-navigable, closes on outside click / Escape.
 */
const EyeballCombobox = ({
  options,
  value,
  onChange,
  placeholder  = 'Search…',
  emptyLabel   = '— None —',
  className    = '',
  disabled     = false,
}: EyeballComboboxProps) => {
  const id              = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlighted, setHighlighted] = useState<number>(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef     = useRef<HTMLInputElement>(null)
  const listRef      = useRef<HTMLUListElement>(null)

  const all: ComboOption[] = [{ value: '', label: emptyLabel }, ...options]

  const filtered = query.trim() === ''
    ? all
    : all.filter((o) =>
        o.label.toLowerCase().includes(query.toLowerCase())
      )

  const selectedLabel = all.find((o) => o.value === value)?.label ?? emptyLabel

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDropdown()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlighted >= 0 && listRef.current) {
      const item = listRef.current.children[highlighted] as HTMLElement
      item?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlighted])

  const openDropdown = () => {
    if (disabled) return
    setOpen(true)
    setQuery('')
    setHighlighted(all.findIndex((o) => o.value === value))
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const closeDropdown = () => {
    setOpen(false)
    setQuery('')
    setHighlighted(-1)
  }

  const select = (val: string) => {
    onChange(val)
    closeDropdown()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        openDropdown()
      }
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlighted((h) => Math.min(h + 1, filtered.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlighted((h) => Math.max(h - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (highlighted >= 0 && filtered[highlighted]) {
          select(filtered[highlighted].value)
        }
        break
      case 'Escape':
        e.preventDefault()
        closeDropdown()
        break
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`} onKeyDown={handleKeyDown}>
      {/* Trigger button */}
      <button
        type="button"
        id={id}
        onClick={() => (open ? closeDropdown() : openDropdown())}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`
          w-full flex items-center justify-between gap-2
          bg-stone-50 border rounded-lg px-4 py-2.5 text-sm text-left
          focus:outline-none focus:border-[#1a1a18] focus:bg-white transition
          disabled:opacity-50 disabled:cursor-not-allowed
          ${open ? 'border-[#1a1a18] bg-white' : 'border-stone-200'}
          ${!value ? 'text-stone-400' : 'text-[#1a1a18]'}
        `}
      >
        <span className="truncate">{selectedLabel}</span>
        <svg
          className={`w-4 h-4 text-stone-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20" fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden">
          {/* Search input */}
          <div className="px-3 pt-3 pb-2 border-b border-stone-100">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setHighlighted(0) }}
                placeholder={placeholder}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#1a1a18] placeholder:text-stone-300 focus:outline-none focus:border-[#1a1a18] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Options list */}
          <ul
            ref={listRef}
            role="listbox"
            className="max-h-52 overflow-y-auto py-1.5"
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-2.5 text-xs text-stone-300 text-center">No results found</li>
            ) : filtered.map((opt, i) => (
              <li
                key={opt.value || '__none__'}
                role="option"
                aria-selected={opt.value === value}
                onClick={() => select(opt.value)}
                onMouseEnter={() => setHighlighted(i)}
                className={`
                  flex items-center justify-between gap-2
                  px-4 py-2 text-sm cursor-pointer select-none transition-colors
                  ${highlighted === i ? 'bg-stone-50' : ''}
                  ${opt.value === value ? 'text-[#1a1a18] font-medium' : 'text-stone-600'}
                  ${!opt.value ? 'text-stone-400 italic' : ''}
                `}
              >
                <span className="truncate">{opt.label}</span>
                {opt.value === value && (
                  <svg className="w-3.5 h-3.5 text-[#1a1a18] shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                )}
              </li>
            ))}
          </ul>

          {/* Count footer */}
          {options.length > 0 && (
            <div className="px-4 py-2 border-t border-stone-100">
              <p className="text-[10px] text-stone-300">
                {filtered.length - 1 < options.length
                  ? `${Math.max(0, filtered.length - 1)} of ${options.length} eyeballs`
                  : `${options.length} eyeball${options.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default EyeballCombobox