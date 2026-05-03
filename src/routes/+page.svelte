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

  function _rq() {
    return _queries[Math.floor(Math.random() * _queries.length)];
  }

  onMount(async () => {
    try { _ds = await _g9(_rq()); _p1k.set(_ds); }
    catch (e) { _er = e.message; }
    finally { _ld = false; }
  });

  async function _pl(item, idx) {
    _m3v.set(true);
    await new Promise(r => setTimeout(r, 1400 + Math.random() * 600));
    _q8z.set(item); _x9a.set(idx); _p1k.set(_ds);
    _m3v.set(false);
  }

  function _fmt(v) {
    if (!v) return '';
    const n = parseInt(v.replace(/\D/g, '') || '0');
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'Jt views';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'Rb views';
    return n + ' views';
  }
</script>

<div style="max-width:560px;margin:0 auto;padding:24px 16px 0">

  <div style="margin-bottom:20px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
      <div style="width:5px;height:26px;border-radius:3px;background:linear-gradient(to bottom,#FFD700,#FFC300);flex-shrink:0"></div>
      <h1 class="text-glow" style="font-size:1.5rem;font-weight:700;color:#FFD700;margin:0">Musictory</h1>
    </div>
    <p style="color:rgba(255,246,204,.45);font-size:.78rem;margin-left:15px">Lagu Trending 2025 🔥</p>
  </div>

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
    <div style="display:flex;flex-direction:column;gap:10px;padding-bottom:16px">
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
