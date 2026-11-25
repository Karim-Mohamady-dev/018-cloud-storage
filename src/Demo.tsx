import { useMemo, useState } from 'react'
import { FileDoc, FileImage, FilePdf, FileVideo, FileXls, Folder, LinkSimple, MagnifyingGlass, Upload, X } from '@phosphor-icons/react'
import en from '../locales/en/common.json'

type DemoStrings = (typeof en)['demo']
type Kind = 'folder' | 'doc' | 'pdf' | 'sheet' | 'image' | 'video'
type FileItem = { name: string; kind: Kind; size: string; modified: string }

const KIND_ICON = { folder: Folder, doc: FileDoc, pdf: FilePdf, sheet: FileXls, image: FileImage, video: FileVideo }

export default function Demo({ d }: { d: DemoStrings }) {
  const [files, setFiles] = useState<FileItem[]>(() =>
    d.files.map((f) => ({ name: f.name, kind: f.kind as Kind, size: f.size, modified: f.modified })),
  )
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | Kind>('all')
  const [shareFile, setShareFile] = useState<FileItem | null>(null)
  const [copied, setCopied] = useState(false)
  const [uploaded, setUploaded] = useState(false)

  const shown = useMemo(
    () =>
      files.filter(
        (f) =>
          (filter === 'all' || f.kind === filter) &&
          f.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [files, filter, query],
  )
  const pct = Math.round((d.storage.usedGb / d.storage.totalGb) * 100)

  const upload = () => {
    if (uploaded) return
    setFiles((prev) => [...prev, { name: d.newFile.name, kind: d.newFile.kind as Kind, size: d.newFile.size, modified: d.newFile.modified }])
    setUploaded(true)
  }
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${d.shareLinkPrefix}${shareFile ? shareFile.name.replace(/\s+/g, '-').toLowerCase() : ''}`)
      setCopied(true)
    } catch {
      setCopied(true)
    }
  }
  return (
    <div className="rounded-2xl border border-line bg-surface p-8 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="title-1 font-semibold">{d.title}</h2>
          <p className="caption-2 text-muted">{d.subtitle}</p>
        </div>
        <span className="caption-3 rounded-full bg-accent-soft px-4 py-2 text-accent">{d.sampleLabel}</span>
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <label className="relative min-w-48 flex-1">
          <span className="sr-only">{d.searchLabel}</span>
          <MagnifyingGlass size={18} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={d.searchLabel}
            className="w-full rounded-lg border border-line bg-bg py-2 pe-4 ps-12 body-3 placeholder:text-muted"
          />
        </label>
        <button type="button" onClick={upload} disabled={uploaded} className="button-sm inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-accent-ink transition-opacity duration-300 hover:opacity-90 disabled:opacity-50">
          <Upload size={16} aria-hidden="true" />
          {uploaded ? d.uploadedLabel : d.uploadLabel}
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={d.filterLabel}>
        {(['all', 'folder', 'doc', 'pdf', 'sheet', 'image', 'video'] as const).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={filter === k}
            onClick={() => setFilter(k)}
            className={`button-sm rounded-full border px-3 py-1 transition-colors duration-300 ${filter === k ? 'border-accent bg-accent text-accent-ink' : 'border-line text-muted hover:text-ink'}`}
          >
            {d.filters[k]}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <div className="mt-8 rounded-xl border border-line bg-bg p-8 text-center">
          <p className="title-2">{d.emptyTitle}</p>
          <p className="body-3 mt-2 text-muted">{d.emptyText}</p>
        </div>
      ) : (
        <ul className="mt-8 space-y-2">
          {shown.map((f) => {
            const Icon = KIND_ICON[f.kind]
            return (
              <li key={f.name} className="flex items-center gap-4 rounded-xl border border-line bg-bg px-4 py-2">
                <span className="text-accent" aria-hidden="true">
                  <Icon size={24} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="body-2 block truncate">{f.name}</span>
                  <span className="caption-4 text-muted">{f.size} · {f.modified}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShareFile(f)
                    setCopied(false)
                  }}
                  className="button-sm inline-flex shrink-0 items-center gap-2 rounded-lg border border-line px-3 py-2 transition-colors duration-300 hover:bg-surface"
                >
                  <LinkSimple size={16} aria-hidden="true" />
                  {d.shareLabel}
                </button>
              </li>
            )
          })}
        </ul>
      )}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <p className="caption-1 text-muted">{d.storage.label}</p>
          <p className="caption-1">
            {d.storage.usedGb} {d.storage.unit} / {d.storage.totalGb} {d.storage.unit}
          </p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={d.storage.label}>
          <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
      {shareFile && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-4 sm:items-center" role="dialog" aria-modal="true" aria-label={d.shareTitle}>
          <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="heading-6">{d.shareTitle}</h3>
              <button type="button" onClick={() => setShareFile(null)} aria-label={d.closeLabel} className="rounded-lg p-2 hover:bg-surface2">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <p className="body-3 text-muted">{shareFile.name}</p>
            <p className="body-3 mt-4 break-all rounded-lg border border-line bg-bg px-4 py-2">
              {d.shareLinkPrefix}
              {shareFile.name.replace(/\s+/g, '-').toLowerCase()}
            </p>
            <button type="button" onClick={copyLink} className="button-md mt-8 w-full rounded-lg bg-accent px-3 py-2 text-accent-ink">
              {copied ? d.copiedLabel : d.copyLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
