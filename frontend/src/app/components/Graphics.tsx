import { useMemo } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';

// ============================================================
// Tipos de datos que esperan los gráficos
// ============================================================

/** Datos para el gráfico de barras: entradas vs salidas por mes */
export interface BarChartData {
  month: string;       // Ej: "Ene", "Feb", "Mar"
  entries: number;     // Cantidad de movimientos de entrada (IN)
  exits: number;       // Cantidad de movimientos de salida (OUT)
}

/** Datos para el gráfico de línea: tendencia de movimientos por mes */
export interface LineChartData {
  month: string;       // Ej: "Ene", "Feb", "Mar"
  total: number;       // Total de movimientos (IN + OUT) en ese mes
}

// ============================================================
// Helpers de tema
// ============================================================

/** Detecta si el modo oscuro está activo leyendo la clase .dark del DOM */
function isDarkMode(): boolean {
  return document.documentElement.classList.contains('dark');
}

/** Construye el tema de Nivo basado en las variables CSS actuales */
function buildNivoTheme() {
  const dark = isDarkMode();
  const text = dark ? '#d1d5db' : '#374151';
  const gridColor = dark ? '#374151' : '#e5e7eb';
  const axisColor = dark ? '#6b7280' : '#9ca3af';
  const tooltipBg = dark ? '#1f2937' : '#ffffff';
  const tooltipBorder = dark ? '#374151' : '#e5e7eb';
  const tooltipText = dark ? '#f3f4f6' : '#111827';

  return {
    background: 'transparent',
    text: {
      fontSize: 12,
      fill: text,
    },
    axis: {
      domain: {
        line: {
          stroke: axisColor,
          strokeWidth: 1,
        },
      },
      ticks: {
        line: {
          stroke: axisColor,
          strokeWidth: 1,
        },
        text: {
          fill: text,
          fontSize: 11,
        },
      },
      legend: {
        text: {
          fill: text,
          fontSize: 12,
        },
      },
    },
    grid: {
      line: {
        stroke: gridColor,
        strokeWidth: 1,
        strokeDasharray: '4, 4',
      },
    },
    legends: {
      text: {
        fill: text,
        fontSize: 12,
      },
    },
    tooltip: {
      container: {
        background: tooltipBg,
        border: `1px solid ${tooltipBorder}`,
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '12px',
        color: tooltipText,
        boxShadow: dark ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.1)',
      },
    },
  };
}

// Colores para los gráficos
function getBarColors() {
  return {
    entries: isDarkMode() ? '#34d399' : '#059669',   // emerald
    exits:  isDarkMode() ? '#fb7185' : '#e11d48',    // rose
  };
}

function getLineColor() {
  return isDarkMode() ? '#60a5fa' : '#2563eb';       // blue
}

// ============================================================
// Componente 1: Gráfico de barras — Entradas vs Salidas
// ============================================================

interface StockMovementBarChartProps {
  data: BarChartData[];
}

export function StockMovementBarChart({ data }: StockMovementBarChartProps) {
  const theme = buildNivoTheme();
  const colors = getBarColors();

  // Nivo espera: [{ month: "Ene", entries: 10, exits: 5 }, ...]
  const nivoData = useMemo(
    () => data.map((d) => ({ month: d.month, entries: d.entries, exits: d.exits })),
    [data]
  );

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-52 text-muted-foreground text-sm">
        <svg className="h-10 w-10 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        No hay datos de movimientos disponibles
      </div>
    );
  }

  return (
    <div className="h-52">
      <ResponsiveBar
        data={nivoData}
        keys={['entries', 'exits']}
        indexBy="month"
        theme={theme}
        margin={{ top: 30, right: 20, bottom: 40, left: 45 }}
        padding={0.35}
        innerPadding={3}
        groupMode="grouped"
        borderRadius={6}
        colors={({ id }) => (id === 'entries' ? colors.entries : colors.exits)}
        borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 8,
          tickRotation: 0,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 8,
          tickRotation: 0,
          tickValues: 4,
        }}
        enableGridY={true}
        gridYValues={4}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'top',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: -16,
            itemsSpacing: 16,
            itemWidth: 80,
            itemHeight: 16,
            itemDirection: 'left-to-right',
            itemOpacity: 0.85,
            symbolSize: 14,
            symbolShape: 'square',
            effects: [
              {
                on: 'hover',
                style: { itemOpacity: 1 },
              },
            ],
          },
        ]}
        animate={true}
        motionConfig="gentle"
        tooltip={({ id, value, indexValue }) => (
          <div className="px-3 py-2">
            <p className="font-semibold mb-1">{indexValue}</p>
            <p className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: id === 'entries' ? colors.entries : colors.exits }}
              />
              {id === 'entries' ? 'Entradas' : 'Salidas'}: <strong>{value.toLocaleString('es-AR')}</strong>
            </p>
          </div>
        )}
      />
    </div>
  );
}

// ============================================================
// Componente 2: Gráfico de línea — Tendencia de movimientos
// ============================================================

interface MovementTrendLineChartProps {
  data: LineChartData[];
}

export function MovementTrendLineChart({ data }: MovementTrendLineChartProps) {
  const theme = buildNivoTheme();
  const lineColor = getLineColor();

  // Nivo Line espera: [{ id: "total", data: [{ x: "Ene", y: 100 }, ...] }]
  const nivoData = useMemo(
    () => [
      {
        id: 'Movimientos',
        data: data.map((d) => ({ x: d.month, y: d.total })),
      },
    ],
    [data]
  );

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-52 text-muted-foreground text-sm">
        <svg className="h-10 w-10 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        No hay datos de tendencia disponibles
      </div>
    );
  }

  return (
    <div className="h-52">
      <ResponsiveLine
        data={nivoData}
        theme={theme}
        margin={{ top: 30, right: 20, bottom: 40, left: 45 }}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', min: 0, max: 'auto', stacked: false }}
        yFormat=" >-.2f"
        curve="monotoneX"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 8,
          tickRotation: 0,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 8,
          tickRotation: 0,
          tickValues: 4,
        }}
        enableGridY={true}
        gridYValues={4}
        pointSize={8}
        pointColor={lineColor}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor', modifiers: [['darker', 0.8]] }}
        pointLabel="y"
        pointLabelYOffset={-14}
        enableTouchCrosshair={true}
        useMesh={true}
        enableArea={true}
        areaOpacity={0.12}
        areaBlendMode="normal"
        lineWidth={3}
        colors={[lineColor]}
        animate={true}
        motionConfig="gentle"
        legends={[
          {
            anchor: 'top',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: -16,
            itemsSpacing: 16,
            itemWidth: 100,
            itemHeight: 16,
            itemDirection: 'left-to-right',
            itemOpacity: 0.85,
            symbolSize: 14,
            symbolShape: 'circle',
            effects: [
              {
                on: 'hover',
                style: { itemOpacity: 1 },
              },
            ],
          },
        ]}
        tooltip={({ point }) => (
          <div className="px-3 py-2">
            <p className="font-semibold mb-1">{point.data.xFormatted}</p>
            <p className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: lineColor }} />
              Movimientos: <strong>{point.data.yFormatted}</strong>
            </p>
          </div>
        )}
      />
    </div>
  );
}
