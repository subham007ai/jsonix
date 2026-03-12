import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: '#111111',
          border: '1px solid #1f1f1f',
          borderBottom: '2px solid #22c55e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          fontSize: 13,
          fontWeight: 600,
          color: '#ededed',
          letterSpacing: '-0.5px',
        }}
      >
        {'</>'}
      </div>
    ),
    { ...size }
  )
}
