import { useState, useCallback } from 'react'

interface Props {
  urls: string[]
  alt?: string
  height?: number
}

const isVideo = (url: string) => /\.(mp4|mov|webm|avi|mkv)(\?.*)?$/i.test(url)

export default function MediaCarousel({ urls, alt = '', height = 380 }: Props) {
  const [current, setCurrent] = useState(0)

  const prev = useCallback(() => setCurrent(i => (i - 1 + urls.length) % urls.length), [urls.length])
  const next = useCallback(() => setCurrent(i => (i + 1) % urls.length), [urls.length])

  if (!urls || urls.length === 0) {
    return (
      <div style={{
        width: '100%', height, background: '#f3f4f6', borderRadius: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 8, color: '#9ca3af', marginBottom: 16
      }}>
        <div style={{ fontSize: 40 }}>📷</div>
        <div style={{ fontSize: 13 }}>Sem fotos ou vídeos</div>
      </div>
    )
  }

  const current_url = urls[current]
  const isCurrentVideo = isVideo(current_url)

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Mídia principal */}
      <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', background: '#1a1a1a' }}>
        {isCurrentVideo ? (
          <video
            src={current_url}
            controls
            style={{ width: '100%', height, objectFit: 'contain', display: 'block' }}
          />
        ) : (
          <img
            src={current_url}
            alt={alt}
            style={{ width: '100%', height, objectFit: 'cover', display: 'block' }}
          />
        )}

        {/* Badge de tipo */}
        {isCurrentVideo && (
          <div style={{
            position: 'absolute', top: 12, left: 12,
            background: 'rgba(0,0,0,0.7)', color: '#fff',
            padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 4
          }}>
            🎬 Vídeo
          </div>
        )}

        {/* Contador */}
        {urls.length > 1 && (
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: 'rgba(0,0,0,0.6)', color: '#fff',
            padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600
          }}>
            {current + 1} / {urls.length}
          </div>
        )}

        {/* Setas de navegação */}
        {urls.length > 1 && (
          <>
            <button
              onClick={prev}
              style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none',
                width: 40, height: 40, borderRadius: '50%', cursor: 'pointer',
                fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.85)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.6)')}
            >
              ‹
            </button>
            <button
              onClick={next}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none',
                width: 40, height: 40, borderRadius: '50%', cursor: 'pointer',
                fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.85)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.6)')}
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {urls.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10, overflowX: 'auto', paddingBottom: 4 }}>
          {urls.map((url, i) => {
            const isVid = isVideo(url)
            return (
              <div
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  position: 'relative', flexShrink: 0, width: 80, height: 60,
                  borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                  border: i === current ? '2.5px solid #a3e635' : '2px solid transparent',
                  transition: 'border 0.15s', background: '#1a1a1a'
                }}
              >
                {isVid ? (
                  <>
                    <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{
                      position: 'absolute', inset: 0, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(0,0,0,0.4)', color: '#fff', fontSize: 18
                    }}>▶</div>
                  </>
                ) : (
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Dots para mobile */}
      {urls.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8 }}>
          {urls.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: i === current ? 20 : 8, height: 8, borderRadius: 100,
                background: i === current ? '#a3e635' : '#d1d5db',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'all 0.2s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
