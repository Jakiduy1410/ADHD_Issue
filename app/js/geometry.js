/* ============================================================
   MODULE: DYNAMIC GEOMETRY SVG SCAFFOLDING
   ============================================================ */
    /* ============================================================
       DYNAMIC GEOMETRY SVG COMPONENT & AI COACH TELEMETRY OBSERVER
       ============================================================ */
    function renderGeometrySvg(spec) {
      if (!spec || !spec.shape_type) return '';
      const shape = spec.shape_type;
      const dims = spec.dimensions || {};
      const isArea = spec.target === 'area' || spec.target === 'remaining_area';
      const isPerimeter = spec.target === 'perimeter';

      if (shape === 'rectangle' || shape === 'square') {
        const lenLabel = dims.length || dims.side || "15 m";
        const widLabel = dims.width || dims.side || "8 m";
        return `
          <div class="my-1.5 p-2 bg-white rounded-2xl border-2 border-teal-200 flex flex-col items-center justify-center shadow-xs">
            <svg viewBox="0 0 280 140" class="w-full max-w-[260px] h-[120px] overflow-visible select-none">
              <line x1="40" y1="18" x2="240" y2="18" stroke="#0D9488" stroke-width="2" />
              <text x="140" y="14" text-anchor="middle" font-size="11" font-weight="bold" fill="#0F766E">Dài: ${lenLabel}</text>
              
              <rect x="40" y="24" width="200" height="90" rx="8"
                fill="${isArea ? 'rgba(16, 185, 129, 0.20)' : '#F8FAFC'}"
                stroke="${isPerimeter ? '#F59E0B' : '#0D9488'}"
                stroke-width="${isPerimeter ? '4' : '2.5'}"
                stroke-dasharray="${isPerimeter ? '8 4' : 'none'}" />
              
              <text x="140" y="74" text-anchor="middle" font-size="12" font-weight="900" fill="${isArea ? '#047857' : (isPerimeter ? '#B45309' : '#334155')}">
                ${isArea ? 'Diện tích S = Dài × Rộng' : (isPerimeter ? 'Chu vi P = (Dài + Rộng) × 2' : 'Hình chữ nhật')}
              </text>
              
              <line x1="248" y1="24" x2="248" y2="114" stroke="#0D9488" stroke-width="2" />
              <text x="254" y="73" font-size="10" font-weight="bold" fill="#0F766E" dominant-baseline="middle">Rộng: ${widLabel}</text>
            </svg>
          </div>
        `;
      } else if (shape === 'parallelogram') {
        const baseLabel = dims.base || dims.length || "24 m";
        const heightLabel = dims.height || "15 m";
        return `
          <div class="my-1.5 p-2 bg-white rounded-2xl border-2 border-teal-200 flex flex-col items-center justify-center shadow-xs">
            <svg viewBox="0 0 280 140" class="w-full max-w-[260px] h-[120px] overflow-visible select-none">
              <polygon points="65,115 245,115 215,25 35,25"
                fill="${isArea ? 'rgba(16, 185, 129, 0.20)' : '#F8FAFC'}"
                stroke="${isPerimeter ? '#F59E0B' : '#0D9488'}"
                stroke-width="${isPerimeter ? '4' : '2.5'}"
                stroke-dasharray="${isPerimeter ? '8 4' : 'none'}" />
              
              <line x1="65" y1="25" x2="65" y2="115" stroke="#E11D48" stroke-width="2" stroke-dasharray="4 4" />
              <rect x="65" y="105" width="10" height="10" fill="none" stroke="#E11D48" stroke-width="1.5" />
              <text x="70" y="72" font-size="10" font-weight="bold" fill="#BE123C">h = ${heightLabel}</text>
              
              <text x="155" y="132" text-anchor="middle" font-size="11" font-weight="bold" fill="#0F766E">Đáy a = ${baseLabel}</text>
              <text x="150" y="72" text-anchor="middle" font-size="12" font-weight="900" fill="#047857">S = a × h</text>
            </svg>
          </div>
        `;
      } else if (shape === 'nested') {
        const outerLen = dims.length || "20 m";
        const outerWid = dims.width || "15 m";
        const nestedName = spec.nested_label || "Ao cá";
        return `
          <div class="my-1.5 p-2 bg-white rounded-2xl border-2 border-teal-200 flex flex-col items-center justify-center shadow-xs">
            <svg viewBox="0 0 280 140" class="w-full max-w-[260px] h-[125px] overflow-visible select-none">
              <rect x="30" y="20" width="220" height="105" rx="8" fill="rgba(220, 252, 231, 0.85)" stroke="#059669" stroke-width="2.5" />
              <text x="140" y="15" text-anchor="middle" font-size="10" font-weight="bold" fill="#065F46">Vườn cây: ${outerLen} × ${outerWid}</text>
              
              <rect x="135" y="50" width="85" height="50" rx="6" fill="rgba(186, 230, 253, 0.9)" stroke="#0284C7" stroke-width="2" stroke-dasharray="4 2" />
              <text x="177" y="80" text-anchor="middle" font-size="10" font-weight="bold" fill="#0369A1">${nestedName}</text>
              <text x="75" y="78" text-anchor="middle" font-size="9" font-weight="black" fill="#047857">Phần đất còn lại<br/>S = S(vườn) - S(ao)</text>
            </svg>
          </div>
        `;
      } else if (shape === 'house' || shape === 'house_counting') {
        return `
          <div class="my-1.5 p-2 bg-white rounded-2xl border-2 border-teal-200 flex flex-col items-center justify-center shadow-xs select-none">
            <svg viewBox="0 0 280 155" class="w-full max-w-[260px] h-[135px] overflow-visible">
              <!-- Mái nhà hình tam giác (chạm vào sẽ hướng dẫn tìm hình tròn) -->
              <polygon points="140,15 50,65 230,65" fill="#FCA5A5" stroke="#DC2626" stroke-width="2.5" stroke-linejoin="round"
                class="cursor-pointer hover:opacity-85 transition" onclick="handleHouseWindowWrongClick(this, 'mái tam giác 🔺')" />
              <text x="140" y="48" text-anchor="middle" font-size="10" font-weight="extrabold" fill="#991B1B" pointer-events="none">Mái tam giác</text>
              
              <!-- Thân nhà hình chữ nhật -->
              <rect x="65" y="65" width="150" height="80" rx="4" fill="#FEF08A" stroke="#CA8A04" stroke-width="2.5" pointer-events="none" />
              
              <!-- Cửa chính hình chữ nhật -->
              <rect x="122" y="95" width="36" height="50" rx="3" fill="#FED7AA" stroke="#EA580C" stroke-width="2"
                class="cursor-pointer hover:opacity-85 transition" onclick="handleHouseWindowWrongClick(this, 'cửa chính hình chữ nhật 🚪')" />
              <text x="140" y="122" text-anchor="middle" font-size="8" font-weight="bold" fill="#C2410C" pointer-events="none">Cửa chính</text>
              
              <!-- Cửa sổ tròn 1 bên trái (ẤN VÀO LÀ ĐÚNG) -->
              <g class="cursor-pointer group" onclick="handleHouseWindowClick(this, 1)">
                <circle cx="95" cy="95" r="16" fill="#BAE6FD" stroke="#0284C7" stroke-width="3" id="house-circle-win-1" class="transition-all duration-300 group-hover:scale-110" />
                <line x1="95" y1="79" x2="95" y2="111" stroke="#0284C7" stroke-width="1.5" pointer-events="none" />
                <line x1="79" y1="95" x2="111" y2="95" stroke="#0284C7" stroke-width="1.5" pointer-events="none" />
                <text x="95" y="125" text-anchor="middle" font-size="9" font-weight="900" fill="#0369A1" pointer-events="none">Cửa sổ 1 🔵</text>
              </g>
              
              <!-- Cửa sổ tròn 2 bên phải (ẤN VÀO LÀ ĐÚNG) -->
              <g class="cursor-pointer group" onclick="handleHouseWindowClick(this, 2)">
                <circle cx="185" cy="95" r="16" fill="#BAE6FD" stroke="#0284C7" stroke-width="3" id="house-circle-win-2" class="transition-all duration-300 group-hover:scale-110" />
                <line x1="185" y1="79" x2="185" y2="111" stroke="#0284C7" stroke-width="1.5" pointer-events="none" />
                <line x1="169" y1="95" x2="201" y2="95" stroke="#0284C7" stroke-width="1.5" pointer-events="none" />
                <text x="185" y="125" text-anchor="middle" font-size="9" font-weight="900" fill="#0369A1" pointer-events="none">Cửa sổ 2 🔵</text>
              </g>
            </svg>
            <div id="house-click-feedback" class="text-[11px] font-bold text-center text-slate-500 mt-1 min-h-[16px]">
              👆 Bé hãy chạm vào cửa sổ hình tròn trên ngôi nhà nhé!
            </div>
          </div>
        `;
      }
      return '';
    }

