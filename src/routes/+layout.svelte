
<script>
  import { onMount } from 'svelte';
  import { _g9 } from '$lib/api.js';
  import { _q8z, _m3v, _p1k, _x9a } from '$lib/store.js';

  let _ds = [], _ld = true, _er = null;

  onMount(async () => {
    try { _ds = await _g9('lagu trend 2026'); _p1k.set(_ds); }
    catch(e) { _er = e.message; }
    finally { _ld = false; }
  });

  async function _pl(item, idx) {
    _m3v.set(true);
    await new Promise(r => setTimeout(r, 1400 + Math.random()*600));
    _q8z.set(item); _x9a.set(idx); _p1k.set(_ds);
    _m3v.set(false);
  }

  function _fmt(v) {
    if(!v)return''; const n=parseInt(v.replace(/\D/g,'')||'0');
    if(n>=1e6)return(n/1e6).toFixed(1)+'Jt views';
    if(n>=1e3)return(n/1e3).toFixed(1)+'Rb views';
    return n+' views';
  }
</script>

<div class="max-w-xl mx-auto px-4 pt-6">
  <div class="mb-6">
    <div class="flex items-center gap-2 mb-1">
      <div style="width:6px;height:24px;border-radius:3px;background:linear-gradient(to bottom,#FFD700,#FFC300)"></div>
      <h1 class="text-xl font-bold text-glow" style="color:#FFD700">Musictory</h1>
    </div>
    <p style="color:rgba(255,246,204,.5);font-size:.8rem">Lagu Trending 2026 🔥</p>
  </div>

  {#if _ld}
    <div class="grid gap-3">
      {#each Array(6) as _}
        <div class="glass rounded-2xl p-3 flex gap-3 items-center">
          <div class="skeleton rounded-xl flex-shrink-0" style="width:72px;height:72px"></div>
          <div class="flex-1 flex flex-col gap-2">
            <div class="skeleton rounded-full h-3 w-3/4"></div>
            <div class="skeleton rounded-full h-2 w-1/2"></div>
            <div class="skeleton rounded-full h-2 w-1/3"></div>
          </div>
        </div>
      {/each}
    </div>
  {:else if _er}
    <div class="glass rounded-2xl p-6 text-center" style="color:rgba(255,246,204,.6)">
      <p class="text-sm">Gagal memuat data 😔</p>
    </div>
  {:else}
    <div class="grid gap-3 pb-4">
      {#each _ds as item, i}
        <button on:click={() => _pl(item, i)}
          class="glass rounded-2xl p-3 flex gap-3 items-center card-hover text-left w-full"
          style="{$_q8z?.videoId===item.videoId?'border-color:rgba(255,215,0,.35);box-shadow:0 0 15px rgba(255,215,0,.15)':''}"
        >
          <div class="relative flex-shrink-0">
            <img src={item.thumbnail} alt={item.title} class="rounded-xl object-cover" style="width:72px;height:72px" loading="lazy"/>
            <div class="absolute inset-0 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity" style="background:rgba(10,10,10,.5)">
              <svg width="20" height="20" fill="#FFD700" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold leading-snug line-clamp-2 mb-1.5" style="color:{$_q8z?.videoId===item.videoId?'#FFD700':'#FFF6CC'}">{item.title}</p>
            <div class="flex flex-wrap gap-x-3 gap-y-1">
              <span class="flex items-center gap-1" style="color:rgba(255,215,0,.7);font-size:.7rem">
                <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>
                {item.duration}
              </span>
              {#if item.views}<span style="color:rgba(255,246,204,.4);font-size:.7rem">{_fmt(item.views)}</span>{/if}
              {#if item.uploaded}<span style="color:rgba(255,246,204,.3);font-size:.7rem">{item.uploaded}</span>{/if}
            </div>
          </div>
          {#if i < 3}
          <div class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style="background:linear-gradient(135deg,#FFD700,#FFC300);color:#0A0A0A">{i+1}</div>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>
