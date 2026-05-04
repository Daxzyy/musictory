<script>
  import { onMount } from 'svelte';
  import { _g9 } from '$lib/api.js';
  import { _q8z, _m3v, _p1k, _x9a } from '$lib/store.js';

  const __cv = _q8z;
  let _ds = [], _ld = true, _er = null;

  const _queries = [
    'lagu trend indonesia 2026',
    'lagu viral tiktok 2026',
    'dj terbaru 2026',
    'lagu sad terbaru 2026',
    'lagu galau terbaru 2026',
  ];

  function _shuffle(arr) { return arr.sort(() => Math.random() - 0.5); }
  function _pick(n) { return _shuffle([..._queries]).slice(0, n); }

  onMount(async () => {
    try {
      const picked = _pick(3);
      const results = await Promise.all(picked.map(q => _g9(q)));
      const seen = new Set();
      const merged = [];
      for (const list of results) {
        for (const item of list) {
          if (!seen.has(item.videoId)) { seen.add(item.videoId); merged.push(item); }
        }
      }
      _ds = _shuffle(merged);
      _p1k.set(_ds);
    } catch (e) {
      _er = e.message;
    } finally {
      _ld = false;
    }
  });

  function _pl(item, idx) {
    _m3v.set(true);
    _p1k.set(_ds);
    _x9a.set(idx);
    _q8z.set(item);
  }

  function _fmt(v) {
    if (!v) return '';
    const n = parseInt(v.replace(/\D/g, '') || '0');
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'Jt views';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'Rb views';
    return n + ' views';
  }
</script>

