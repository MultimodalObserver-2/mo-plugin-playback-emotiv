import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, act } from '@testing-library/react'

import EmotivPlayback from '../main'
import { EmotivPreview } from '../components/EmotivPreview'
import { EmotivView } from '../components/EmotivView'
import properties from '../properties'

function makeControls() {
  return {
    onPlay: vi.fn().mockReturnValue(() => {}),
    onPause: vi.fn().mockReturnValue(() => {}),
    onSeek: vi.fn().mockReturnValue(() => {}),
    onSync: vi.fn().mockReturnValue(() => {}),
  }
}

function makeContext(filePath = '/test/emotiv.json') {
  return { filePath, captureStartTimestamp: 0, fileCaptureStartTimestamp: 0, pauseIntervals: [] as [number, number][] }
}

const SAMPLE_DATA = [
  {
    timestamp: 1000,
    metrics: { stress: 0.4, engagement: 0.6, interest: 0.5, excitement: 0.3, focus: 0.7, relaxation: 0.2 },
    power: { theta: 1.2, alpha: 0.8, low_beta: 0.5, high_beta: 0.3, gamma: 0.1 }
  },
  {
    timestamp: 1500,
    metrics: { stress: 0.5, engagement: 0.7, interest: 0.4, excitement: 0.4, focus: 0.8, relaxation: 0.1 },
    power: { theta: 1.0, alpha: 0.9, low_beta: 0.6, high_beta: 0.4, gamma: 0.2 }
  },
  {
    timestamp: 2000,
    metrics: { stress: 0.3, engagement: 0.5, interest: 0.6, excitement: 0.2, focus: 0.6, relaxation: 0.3 },
    power: { theta: 1.1, alpha: 0.7, low_beta: 0.4, high_beta: 0.2, gamma: 0.15 }
  },
]

describe('EmotivPlayback', () => {
  let plugin: EmotivPlayback

  beforeEach(() => {
    plugin = new EmotivPlayback()
  })

  it('instance', () => {
    expect(plugin).toBeDefined()
  })

  it('extensions json', () => {
    const exts = plugin.validExtensions()
    expect(exts).toContain('json')
    expect(exts).toHaveLength(1)
  })

  it('descriptor null', () => {
    expect(plugin.validateCaptureDescriptor(null)).toBe(true)
  })

  it('descriptor array type', () => {
    expect(plugin.validateCaptureDescriptor({ type: 'array' })).toBe(true)
  })

  it('descriptor object type', () => {
    expect(plugin.validateCaptureDescriptor({ type: 'object' })).toBe(true)
  })

  it('descriptor any', () => {
    expect(plugin.validateCaptureDescriptor({ random: 'value' })).toBe(true)
    expect(plugin.validateCaptureDescriptor({})).toBe(true)
  })

  it('getView', () => {
    const el = plugin.getView({ controls: makeControls(), context: makeContext(), settings: {} })
    expect(el).not.toBeNull()
  })

  it('getPreview', () => {
    const el = plugin.getPreview()
    expect(el).not.toBeNull()
  })
})

describe('properties', () => {
  it('defined', () => {
    expect(properties).toBeDefined()
    expect(typeof properties).toBe('object')
  })
})

describe('EmotivPreview', () => {
  it('renders', () => {
    render(<EmotivPreview />)
  })

  it('container', () => {
    const { container } = render(<EmotivPreview />)
    expect(container.firstChild).not.toBeNull()
  })

  it('text content', () => {
    const { container } = render(<EmotivPreview />)
    expect(container.textContent?.length).toBeGreaterThan(0)
  })
})

