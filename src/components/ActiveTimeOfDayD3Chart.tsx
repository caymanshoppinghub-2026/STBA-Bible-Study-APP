/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import {
  Clock,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  Zap,
  Flame,
  Brain,
  TrendingUp,
  Info,
  Calendar,
  Layers,
  ChevronRight
} from "lucide-react";
import {
  getHourlyActivityReport,
  HourlyFocusPoint,
  FocusPeriodSummary,
  HourlyActivityReport
} from "../utils/hourlyActivityAggregator";
import { useSabbathMode } from "../context/SabbathMode";

interface ActiveTimeOfDayD3ChartProps {
  sabbathMode?: boolean;
}

export const ActiveTimeOfDayD3Chart: React.FC<ActiveTimeOfDayD3ChartProps> = ({
  sabbathMode: propSabbathMode
}) => {
  const { sabbathMode: contextSabbathMode } = useSabbathMode();
  const isSabbath = propSabbathMode ?? contextSabbathMode;

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [activeTab, setActiveTab] = useState<"timeline" | "periods" | "circadian">("timeline");
  const [hoveredHour, setHoveredHour] = useState<HourlyFocusPoint | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false
  });

  // Aggregated data report
  const report: HourlyActivityReport = useMemo(() => {
    return getHourlyActivityReport();
  }, []);

  // Render D3 Visualization
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const svgElement = svgRef.current;

    const renderChart = () => {
      const width = container.clientWidth || 800;
      const height = 300;
      const margin = { top: 35, right: 25, bottom: 45, left: 45 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      // Clear previous SVG content
      d3.select(svgElement).selectAll("*").remove();

      const svg = d3
        .select(svgElement)
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("style", "max-width: 100%; height: auto; font-family: inherit;");

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Data array
      const data = report.hourlyData;
      const maxMinutes = d3.max(data, (d) => d.studyMinutes) || 50;

      // Scales
      const xScale = d3
        .scaleLinear()
        .domain([0, 23])
        .range([0, innerWidth]);

      const yScale = d3
        .scaleLinear()
        .domain([0, Math.ceil(maxMinutes * 1.15)])
        .range([innerHeight, 0])
        .nice();

      const barBandScale = d3
        .scaleBand<number>()
        .domain(data.map((d) => d.hour))
        .range([0, innerWidth])
        .padding(0.24);

      // Defs: Gradients & Filters
      const defs = svg.append("defs");

      // Area gradient
      const areaGradient = defs
        .append("linearGradient")
        .attr("id", "hourly-area-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");

      areaGradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", isSabbath ? "#C9973A" : "#C9973A")
        .attr("stop-opacity", 0.45);

      areaGradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", isSabbath ? "#C9973A" : "#1C2333")
        .attr("stop-opacity", 0.0);

      // Glow filter for peak badge
      const filter = defs.append("filter").attr("id", "glow").attr("x", "-20%").attr("y", "-20%").attr("width", "140%").attr("height", "140%");
      filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
      filter.append("feComposite").attr("in", "SourceGraphic").attr("in2", "blur").attr("operator", "over");

      // Grid Lines (Horizontal)
      const yTicks = yScale.ticks(4);
      g.append("g")
        .attr("class", "grid-lines")
        .selectAll("line")
        .data(yTicks)
        .enter()
        .append("line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", (d) => yScale(d))
        .attr("y2", (d) => yScale(d))
        .attr("stroke", "#E8E4DA")
        .attr("stroke-dasharray", "3,3")
        .attr("stroke-opacity", 0.8);

      // Background Focus Zones (Dawn 5-8, Evening 18-21)
      const dawnX1 = xScale(5);
      const dawnX2 = xScale(8);
      g.append("rect")
        .attr("x", dawnX1)
        .attr("y", 0)
        .attr("width", Math.max(0, dawnX2 - dawnX1))
        .attr("height", innerHeight)
        .attr("fill", "#C9973A")
        .attr("fill-opacity", 0.06)
        .attr("rx", 6);

      const eveX1 = xScale(18);
      const eveX2 = xScale(21.5);
      g.append("rect")
        .attr("x", eveX1)
        .attr("y", 0)
        .attr("width", Math.max(0, eveX2 - eveX1))
        .attr("height", innerHeight)
        .attr("fill", "#3B82F6")
        .attr("fill-opacity", 0.05)
        .attr("rx", 6);

      // Smooth Curve Area Generator
      const areaGen = d3
        .area<HourlyFocusPoint>()
        .x((d) => (barBandScale(d.hour) || 0) + barBandScale.bandwidth() / 2)
        .y0(innerHeight)
        .y1((d) => yScale(d.studyMinutes))
        .curve(d3.curveMonotoneX);

      // Smooth Curve Line Generator
      const lineGen = d3
        .line<HourlyFocusPoint>()
        .x((d) => (barBandScale(d.hour) || 0) + barBandScale.bandwidth() / 2)
        .y((d) => yScale(d.studyMinutes))
        .curve(d3.curveMonotoneX);

      // Draw Area
      g.append("path")
        .datum(data)
        .attr("fill", "url(#hourly-area-gradient)")
        .attr("d", areaGen);

      // Draw Line
      g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#C9973A")
        .attr("stroke-width", 2.5)
        .attr("stroke-linecap", "round")
        .attr("d", lineGen);

      // Draw Individual Hourly Bars
      const barsGroup = g.append("g").attr("class", "bars-group");

      barsGroup
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", (d) => barBandScale(d.hour) || 0)
        .attr("y", (d) => yScale(d.studyMinutes))
        .attr("width", barBandScale.bandwidth())
        .attr("height", (d) => Math.max(2, innerHeight - yScale(d.studyMinutes)))
        .attr("rx", 4)
        .attr("fill", (d) => {
          if (d.hour === report.peakHour.hour) return "#C9973A";
          if (d.hour === report.secondaryPeakHour.hour) return "#3B82F6";
          if (d.hour >= 5 && d.hour <= 7) return "#D4A346";
          if (d.hour >= 18 && d.hour <= 21) return "#60A5FA";
          if (d.hour >= 12 && d.hour <= 14) return "#34D399";
          return "#CBD5E1";
        })
        .attr("opacity", (d) => (d.studyMinutes > 0 ? 0.85 : 0.2))
        .attr("class", "transition-all duration-150 cursor-pointer")
        .on("mouseenter", function (event, d) {
          d3.select(this)
            .attr("opacity", 1)
            .attr("stroke", "#1C2333")
            .attr("stroke-width", 1.5);

          setHoveredHour(d);
          const [mx, my] = d3.pointer(event, container);
          setTooltipPos({ x: mx, y: my, visible: true });
        })
        .on("mousemove", function (event, d) {
          const [mx, my] = d3.pointer(event, container);
          setTooltipPos({ x: mx, y: my, visible: true });
        })
        .on("mouseleave", function (event, d) {
          d3.select(this)
            .attr("opacity", d.studyMinutes > 0 ? 0.85 : 0.2)
            .attr("stroke", "none");

          setHoveredHour(null);
          setTooltipPos((prev) => ({ ...prev, visible: false }));
        });

      // Data Points on Curve
      g.selectAll(".curve-dot")
        .data(data.filter((d) => d.studyMinutes > 0))
        .enter()
        .append("circle")
        .attr("class", "curve-dot")
        .attr("cx", (d) => (barBandScale(d.hour) || 0) + barBandScale.bandwidth() / 2)
        .attr("cy", (d) => yScale(d.studyMinutes))
        .attr("r", (d) => (d.hour === report.peakHour.hour ? 5.5 : 3.5))
        .attr("fill", (d) => (d.hour === report.peakHour.hour ? "#C9973A" : "#FFFFFF"))
        .attr("stroke", (d) => (d.hour === report.peakHour.hour ? "#1C2333" : "#C9973A"))
        .attr("stroke-width", 2);

      // Peak Annotations / Badges
      // Peak 1: Dawn Peak
      const peakX = (barBandScale(report.peakHour.hour) || 0) + barBandScale.bandwidth() / 2;
      const peakY = yScale(report.peakHour.studyMinutes);

      const peakAnnotation = g
        .append("g")
        .attr("transform", `translate(${peakX}, ${Math.max(12, peakY - 14)})`);

      peakAnnotation
        .append("rect")
        .attr("x", -44)
        .attr("y", -14)
        .attr("width", 88)
        .attr("height", 18)
        .attr("rx", 5)
        .attr("fill", "#1C2333")
        .attr("stroke", "#C9973A")
        .attr("stroke-width", 1);

      peakAnnotation
        .append("text")
        .attr("x", 0)
        .attr("y", -2)
        .attr("text-anchor", "middle")
        .attr("fill", "#FBBF24")
        .attr("font-size", "9px")
        .attr("font-family", "monospace")
        .attr("font-weight", "bold")
        .text("★ DAWN PEAK");

      // Secondary Peak: Evening
      const secX = (barBandScale(report.secondaryPeakHour.hour) || 0) + barBandScale.bandwidth() / 2;
      const secY = yScale(report.secondaryPeakHour.studyMinutes);

      const secAnnotation = g
        .append("g")
        .attr("transform", `translate(${secX}, ${Math.max(12, secY - 14)})`);

      secAnnotation
        .append("rect")
        .attr("x", -46)
        .attr("y", -14)
        .attr("width", 92)
        .attr("height", 18)
        .attr("rx", 5)
        .attr("fill", "#1C2333")
        .attr("stroke", "#60A5FA")
        .attr("stroke-width", 1);

      secAnnotation
        .append("text")
        .attr("x", 0)
        .attr("y", -2)
        .attr("text-anchor", "middle")
        .attr("fill", "#93C5FD")
        .attr("font-size", "9px")
        .attr("font-family", "monospace")
        .attr("font-weight", "bold")
        .text("EVENING PEAK");

      // X-Axis (Hours)
      const xAxisGroup = g
        .append("g")
        .attr("transform", `translate(0, ${innerHeight})`)
        .attr("class", "x-axis");

      xAxisGroup
        .selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("x", (d) => (barBandScale(d.hour) || 0) + barBandScale.bandwidth() / 2)
        .attr("y", 18)
        .attr("text-anchor", "middle")
        .attr("fill", (d) =>
          d.hour % 3 === 0 || d.hour === report.peakHour.hour
            ? "#1C2333"
            : "#94A3B8"
        )
        .attr("font-size", (d) => (d.hour % 3 === 0 ? "10px" : "8px"))
        .attr("font-family", "monospace")
        .attr("font-weight", (d) =>
          d.hour % 3 === 0 || d.hour === report.peakHour.hour ? "bold" : "normal"
        )
        .text((d) => (d.hour % 3 === 0 ? d.shortLabel : ""));

      // Bottom Axis Baseline
      g.append("line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", innerHeight)
        .attr("y2", innerHeight)
        .attr("stroke", "#CBD5E1")
        .attr("stroke-width", 1.5);

      // Y-Axis Labels (Minutes)
      const yAxisGroup = g.append("g").attr("class", "y-axis");
      yAxisGroup
        .selectAll("text")
        .data(yTicks)
        .enter()
        .append("text")
        .attr("x", -10)
        .attr("y", (d) => yScale(d) + 3)
        .attr("text-anchor", "end")
        .attr("fill", "#64748B")
        .attr("font-size", "10px")
        .attr("font-family", "monospace")
        .text((d) => `${d}m`);
    };

    renderChart();

    // ResizeObserver for responsive redraw
    const resizeObserver = new ResizeObserver(() => {
      renderChart();
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [report, isSabbath]);

  const renderPeriodIcon = (iconName: string, className = "w-4 h-4") => {
    switch (iconName) {
      case "Sunrise":
        return <Sunrise className={className} />;
      case "Sunset":
        return <Sunset className={className} />;
      case "Moon":
        return <Moon className={className} />;
      default:
        return <Sun className={className} />;
    }
  };

  return (
    <div
      className={`rounded-3xl border p-6 sm:p-8 space-y-6 transition-all duration-300 shadow-sm ${
        isSabbath
          ? "bg-white border-[#C9973A]/40 text-[#2C2314]"
          : "bg-white border-[#E8E4DA] text-stone-900"
      }`}
      id="most-active-time-of-day-chart"
    >
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9973A] font-extrabold">
              D3 Cognitive Telemetry
            </span>
            <span className="px-2 py-0.5 bg-amber-50 text-[#C9973A] border border-amber-200/80 rounded-full text-[10px] font-mono font-bold">
              24-Hour Focus Vector
            </span>
          </div>
          <h3 className="font-serif font-extrabold text-xl sm:text-2xl text-[#1C2333] mt-0.5">
            Most Active Time of Day & Focus Velocity
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time circadian study telemetry visualizing when your mind achieves highest scripture retention.
          </p>
        </div>

        {/* Focus Period Quick Badge */}
        <div className="flex items-center space-x-3 self-start md:self-auto bg-stone-50 p-2 rounded-2xl border border-stone-200/80">
          <div className="p-2 bg-[#C9973A] text-white rounded-xl shadow-2xs">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] font-mono uppercase text-stone-400 font-bold block">
              Optimal Focus Window
            </span>
            <span className="font-serif font-bold text-xs sm:text-sm text-[#1C2333]">
              {report.mostFocusedWindow}
            </span>
          </div>
        </div>
      </div>

      {/* D3 Chart Canvas Wrapper */}
      <div className="relative w-full" ref={containerRef} id="d3-hourly-chart-container">
        {/* SVG Viewport */}
        <svg ref={svgRef} className="w-full h-auto overflow-visible select-none" />

        {/* Floating Custom Tooltip */}
        {tooltipPos.visible && hoveredHour && (
          <div
            className="pointer-events-none absolute z-30 bg-[#1C2333] text-white p-3 rounded-2xl shadow-xl border border-[#C9973A]/50 text-xs w-60 space-y-1.5 transition-transform duration-75"
            style={{
              left: `${Math.min(
                (containerRef.current?.clientWidth || 600) - 250,
                Math.max(10, tooltipPos.x - 120)
              )}px`,
              top: `${Math.max(0, tooltipPos.y - 120)}px`
            }}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <span className="font-serif font-bold text-amber-400 text-sm">
                {hoveredHour.label}
              </span>
              <span className="text-[10px] font-mono text-stone-400 uppercase px-1.5 py-0.5 bg-white/10 rounded">
                {hoveredHour.periodKey.replace("_", " ")}
              </span>
            </div>

            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-stone-400">Focus Time:</span>
                <span className="font-bold text-white">
                  {hoveredHour.studyMinutes} minutes
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Study Sessions:</span>
                <span className="font-bold text-emerald-400">
                  {hoveredHour.sessionCount} recorded
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Intensity:</span>
                <span className="font-bold text-amber-300">
                  {hoveredHour.intensity}%
                </span>
              </div>
            </div>

            <div className="pt-1 border-t border-white/10 text-[10px] text-stone-300 font-sans leading-tight">
              <strong className="text-[#C9973A] block font-mono">Primary Focus:</strong>
              {hoveredHour.topModule}
            </div>
          </div>
        )}
      </div>

      {/* 4 PERIOD HIGHLIGHTS COMPARISON CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2" id="devotional-period-cards">
        {report.periodSummaries.slice(0, 4).map((period) => {
          const isPeak = period.periodKey === "dawn" || period.periodKey === "evening";

          return (
            <div
              key={period.periodKey}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-3 transition-all relative overflow-hidden ${
                isPeak
                  ? "bg-stone-50/80 border-[#C9973A]/60 shadow-2xs"
                  : "bg-[#FAF9F5]/70 border-stone-200/80"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div
                    className="p-2 rounded-xl text-white shadow-xs"
                    style={{ backgroundColor: period.color }}
                  >
                    {renderPeriodIcon(period.iconName, "w-4 h-4")}
                  </div>
                  <span
                    className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${period.color}20`,
                      color: period.color
                    }}
                  >
                    {period.percentage}% of Day
                  </span>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-sm text-[#1C2333]">
                    {period.periodName}
                  </h4>
                  <span className="text-[10px] font-mono text-stone-500 block">
                    {period.timeRange}
                  </span>
                </div>

                <div className="flex items-baseline space-x-1 font-mono">
                  <span className="text-lg font-extrabold text-[#1C2333]">
                    {period.totalMinutes}
                  </span>
                  <span className="text-xs text-stone-500">mins total</span>
                </div>
              </div>

              {/* Spiritual theme quote */}
              <div className="pt-2 border-t border-stone-200/60 text-[10px] font-serif italic text-stone-600 line-clamp-2">
                {period.spiritualTheme}
              </div>
            </div>
          );
        })}
      </div>

      {/* Berean Circadian Focus Recommendation */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1C2333] to-[#232D42] rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#2C374D]">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 bg-[#C9973A]/20 border border-[#C9973A]/40 text-[#C9973A] rounded-xl shrink-0 mt-0.5">
            <Brain className="w-5 h-5 text-[#C9973A]" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9973A] font-extrabold block">
              Circadian Retention Intelligence
            </span>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-sans">
              {report.recommendedFocusInsight.replace(/\*\*/g, "")}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center space-x-2">
          <span className="text-xs font-mono text-amber-300 font-bold bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
            96% Peak Retrieval Efficiency
          </span>
        </div>
      </div>
    </div>
  );
};
