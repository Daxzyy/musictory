<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { _g9 } from '$lib/api.js';
  import { _q8z, _p1k, _x9a } from '$lib/store.js';

  const __cv = _q8z;
  let _ds = [], _ld = true, _er = null;
  let _loadingId = null;

  const _queries = [
    'lagu viral tiktok 2026',
    'dj terbaru 2026',
    'lagu sad terbaru 2026',
    'hipdut terbaru 2026',
    'lagu sad viral tiktok 2026',
    'lagu trend tiktok 2026',
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

  async function _pl(item, idx) {
    _loadingId = item.videoId;
    _p1k.set(_ds);
    _x9a.set(idx);
    _q8z.set(item);
    setTimeout(() => { _loadingId = null; }, 3000);
  }
</script>

<div style="max-width:560px;margin:0 auto;padding:28px 16px 0">

  <div style="margin-bottom:24px">
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:10px">

      <div style="position:relative;width:48px;height:48px;flex-shrink:0">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="22" stroke="#FFD700" stroke-width="2" fill="rgba(255,215,0,0.06)"/>
          <circle cx="24" cy="24" r="15" stroke="rgba(255,215,0,0.35)" stroke-width="1" fill="none"/>
          <circle cx="24" cy="24" r="8" fill="rgba(255,215,0,0.12)" stroke="rgba(255,215,0,0.5)" stroke-width="1"/>
          <circle cx="24" cy="24" r="19" stroke="rgba(255,215,0,0.15)" stroke-width="0.75" fill="none"/>
          <circle cx="24" cy="24" r="17" stroke="rgba(255,215,0,0.12)" stroke-width="0.75" fill="none"/>
          <circle cx="24" cy="24" r="12" stroke="rgba(255,215,0,0.2)" stroke-width="0.75" fill="none"/>
          <circle cx="24" cy="24" r="10" stroke="rgba(255,215,0,0.15)" stroke-width="0.75" fill="none"/>
          <circle cx="24" cy="24" r="2.5" fill="#FFD700"/>
          <line x1="36" y1="12" x2="28" y2="20" stroke="#FFD700" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="36" cy="12" r="1.5" fill="#FFD700"/>
        </svg>
      </div>

      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:baseline;gap:0px;line-height:1">
          <span style="font-size:1.75rem;font-weight:700;color:#FFD700;letter-spacing:-.02em;font-family:'Quicksand',sans-serif">music</span>
          <span style="font-size:1.75rem;font-weight:400;color:rgba(255,246,204,0.75);letter-spacing:-.02em;font-family:'Quicksand',sans-serif">tory</span>
        </div>
        <div style="margin-top:5px;display:inline-flex;align-items:center;gap:5px;
          background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.2);
          border-radius:99px;padding:2px 10px">
          <span style="font-size:.6rem;font-weight:700;color:#FFD700;letter-spacing:.12em;text-transform:uppercase">Your music, your story</span>
        </div>
      </div>

      <button
        on:click={() => goto('/search')}
        style="width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;
          background:rgba(255,215,0,0.07);border:1px solid rgba(255,215,0,0.15);
          cursor:pointer;color:rgba(255,215,0,0.7);flex-shrink:0;transition:all .15s"
        onmouseenter="this.style.background='rgba(255,215,0,0.18)';this.style.color='#FFD700';this.style.borderColor='rgba(255,215,0,0.4)'"
        onmouseleave="this.style.background='rgba(255,215,0,0.07)';this.style.color='rgba(255,215,0,0.7)';this.style.borderColor='rgba(255,215,0,0.15)'"
        aria-label="Cari lagu"
      >
        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
      </button>

    </div>
  </div>

  {#if _ld}
    <div style="display:flex;flex-direction:column;gap:10px">
      {#each Array(6) as _}
        <div class="glass-card" style="border-radius:16px;padding:12px;display:flex;gap:12px;align-items:center">
          <div class="skeleton" style="width:72px;height:72px;border-radius:8px;flex-shrink:0"></div>
          <div style="flex:1;display:flex;flex-direction:column;gap:8px">
            <div class="skeleton" style="height:11px;width:75%;border-radius:6px"></div>
            <div class="skeleton" style="height:9px;width:40%;border-radius:6px"></div>
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
              style="width:72px;height:72px;border-radius:8px;object-fit:cover;display:block" loading="lazy" />
            {#if _loadingId === item.videoId}
              <div style="position:absolute;inset:0;border-radius:8px;background:rgba(10,10,10,.7);display:flex;align-items:center;justify-content:center">
                <div class="mini-spin"></div>
              </div>
            {:else if $__cv?.videoId === item.videoId}
              <div style="position:absolute;inset:0;border-radius:8px;background:rgba(10,10,10,.55);display:flex;align-items:center;justify-content:center">
                <svg width="20" height="20" fill="#FFD700" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
              </div>
            {/if}
          </div>
          <div style="flex:1;min-width:0">
            <p style="font-size:.84rem;font-weight:700;line-height:1.35;
              display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
              color:{$_q8z?.videoId === item.videoId ? '#FFD700' : '#FFF6CC'};margin-bottom:4px">
              {item.title}
            </p>
            {#if item.author}
              <p style="font-size:.72rem;font-weight:500;color:rgba(255,255,255,.4);margin:0;
                white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                {item.author}
              </p>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  {/if}

  {#if !_ld && !_er}
  <div style="padding:20px 0 24px;text-align:center">
    <span style="font-size:.62rem;color:rgba(255,215,0,.2);letter-spacing:.12em;font-weight:600">· dibuat dengan ❤️ oleh givy ·</span>
  </div>
  {/if}

</div>

<style>
  .mini-spin {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 2.5px solid rgba(255,215,0,.2);
    border-top-color: #FFD700;
    animation: _mspin .7s linear infinite;
  }
  @keyframes _mspin { to { transform: rotate(360deg); } }
</style>
