# Emotiv EEG Playback Plugin

A Playback plugin for [**Multimodal Observer**](https://github.com/MultimodalObserver-2/mo), designed to visualize EEG-based emotional and cognitive metric recordings from an Emotiv Insight headset synchronized with the session timeline.

## Features

- **Dual waveform visualization** — one chart for performance metrics, one for EEG frequency bands
- **Performance metrics**: stress, engagement, interest, excitement, focus, and relaxation
- **Frequency bands**: theta, alpha, low beta, high beta, and gamma
- **Live badge display** showing the current value of each metric at the playback cursor position
- **Seek and pause support** through the session controls
- **Zoom controls** to inspect specific time regions
- **Preview** identifying the plugin in the interface

## Supported Formats

- `.json`

The plugin accepts JSON files produced by the [Emotiv Capture Plugin](https://github.com/MultimodalObserver-2/mo-plugin-capture-emotiv).

## ⚙️ Configuration Options

This plugin has no configurable properties.

## How It Works

- Reads the JSON recording file and parses all timestamped EEG packets.
- Renders performance metrics and frequency band data as SVG polylines that update as the session plays back.
- The playback cursor follows the session timeline and highlights the current metric values in real time.

## 📦 Installation

1. Download the latest plugin release from [here](https://github.com/MultimodalObserver-2/mo-plugin-playback-emotiv/releases/latest).
2. Extract the downloaded `.zip` file.
3. Register the plugin using the plugin interface within Multimodal Observer.
