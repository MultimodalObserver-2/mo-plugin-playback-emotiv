import { reactExports, jsxRuntimeExports } from "react";
import { useTranslation, PlaybackPlugin } from "mo-sdk";
const useEffect = reactExports.useEffect;
const useState = reactExports.useState;
const useRef = reactExports.useRef;
const useMemo = reactExports.useMemo;
const jsx$2 = jsxRuntimeExports.jsx;
const jsxs$1 = jsxRuntimeExports.jsxs;
const SYNC_TOLERANCE = 100;
const COLORS_METRICS = {
  stress: "#e63946",
  engagement: "#457b9d",
  interest: "#e9c46a",
  excitement: "#f4a261",
  focus: "#2a9d8f",
  relaxation: "#8d99ae"
};
const COLORS_POWER = {
  theta: "#4cc9f0",
  alpha: "#4361ee",
  low_beta: "#3a0ca3",
  high_beta: "#7209b7",
  gamma: "#f72585"
};
function EmotivView({
  controls,
  context
}) {
  const [data, setData] = useState([]);
  const [timeMs, setTimeMs] = useState(0);
  const timeMsRef = useRef(timeMs);
  const [isPlaying, setIsPlaying] = useState(false);
  const rafIdRef = useRef(null);
  const lastRealTimeRef = useRef(0);
  const [zoom, setZoom] = useState(10);
  useEffect(() => {
    const loadData = async () => {
      try {
        const raw = await window.core.fs.readFileSync(context.filePath, "utf-8");
        const parsed = JSON.parse(raw);
        parsed.sort((a, b) => a.timestamp - b.timestamp);
        setData(parsed);
      } catch (e) {
        console.error("Error loading data", e);
      }
    };
    loadData();
  }, [context.filePath]);
  useEffect(() => {
    timeMsRef.current = timeMs;
  }, [timeMs]);
  const tick = () => {
    const now = performance.now();
    const delta = now - lastRealTimeRef.current;
    lastRealTimeRef.current = now;
    setTimeMs((prev) => prev + delta);
    rafIdRef.current = requestAnimationFrame(tick);
  };
  useEffect(() => {
    const unsubPlay = controls.onPlay((from) => {
      setTimeMs(from);
      lastRealTimeRef.current = performance.now();
      setIsPlaying(true);
    });
    const unsubPause = controls.onPause(() => setIsPlaying(false));
    const unsubSeek = controls.onSeek((to) => {
      setTimeMs(to);
      lastRealTimeRef.current = performance.now();
    });
    const unsubSync = controls.onSync((syncTime) => {
      if (Math.abs(syncTime - timeMsRef.current) > SYNC_TOLERANCE) {
        setTimeMs(syncTime);
        lastRealTimeRef.current = performance.now();
      }
    });
    return () => {
      unsubPlay();
      unsubPause();
      unsubSeek();
      unsubSync();
    };
  }, [controls]);
  useEffect(() => {
    if (isPlaying) {
      lastRealTimeRef.current = performance.now();
      rafIdRef.current = requestAnimationFrame(tick);
      return () => {
        if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      };
    } else if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }
  }, [isPlaying]);
  const timeSeconds = Math.max(0, timeMs) / 1e3;
  const playerAbsTime = timeSeconds + context.captureStartTimestamp;
  const currentIndex = useMemo(() => {
    if (data.length === 0) return -1;
    return data.findIndex((d) => d.timestamp >= playerAbsTime);
  }, [data, playerAbsTime]);
  const displayIndex = currentIndex > 0 ? currentIndex - 1 : 0;
  const currentPacket = data[displayIndex] || null;
  const GRAPH_HEIGHT = 100;
  const charts = useMemo(() => {
    if (data.length < 2) return null;
    const start = data[0].timestamp;
    const end = data[data.length - 1].timestamp;
    const duration = end - start;
    if (duration <= 0) return null;
    const createPath = (getValue, scale = 1) => {
      return data.map((d, i) => {
        const val = getValue(d) ?? 0;
        const x = (d.timestamp - start) / duration * 100;
        const y = GRAPH_HEIGHT - val / scale * GRAPH_HEIGHT;
        return `${i === 0 ? "M" : "L"} ${x.toFixed(3)} ${y.toFixed(3)}`;
      }).join(" ");
    };
    let maxPowerVal = 0;
    data.forEach((d) => {
      if (d.power) {
        const vals = Object.values(d.power).filter((v) => typeof v === "number");
        if (vals.length > 0) maxPowerVal = Math.max(maxPowerVal, ...vals);
      }
    });
    maxPowerVal = maxPowerVal || 10;
    return {
      start,
      duration,
      maxPowerVal,
      pathsMetrics: {
        stress: createPath((d) => d.metrics.stress),
        engagement: createPath((d) => d.metrics.engagement),
        interest: createPath((d) => d.metrics.interest),
        excitement: createPath((d) => d.metrics.excitement),
        focus: createPath((d) => d.metrics.focus),
        relaxation: createPath((d) => d.metrics.relaxation)
      },
      pathsPower: {
        theta: createPath((d) => d.power.theta, maxPowerVal),
        alpha: createPath((d) => d.power.alpha, maxPowerVal),
        low_beta: createPath((d) => d.power.low_beta, maxPowerVal),
        high_beta: createPath((d) => d.power.high_beta, maxPowerVal),
        gamma: createPath((d) => d.power.gamma, maxPowerVal)
      }
    };
  }, [data]);
  const cursorAbsPos = charts ? (playerAbsTime - charts.start) / charts.duration * 100 : 0;
  const viewPortWidth = 100 / zoom;
  let viewBoxX = cursorAbsPos - viewPortWidth / 2;
  if (viewBoxX < 0) {
    viewBoxX = 0;
  }
  if (viewBoxX + viewPortWidth > 100) {
    viewBoxX = 100 - viewPortWidth;
  }
  const viewBoxString = `${viewBoxX} 0 ${viewPortWidth} ${GRAPH_HEIGHT}`;
  let cursorScreenPercent = (cursorAbsPos - viewBoxX) / viewPortWidth * 100;
  cursorScreenPercent = Math.min(100, Math.max(0, cursorScreenPercent));
  return /* @__PURE__ */ jsxs$1("div", {
    style: {
      padding: "10px",
      fontFamily: "sans-serif",
      color: "#333",
      display: "flex",
      flexDirection: "column",
      gap: "15px"
    },
    children: [/* @__PURE__ */ jsxs$1("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #eee",
        paddingBottom: "5px"
      },
      children: [/* @__PURE__ */ jsx$2("div", {
        style: {
          fontWeight: "bold",
          color: "#444"
        },
        children: "EMOTIV PLAYBACK"
      }), /* @__PURE__ */ jsxs$1("div", {
        style: {
          display: "flex",
          gap: "5px",
          alignItems: "center"
        },
        children: [/* @__PURE__ */ jsx$2("span", {
          style: {
            fontSize: "0.8rem",
            color: "#888"
          },
          children: "Zoom:"
        }), /* @__PURE__ */ jsx$2("button", {
          onClick: () => setZoom((z) => Math.min(z * 1.5, 100)),
          style: btnStyle,
          children: "+"
        }), /* @__PURE__ */ jsx$2("button", {
          onClick: () => setZoom((z) => Math.max(z / 1.5, 1)),
          style: btnStyle,
          children: "-"
        }), /* @__PURE__ */ jsx$2("button", {
          onClick: () => setZoom(1),
          style: {
            ...btnStyle,
            width: "auto"
          },
          children: "Reset"
        })]
      })]
    }), /* @__PURE__ */ jsxs$1("div", {
      children: [/* @__PURE__ */ jsx$2("h4", {
        style: {
          margin: "0 0 5px 0",
          fontSize: "0.9rem",
          color: "#666"
        },
        children: "Performance Metrics (0-100%)"
      }), /* @__PURE__ */ jsx$2("div", {
        style: {
          display: "flex",
          gap: "5px",
          marginBottom: "5px",
          flexWrap: "wrap"
        },
        children: Object.entries(COLORS_METRICS).map(([k, c]) => /* @__PURE__ */ jsx$2(MetricBadge, {
          label: k,
          color: c,
          value: currentPacket?.metrics?.[k],
          isPercent: true
        }, k))
      }), /* @__PURE__ */ jsxs$1(ChartContainer, {
        height: 120,
        children: [charts && /* @__PURE__ */ jsxs$1("svg", {
          width: "100%",
          height: "100%",
          preserveAspectRatio: "none",
          viewBox: viewBoxString,
          children: [/* @__PURE__ */ jsx$2("line", {
            x1: "0",
            y1: GRAPH_HEIGHT * 0.25,
            x2: "100",
            y2: GRAPH_HEIGHT * 0.25,
            stroke: "#eee",
            strokeWidth: "0.5",
            vectorEffect: "non-scaling-stroke"
          }), /* @__PURE__ */ jsx$2("line", {
            x1: "0",
            y1: GRAPH_HEIGHT * 0.5,
            x2: "100",
            y2: GRAPH_HEIGHT * 0.5,
            stroke: "#ddd",
            strokeWidth: "0.5",
            vectorEffect: "non-scaling-stroke"
          }), /* @__PURE__ */ jsx$2("line", {
            x1: "0",
            y1: GRAPH_HEIGHT * 0.75,
            x2: "100",
            y2: GRAPH_HEIGHT * 0.75,
            stroke: "#eee",
            strokeWidth: "0.5",
            vectorEffect: "non-scaling-stroke"
          }), Object.entries(charts.pathsMetrics).map(([k, d]) => /* @__PURE__ */ jsx$2("path", {
            d,
            fill: "none",
            stroke: COLORS_METRICS[k],
            strokeWidth: "1.2",
            vectorEffect: "non-scaling-stroke",
            opacity: "0.9"
          }, k))]
        }), /* @__PURE__ */ jsx$2("div", {
          style: {
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${cursorScreenPercent}%`,
            width: "2px",
            backgroundColor: "red",
            pointerEvents: "none",
            zIndex: 10
          }
        })]
      })]
    }), /* @__PURE__ */ jsxs$1("div", {
      children: [/* @__PURE__ */ jsxs$1("h4", {
        style: {
          margin: "0 0 5px 0",
          fontSize: "0.9rem",
          color: "#666"
        },
        children: ["Frequency Bands (Max: ", charts?.maxPowerVal.toFixed(1), ")"]
      }), /* @__PURE__ */ jsx$2("div", {
        style: {
          display: "flex",
          gap: "5px",
          marginBottom: "5px",
          flexWrap: "wrap"
        },
        children: Object.entries(COLORS_POWER).map(([k, c]) => /* @__PURE__ */ jsx$2(MetricBadge, {
          label: k,
          color: c,
          value: currentPacket?.power?.[k],
          isPercent: false
        }, k))
      }), /* @__PURE__ */ jsxs$1(ChartContainer, {
        height: 120,
        children: [charts && /* @__PURE__ */ jsxs$1("svg", {
          width: "100%",
          height: "100%",
          preserveAspectRatio: "none",
          viewBox: viewBoxString,
          children: [/* @__PURE__ */ jsx$2("line", {
            x1: "0",
            y1: GRAPH_HEIGHT * 0.5,
            x2: "100",
            y2: GRAPH_HEIGHT * 0.5,
            stroke: "#ddd",
            strokeWidth: "0.5",
            vectorEffect: "non-scaling-stroke"
          }), Object.entries(charts.pathsPower).map(([k, d]) => /* @__PURE__ */ jsx$2("path", {
            d,
            fill: "none",
            stroke: COLORS_POWER[k],
            strokeWidth: "1.2",
            vectorEffect: "non-scaling-stroke",
            opacity: "0.9"
          }, k))]
        }), /* @__PURE__ */ jsx$2("div", {
          style: {
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${cursorScreenPercent}%`,
            width: "2px",
            backgroundColor: "red",
            pointerEvents: "none",
            zIndex: 10
          }
        })]
      })]
    })]
  });
}
function ChartContainer({
  children,
  height
}) {
  return /* @__PURE__ */ jsx$2("div", {
    style: {
      height: `${height}px`,
      border: "1px solid #ccc",
      background: "#fff",
      borderRadius: "4px",
      overflow: "hidden",
      position: "relative"
    },
    children
  });
}
function MetricBadge({
  label,
  value,
  color,
  isPercent
}) {
  const v = value !== void 0 && value !== null ? isPercent ? (value * 100).toFixed(0) + "%" : value.toFixed(2) : "--";
  return /* @__PURE__ */ jsxs$1("div", {
    style: {
      background: color + "15",
      borderLeft: `3px solid ${color}`,
      padding: "3px 6px",
      fontSize: "0.75rem",
      borderRadius: "3px",
      minWidth: "60px"
    },
    children: [/* @__PURE__ */ jsx$2("div", {
      style: {
        fontWeight: "bold",
        color: "#555",
        textTransform: "uppercase",
        fontSize: "0.6rem"
      },
      children: label
    }), /* @__PURE__ */ jsx$2("div", {
      style: {
        color,
        fontWeight: "bold"
      },
      children: v
    })]
  });
}
const btnStyle = {
  cursor: "pointer",
  padding: "2px 8px",
  background: "#eee",
  border: "1px solid #ccc",
  borderRadius: "3px",
  fontWeight: "bold",
  color: "#444",
  width: "24px"
};
const jsx$1 = jsxRuntimeExports.jsx;
const jsxs = jsxRuntimeExports.jsxs;
function EmotivPreview() {
  const {
    t
  } = useTranslation("interaction-lab-emotiv_playback");
  return /* @__PURE__ */ jsxs("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      border: "1px dashed #ccc",
      borderRadius: "8px",
      background: "#fdfdfd",
      color: "#555",
      height: "100%",
      minHeight: "150px"
    },
    children: [/* @__PURE__ */ jsx$1("div", {
      style: {
        fontSize: "2rem",
        marginBottom: "10px"
      }
    }), /* @__PURE__ */ jsx$1("div", {
      style: {
        fontWeight: "bold"
      },
      children: t("preview_title") || "Emotiv Data"
    }), /* @__PURE__ */ jsx$1("div", {
      style: {
        fontSize: "0.9rem"
      },
      children: t("preview_desc") || "Brainwave & Metrics Visualization"
    })]
  });
}
const jsx = jsxRuntimeExports.jsx;
class EmotivPlayback extends PlaybackPlugin {
  getView(props) {
    return /* @__PURE__ */ jsx(EmotivView, {
      ...props
    });
  }
  getPreview() {
    return /* @__PURE__ */ jsx(EmotivPreview, {});
  }
  validExtensions() {
    return ["json"];
  }
  validateCaptureDescriptor(descriptor) {
    if (!descriptor) return true;
    if (descriptor.type === "array" || descriptor.type === "object") {
      return true;
    }
    return true;
  }
}
export {
  EmotivPlayback as default
};
