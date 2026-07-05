/**
 * RCP Data Imob — Logotipo oficial
 * Uso: <RcpLogo />               → só ícone (44 px)
 *      <RcpLogo size={56} />     → ícone maior
 *      <RcpLogo showText />      → ícone + texto
 *      <RcpLogo size={72} showText subtitle />  → versão hero
 */
export default function RcpLogo({
  size      = 44,
  showText  = false,
  subtitle  = false,
  className = '',
}) {
  const id = Math.random().toString(36).slice(2, 7); // evita conflito de ids SVG

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* ── Ícone SVG ────────────────────────────────────────── */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366F1" />
            <stop offset="1" stopColor="#14B8A6" />
          </linearGradient>
          <linearGradient id={`shimmer-${id}`} x1="0" y1="0" x2="44" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="rgba(255,255,255,0.0)" />
            <stop offset="0.5" stopColor="rgba(255,255,255,0.07)" />
            <stop offset="1" stopColor="rgba(255,255,255,0.0)" />
          </linearGradient>
        </defs>

        {/* Fundo arredondado */}
        <rect width="44" height="44" rx="12" fill={`url(#grad-${id})`} />

        {/* Shimmer diagonal */}
        <rect width="44" height="44" rx="12" fill={`url(#shimmer-${id})`} />

        {/* Borda interna suave */}
        <rect x="0.5" y="0.5" width="43" height="43" rx="11.5"
          stroke="rgba(255,255,255,0.18)" strokeWidth="1" />

        {/* ── Edifícios estilizados ────────────────────────── */}
        {/* Torre central — mais alta */}
        <rect x="18" y="13" width="8" height="22" rx="1.5" fill="white" />
        {/* Torre esquerda */}
        <rect x="8"  y="20" width="7" height="15" rx="1.5" fill="rgba(255,255,255,0.75)" />
        {/* Torre direita */}
        <rect x="29" y="23" width="7" height="12" rx="1.5" fill="rgba(255,255,255,0.75)" />

        {/* Janelas — torre central */}
        <rect x="20" y="16" width="2" height="2" rx="0.5" fill="rgba(99,102,241,0.55)" />
        <rect x="23" y="16" width="2" height="2" rx="0.5" fill="rgba(99,102,241,0.55)" />
        <rect x="20" y="20" width="2" height="2" rx="0.5" fill="rgba(99,102,241,0.55)" />
        <rect x="23" y="20" width="2" height="2" rx="0.5" fill="rgba(99,102,241,0.55)" />
        <rect x="20" y="24" width="2" height="2" rx="0.5" fill="rgba(20,184,166,0.5)" />
        <rect x="23" y="24" width="2" height="2" rx="0.5" fill="rgba(20,184,166,0.5)" />

        {/* Janelas — torre esquerda */}
        <rect x="10" y="22" width="2" height="2" rx="0.5" fill="rgba(99,102,241,0.45)" />
        <rect x="13" y="22" width="2" height="2" rx="0.5" fill="rgba(99,102,241,0.45)" />

        {/* Janelas — torre direita */}
        <rect x="31" y="25" width="2" height="2" rx="0.5" fill="rgba(20,184,166,0.45)" />
        <rect x="34" y="25" width="2" height="2" rx="0.5" fill="rgba(20,184,166,0.45)" />

        {/* Chão */}
        <rect x="6" y="36" width="32" height="1.5" rx="0.75" fill="rgba(255,255,255,0.25)" />
      </svg>

      {/* ── Texto (opcional) ─────────────────────────────────── */}
      {showText && (
        <div style={{ lineHeight: 1.2 }}>
          <p
            className="font-display font-800 tracking-tight text-white"
            style={{ fontSize: Math.round(size * 0.38) }}
          >
            <span className="gradient-text">RCP</span> Data Imob
          </p>
          {subtitle && (
            <p
              className="font-body text-slate-500 mt-0.5"
              style={{ fontSize: Math.round(size * 0.22) }}
            >
              Gestão Imobiliária
            </p>
          )}
        </div>
      )}
    </div>
  );
}
