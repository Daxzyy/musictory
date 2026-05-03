<script>
  import { _g9 } from '$lib/api.js';
  import { _q8z, _m3v, _p1k, _x9a } from '$lib/store.js';

  let _qv = '', _ds = [], _ld = false, _t = null, _init = false;

  function _deb(val) {
    if(_t) clearTimeout(_t);
    if(!val.trim()) { _ds=[]; _init=false; return; }
    _ld = true; _init = true;
    _t = setTimeout(async () => {
      try { _ds = await _g9(val); _p1k.set(_ds); }
      catch(e) { _ds=[]; }
      finally { _ld=false; }
    }, 300);
  }

  $: _deb(_qv);

  async function _pl(item, idx) {
    _m3v.set(true);
    await new Promise(r => setTimeout(r, 1400+Math.random()*600));
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
  <div class="mb-5">
    <div class="flex items-center gap-2 mb-4">
      <div style="width:6px;height:24px;border-radius:3px;background:linear-gradient(to bottom,#FFD700,#FFC300)"></div>
      <h1 class="text-xl font-bold" style="color:#FFD700">Cari Lagu</h1>
    </div>
    <div class="relative">
      <div class="absolute left-4 top-1/2 -translate-y-1/2" style="color:rgba(255,215,0,.5)">
        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
      </div>
      <input
        bind:value={_qv}
        placeholder="Cari lagu, artis, album..."
        class="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none transition-all"
        style="background:rgba(255,215,0,.06);border:1px solid rgba(255,215,0,.15);color:#FFF6CC;font-family:Quicksand,sans-serif;font-size:.875rem"
        onfocus="this.style.borderColor='rgba(255,215,0,.4)';this.style.boxShadow='0 0 20px rgba(255,215,0,.1)'"
        onblur="this.style.borderColor='rgba(255,215,0,.15)';this.style.boxShadow='none'"
      />
      {#if _qv}
        <button on:click={()=>{_qv='';_ds=[];_init=false}}
          class="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
          style="color:rgba(255,246,204,.4)">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      {/if}
    </div>
  </div>

  {#if _ld}
    <div class="grid gap-3">
      {#each Array(5) as _}
        <div class="glass rounded-2xl p-3 flex gap-3 items-center">
          <div class="skeleton rounded-xl flex-shrink-0" style="width:72px;height:72px"></div>
          <div class="flex-1 flex flex-col gap-2">
            <div class="skeleton rounded-full h-3 w-3/4"></div>
            <div class="skeleton rounded-full h-2 w-1/2"></div>
          </div>
        </div>
      {/each}
    </div>
  {:else if !_init}
    <div class="flex flex-col items-center justify-center py-16 gap-4">
      <div style="width:64px;height:64px;border-radius:50%;background:rgba(255,215,0,.08);display:flex;align-items:center;justify-content:center">
        <svg width="28" height="28" fill="rgba(255,215,0,.5)" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
      </div>
      <p style="color:rgba(255,246,204,.4);font-size:.875rem">Ketik untuk mencari lagu favoritmu</p>
    </div>
  {:else if _ds.length===0}
    <div class="flex flex-col items-center justify-center py-16 gap-3">
      <p style="color:rgba(255,246,204,.5);font-size:.875rem">Tidak ada hasil untuk "<span style="color:#FFD700">{_qv}</span>"</p>
    </div>
  {:else}
    <div class="grid gap-3 pb-4">
      {#each _ds as item, i}
        <button on:click={()=>_pl(item,i)}
          class="glass rounded-2xl p-3 flex gap-3 items-center card-hover text-left w-full"
          style="{$_q8z?.videoId===item.videoId?'border-color:rgba(255,215,0,.35);box-shadow:0 0 15px rgba(255,215,0,.15)':''}"
        >
          <div class="relative flex-shrink-0">
            <img src={item.thumbnail} alt={item.title} class="rounded-xl object-cover" style="width:72px;height:72px" loading="lazy" />
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
              {#if item.views}
              <span style="color:rgba(255,246,204,.4);font-size:.7rem">{_fmt(item.views)}</span>
              {/if}
            </div>
          </div>
        </button>
      {/each}
    </div>
  {/if}
</div>
