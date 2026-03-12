import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: '#111111',
          border: '4px solid #1f1f1f',
          borderBottom: '8px solid #22c55e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          fontSize: 72,
          fontWeight: 600,
          color: '#ededed',
          letterSpacing: '-2px',
        }}
      >
        {'</>'}
      </div>
    ),
    { ...size }
  )
}
