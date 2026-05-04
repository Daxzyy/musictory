<div style="max-width:560px;margin:0 auto;padding:28px 16px 0;min-height:80vh;display:flex;flex-direction:column">

  <!-- Header -->
  <div style="margin-bottom:32px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
      <div style="width:5px;height:26px;border-radius:3px;background:linear-gradient(to bottom,#FFD700,#FFC300);flex-shrink:0"></div>
      <h1 style="font-size:1.35rem;font-weight:700;color:#FFD700;margin:0">Developer</h1>
    </div>
    <p style="font-size:.72rem;color:rgba(255,246,204,.3);margin-left:15px;margin-top:2px;letter-spacing:.04em">Orang dibalik layar 🎬</p>
  </div>

  <!-- Profile card -->
  <div class="glass-card" style="border-radius:20px;padding:24px;margin-bottom:16px;display:flex;flex-direction:column;align-items:center;gap:16px;
    border-color:rgba(255,215,0,0.18);box-shadow:0 0 28px rgba(255,215,0,0.06)">

    <!-- Avatar with vinyl ring -->
    <div style="position:relative;width:96px;height:96px">
      <div style="width:96px;height:96px;border-radius:50%;background:linear-gradient(135deg,rgba(255,215,0,0.25),rgba(255,195,0,0.08));
        display:flex;align-items:center;justify-content:center;
        border:2px solid rgba(255,215,0,0.3)">
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <circle cx="22" cy="22" r="20" fill="rgba(255,215,0,0.1)" stroke="rgba(255,215,0,0.4)" stroke-width="1.5"/>
          <circle cx="22" cy="22" r="12" fill="rgba(255,215,0,0.08)" stroke="rgba(255,215,0,0.25)" stroke-width="1"/>
          <circle cx="22" cy="22" r="3" fill="#FFD700"/>
          <!-- letter G -->
          <text x="22" y="27" text-anchor="middle" fill="#FFD700" font-size="14" font-weight="700" font-family="Quicksand,sans-serif">G</text>
        </svg>
      </div>
      <!-- spinning ring -->
      <div style="position:absolute;inset:-5px;border-radius:50%;
        border:1.5px solid transparent;
        border-top-color:#FFD700;border-right-color:rgba(255,215,0,0.15);
        animation:devRing 3s linear infinite"></div>
    </div>

    <!-- Name & handle -->
    <div style="text-align:center">
      <p style="font-size:1.1rem;font-weight:700;color:#FFF6CC;margin:0 0 4px">Givy</p>
      <p style="font-size:.72rem;color:rgba(255,215,0,0.5);margin:0;letter-spacing:.06em">@givy · Creator & Developer</p>
    </div>

    <!-- Divider -->
    <div style="width:100%;height:1px;background:rgba(255,215,0,0.1)"></div>

    <!-- Bio -->
    <p style="font-size:.8rem;color:rgba(255,246,204,0.55);text-align:center;line-height:1.7;margin:0;max-width:280px">
      Bikin <span style="color:#FFD700;font-weight:600">Musictory</span> dari nol dengan cinta 🎵<br>
      Semoga musiknya menemanimu hari ini.
    </p>

    <!-- Stats row -->
    <div style="width:100%;display:flex;gap:8px">
      {#each [
        ['1', 'App'],
        ['2026', 'Year'],
        ['∞', 'Songs'],
      ] as [val, label]}
        <div style="flex:1;text-align:center;background:rgba(255,215,0,0.05);border:1px solid rgba(255,215,0,0.1);border-radius:12px;padding:10px 8px">
          <p style="font-size:1rem;font-weight:700;color:#FFD700;margin:0 0 2px">{val}</p>
          <p style="font-size:.62rem;color:rgba(255,246,204,.35);margin:0;letter-spacing:.06em">{label}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Tech stack card -->
  <div class="glass-card" style="border-radius:16px;padding:18px;margin-bottom:16px">
    <p style="font-size:.65rem;font-weight:700;color:rgba(255,215,0,0.45);letter-spacing:.1em;margin:0 0 14px">DIBANGUN DENGAN</p>
    <div style="display:flex;flex-direction:column;gap:10px">
      {#each [
        ['SvelteKit', 'Frontend framework'],
        ['Tailwind CSS', 'Styling'],
        ['Vercel', 'Deployment'],
        ['Web Audio API', 'Player engine'],
      ] as [tech, desc]}
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:6px;height:6px;border-radius:50%;background:#FFD700;flex-shrink:0"></div>
            <span style="font-size:.8rem;font-weight:600;color:#FFF6CC">{tech}</span>
          </div>
          <span style="font-size:.68rem;color:rgba(255,246,204,.35)">{desc}</span>
        </div>
      {/each}
    </div>
  </div>

  <!-- App info -->
  <div class="glass-card" style="border-radius:16px;padding:18px;margin-bottom:16px">
    <p style="font-size:.65rem;font-weight:700;color:rgba(255,215,0,0.45);letter-spacing:.1em;margin:0 0 14px">TENTANG APP</p>
    <div style="display:flex;flex-direction:column;gap:10px">
      {#each [
        ['Nama', 'Musictory'],
        ['Versi', '1.0.0'],
        ['Lisensi', 'Personal Use'],
      ] as [key, val]}
        <div style="display:flex;align-items:center;justify-content:space-between">
          <span style="font-size:.78rem;color:rgba(255,246,204,.45)">{key}</span>
          <span style="font-size:.78rem;font-weight:600;color:#FFF6CC">{val}</span>
        </div>
      {/each}
    </div>
  </div>

  <!-- Footer credit -->
  <div style="flex:1;display:flex;align-items:flex-end;justify-content:center;padding:24px 0">
    <p style="font-size:.62rem;color:rgba(255,215,0,.2);letter-spacing:.12em;font-weight:600;text-align:center">
      · made with 🎵 &amp; ❤️ by givy ·
    </p>
  </div>

</div>

<style>
  @keyframes devRing { to { transform: rotate(360deg); } }
</style>