<div style="max-width:560px;margin:0 auto;padding:28px 16px 0">

  <!-- BRAND HEADER BARU -->
  <div style="margin-bottom:28px">

    <!-- Logo lockup -->
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:10px">

      <!-- Logo mark: vinyl disc icon -->
      <div style="position:relative;width:48px;height:48px;flex-shrink:0">
        <!-- Outer ring -->
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="22" stroke="#FFD700" stroke-width="2" fill="rgba(255,215,0,0.06)"/>
          <circle cx="24" cy="24" r="15" stroke="rgba(255,215,0,0.35)" stroke-width="1" fill="none"/>
          <circle cx="24" cy="24" r="8" fill="rgba(255,215,0,0.12)" stroke="rgba(255,215,0,0.5)" stroke-width="1"/>
          <!-- groove lines -->
          <circle cx="24" cy="24" r="19" stroke="rgba(255,215,0,0.15)" stroke-width="0.75" fill="none"/>
          <circle cx="24" cy="24" r="17" stroke="rgba(255,215,0,0.12)" stroke-width="0.75" fill="none"/>
          <circle cx="24" cy="24" r="12" stroke="rgba(255,215,0,0.2)" stroke-width="0.75" fill="none"/>
          <circle cx="24" cy="24" r="10" stroke="rgba(255,215,0,0.15)" stroke-width="0.75" fill="none"/>
          <!-- center hole -->
          <circle cx="24" cy="24" r="2.5" fill="#FFD700"/>
          <!-- needle arm hint -->
          <line x1="36" y1="12" x2="28" y2="20" stroke="#FFD700" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="36" cy="12" r="1.5" fill="#FFD700"/>
        </svg>
      </div>

      <!-- Wordmark -->
      <div>
        <div style="display:flex;align-items:baseline;gap:0px;line-height:1">
          <!-- MUSIC in gold, heavy -->
          <span style="font-size:1.75rem;font-weight:700;color:#FFD700;letter-spacing:-.02em;font-family:'Quicksand',sans-serif">music</span>
          <!-- TORY in muted warm white -->
          <span style="font-size:1.75rem;font-weight:400;color:rgba(255,246,204,0.75);letter-spacing:-.02em;font-family:'Quicksand',sans-serif">tory</span>
        </div>
        <!-- tagline pill -->
        <div style="margin-top:5px;display:inline-flex;align-items:center;gap:5px;
          background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.2);
          border-radius:99px;padding:2px 10px">
          <span style="font-size:.6rem;font-weight:700;color:#FFD700;letter-spacing:.12em;text-transform:uppercase">Your music, your story</span>
        </div>
      </div>
    </div>

    <!-- Section label -->
    <div style="display:flex;align-items:center;gap:8px;margin-top:4px">
      <div style="height:1px;width:16px;background:rgba(255,215,0,0.3);border-radius:99px"></div>
      <span style="font-size:.7rem;font-weight:600;color:rgba(255,215,0,0.55);letter-spacing:.08em">Lagu Trending 2026 🔥</span>
    </div>

  </div>
  <!-- END BRAND HEADER -->

  {#if _ld}
    <div style="display:flex;flex-direction:column;gap:10px">
      {#each Array(6) as _}
        <div class="glass-card" style="border-radius:16px;padding:12px;display:flex;gap:12px;align-items:center">
          <div class="skeleton" style="width:72px;height:72px;border-radius:12px;flex-shrink:0"></div>
          <div style="flex:1;display:flex;flex-direction:column;gap:8px">
            <div class="skeleton" style="height:11px;width:75%;border-radius:6px"></div>
            <div class="skeleton" style="height:9px;width:50%;border-radius:6px"></div>
            <div class="skeleton" style="height:9px;width:35%;border-radius:6px"></div>
          </div>
        </div>
      {/each}
    </div>

  {:else if _er}
    <div class="glass-card" style="border-radius:16px;padding:24px;text-align:center;color:rgba(255,246,204,.55)">
      <p style="font-size:.875rem">Gagal memuat data 😔</p>
      <p style="font-size:.75rem;margin-top:4px;opacity:.6">{_er}</p>
    </div>

  {:else}
    <div style="display:flex;flex-direction:column;gap:10px;padding-bottom:8px">
      {#each _ds as item, i}
        <button on:click={() => _pl(item, i)}
          class="glass-card"
          style="border-radius:16px;padding:12px;display:flex;gap:12px;align-items:center;text-align:left;width:100%;cursor:pointer;
            {$_q8z?.videoId === item.videoId ? 'border-color:rgba(255,215,0,.38);box-shadow:0 0 18px rgba(255,215,0,.13)' : ''}"
        >
          <div style="position:relative;flex-shrink:0">
            <img src={item.thumbnail} alt={item.title}
              style="width:72px;height:72px;border-radius:12px;object-fit:cover;display:block" loading="lazy" />
            {#if $__cv?.videoId === item.videoId}
              <div style="position:absolute;inset:0;border-radius:12px;background:rgba(10,10,10,.65);display:flex;align-items:center;justify-content:center">
                <svg width="22" height="22" fill="#FFD700" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
              </div>
            {/if}
          </div>
          <div style="flex:1;min-width:0">
            <p style="font-size:.82rem;font-weight:600;line-height:1.35;
              display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
              color:{$_q8z?.videoId === item.videoId ? '#FFD700' : '#FFF6CC'};margin-bottom:6px">{item.title}</p>
            <div style="display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center">
              <span style="display:flex;align-items:center;gap:3px;color:rgba(255,215,0,.75);font-size:.68rem">
                <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>
                {item.duration}
              </span>
              {#if item.views}
                <span style="color:rgba(255,246,204,.38);font-size:.68rem">{_fmt(item.views)}</span>
              {/if}
              {#if item.uploaded}
                <span style="color:rgba(255,246,204,.28);font-size:.65rem">{item.uploaded}</span>
              {/if}
            </div>
          </div>
          {#if i < 3}
            <div class="gold-gradient" style="width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;color:#0A0A0A;flex-shrink:0">{i + 1}</div>
          {/if}
        </button>
      {/each}
    </div>
  {/if}

</div>