describe('EmotivView', () => {
  function renderView(filePath = '/test/emotiv.json') {
    const controls = makeControls()
    const context = makeContext(filePath)
    return {
      ...render(<EmotivView controls={controls} context={context} settings={{}} />),
      controls,
    }
  }

  it('renders', () => {
    renderView()
  })

  it('emotiv playback header', () => {
    const { container } = renderView()
    expect(container.textContent).toContain('EMOTIV PLAYBACK')
  })

  it('performance metrics', () => {
    const { container } = renderView()
    expect(container.textContent).toContain('Performance Metrics')
  })

  it('frequency bands', () => {
    const { container } = renderView()
    expect(container.textContent).toContain('Frequency Bands')
  })

  it('zoom buttons', () => {
    const { container } = renderView()
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('play handler', () => {
    const { controls } = renderView()
    expect(controls.onPlay).toHaveBeenCalled()
  })

  it('pause handler', () => {
    const { controls } = renderView()
    expect(controls.onPause).toHaveBeenCalled()
  })

  it('seek handler', () => {
    const { controls } = renderView()
    expect(controls.onSeek).toHaveBeenCalled()
  })

  it('sync handler', () => {
    const { controls } = renderView()
    expect(controls.onSync).toHaveBeenCalled()
  })

  it('cleanup unmount', () => {
    const unsubPlay = vi.fn()
    const unsubPause = vi.fn()
    const unsubSeek = vi.fn()
    const unsubSync = vi.fn()
    const controls = {
      onPlay: vi.fn().mockReturnValue(unsubPlay),
      onPause: vi.fn().mockReturnValue(unsubPause),
      onSeek: vi.fn().mockReturnValue(unsubSeek),
      onSync: vi.fn().mockReturnValue(unsubSync),
    }
    const { unmount } = render(
      <EmotivView controls={controls} context={makeContext()} settings={{}} />
    )
    unmount()
    expect(unsubPlay).toHaveBeenCalled()
    expect(unsubPause).toHaveBeenCalled()
    expect(unsubSeek).toHaveBeenCalled()
    expect(unsubSync).toHaveBeenCalled()
  })

  it('zoom in', () => {
    const { container } = renderView()
    const buttons = container.querySelectorAll('button')
    const zoomIn = Array.from(buttons).find(btn => btn.textContent === '+')
    expect(zoomIn).toBeDefined()
    fireEvent.click(zoomIn!)
  })

  it('zoom out', () => {
    const { container } = renderView()
    const buttons = container.querySelectorAll('button')
    const zoomOut = Array.from(buttons).find(btn => btn.textContent === '-')
    expect(zoomOut).toBeDefined()
    fireEvent.click(zoomOut!)
  })

  it('zoom reset', () => {
    const { container } = renderView()
    const buttons = container.querySelectorAll('button')
    const resetBtn = Array.from(buttons).find(btn => btn.textContent === 'Reset')
    expect(resetBtn).toBeDefined()
    fireEvent.click(resetBtn!)
  })

  it('json data svg', async () => {
    ;(window.core.fs.readFileSync as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      JSON.stringify(SAMPLE_DATA)
    )
    const controls = makeControls()
    const { container } = render(
      <EmotivView controls={controls} context={makeContext()} settings={{}} />
    )
    await act(async () => { await Promise.resolve() })
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('metric badges', async () => {
    ;(window.core.fs.readFileSync as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      JSON.stringify(SAMPLE_DATA)
    )
    const controls = makeControls()
    const { container } = render(
      <EmotivView controls={controls} context={makeContext()} settings={{}} />
    )
    await act(async () => { await Promise.resolve() })
    expect(container.textContent?.toLowerCase()).toContain('stress')
    expect(container.textContent?.toLowerCase()).toContain('engagement')
  })

  it('play callback time', async () => {
    ;(window.core.fs.readFileSync as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      JSON.stringify(SAMPLE_DATA)
    )
    const controls = makeControls()
    let playCallback: (from: number) => void = () => {}
    controls.onPlay.mockImplementation((cb: (from: number) => void) => {
      playCallback = cb
      return () => {}
    })
    render(<EmotivView controls={controls} context={makeContext()} settings={{}} />)
    await act(async () => { await Promise.resolve() })
    act(() => { playCallback(1000) })
  })

  it('invalid json', async () => {
    ;(window.core.fs.readFileSync as ReturnType<typeof vi.fn>).mockResolvedValueOnce('not-json')
    const controls = makeControls()
    render(<EmotivView controls={controls} context={makeContext()} settings={{}} />)
    await act(async () => { await Promise.resolve() })
  })

  it('max power label', async () => {
    ;(window.core.fs.readFileSync as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      JSON.stringify(SAMPLE_DATA)
    )
    const controls = makeControls()
    const { container } = render(
      <EmotivView controls={controls} context={makeContext()} settings={{}} />
    )
    await act(async () => { await Promise.resolve() })
    expect(container.textContent).toContain('Max:')
  })
})
