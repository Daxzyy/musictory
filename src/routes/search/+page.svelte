<script>
  import { _g9 } from '$lib/api.js';
  import { _q8z, _p1k, _x9a, _searchQuery, _searchResults } from '$lib/store.js';

  let _ld = false, _t = null, _init = false;
  let _loadingId = null;

  let _qv = '';
  let _ds = [];

  const unsubQ = _searchQuery.subscribe(v => { _qv = v; });
  const unsubR = _searchResults.subscribe(v => {
    _ds = v;
    if (v.length > 0) _init = true;
  });

  import { onDestroy } from 'svelte';
  onDestroy(() => { unsubQ(); unsubR(); });

  function _deb(val) {
    if (_t) clearTimeout(_t);
    if (!val.trim()) {
      _ds = [];
      _searchResults.set([]);
      _init = false;
      return;
    }
    _ld = true;
    _init = true;
    _t = setTimeout(async () => {
      try {
        const results = await _g9(val);
        _ds = results;
        _searchResults.set(results);
        _p1k.set(results);
      } catch (e) {
        _ds = [];
        _searchResults.set([]);
      } finally {
        _ld = false;
      }
    }, 300);
  }

  function _onInput(e) {
    const val = e.target.value;
    _searchQuery.set(val);
    _deb(val);
  }

  function _clear() {
    _searchQuery.set('');
    _searchResults.set([]);
    _ds = [];
    _init = false;
  }

  async function _pl(item, idx) {
    _loadingId = item.videoId;
    _p1k.set(_ds);
    _x9a.set(idx);
    _q8z.set(item);
    setTimeout(() => { _loadingId = null; }, 3000);
  }

  function _fmt(v) {
    if (!v) return '';
    const n = parseInt(v.replace(/\D/g, '') || '0');
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'Jt views';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'Rb views';
    return n + ' views';
  }

  function _extractArtist(title) {
    if (!title) return '';
    const sep = title.match(/^(.+?)\s*[-–—|]\s*(.+)$/);
    if (sep) return sep[1].trim();
    return '';
  }

  function _cleanTitle(title) {
    if (!title) return title;
    const sep = title.match(/^(.+?)\s*[-–—|]\s*(.+)$/);
    if (sep) return sep[2].trim();
    return title;
  }
</script>

<div style="max-width:560px;margin:0 auto;padding:24px 16px 0">

  <div style="margin-bottom:18px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
      <div style="width:5px;height:26px;border-radius:3px;background:linear-gradient(to bottom,#FFD700,#FFC300);flex-shrink:0"></div>
      <h1 style="font-size:1.35rem;font-weight:700;color:#FFD700;margin:0">Cari Lagu</h1>
    </div>

    <div style="position:relative">
      <div style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:rgba(255,215,0,.5);pointer-events:none">
        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
      </div>
      <input
        value={_qv}
        on:input={_onInput}
        type="text"
        placeholder="Cari lagu, artis, album..."
        style="width:100%;background:rgba(255,215,0,.05);border:1.5px solid rgba(255,215,0,.16);color:#FFF6CC;
          font-family:'Quicksand',sans-serif;font-size:.875rem;font-weight:500;
          border-radius:14px;padding:13px 44px 13px 44px;outline:none;transition:border-color .2s,box-shadow .2s"
        on:focus={e => { e.target.style.borderColor='rgba(255,215,0,.45)'; e.target.style.boxShadow='0 0 0 3px rgba(255,215,0,.07)'; }}
        on:blur={e => { e.target.style.borderColor='rgba(255,215,0,.16)'; e.target.style.boxShadow='none'; }}
      />
      {#if _qv}
        <button on:click={_clear}
          style="position:absolute;right:14px;top:50%;transform:translateY(-50%);color:rgba(255,246,204,.4);background:none;border:none;cursor:pointer;padding:4px;transition:color .15s"
          onmouseenter="this.style.color='rgba(255,246,204,.8)'" onmouseleave="this.style.color='rgba(255,246,204,.4)'">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      {/if}
    </div>
  </div>

  {#if _ld}
    <div style="display:flex;flex-direction:column;gap:10px">
      {#each Array(5) as _}
        <div class="glass-card" style="border-radius:16px;padding:12px;display:flex;gap:12px;align-items:center">
          <div class="skeleton" style="width:72px;height:72px;border-radius:8px;flex-shrink:0"></div>
          <div style="flex:1;display:flex;flex-direction:column;gap:8px">
            <div class="skeleton" style="height:11px;width:72%;border-radius:6px"></div>
            <div class="skeleton" style="height:9px;width:48%;border-radius:6px"></div>
          </div>
        </div>
      {/each}
    </div>

  {:else if !_init}
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 0;gap:14px">
      <div style="width:62px;height:62px;border-radius:50%;background:rgba(255,215,0,.07);display:flex;align-items:center;justify-content:center">
        <svg width="26" height="26" fill="rgba(255,215,0,.45)" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
      </div>
      <p style="color:rgba(255,246,204,.38);font-size:.84rem">Ketik untuk mencari lagu favoritmu</p>
    </div>

  {:else if _ds.length === 0}
    <div style="display:flex;align-items:center;justify-content:center;padding:60px 0">
      <p style="color:rgba(255,246,204,.45);font-size:.84rem">Tidak ada hasil untuk "<span style="color:#FFD700">{_qv}</span>"</p>
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
              style="width:72px;height:72px;border-radius:8px;object-fit:cover;display:block" loading="lazy" />
            {#if _loadingId === item.videoId}
              <div style="position:absolute;inset:0;border-radius:8px;background:rgba(10,10,10,.7);display:flex;align-items:center;justify-content:center">
                <div class="mini-spin"></div>
              </div>
            {/if}
          </div>
          <div style="flex:1;min-width:0">
            <p style="font-size:.84rem;font-weight:700;line-height:1.35;
              display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
              color:{$_q8z?.videoId === item.videoId ? '#FFD700' : '#FFF6CC'};margin-bottom:4px">
              {_cleanTitle(item.title) || item.title}
            </p>
            {#if _extractArtist(item.title)}
              <p style="font-size:.72rem;font-weight:600;color:rgba(255,215,0,.7);margin:0 0 5px;
                white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                {_extractArtist(item.title)}
              </p>
            {/if}
            <div style="display:flex;flex-wrap:wrap;gap:5px 12px;align-items:center">
              <span style="display:flex;align-items:center;gap:3px;color:rgba(255,246,204,.4);font-size:.67rem">
                <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>
                {item.duration}
              </span>
              {#if item.views}
                <span style="color:rgba(255,246,204,.3);font-size:.67rem">{_fmt(item.views)}</span>
              {/if}
            </div>
          </div>
        </button>
      {/each}
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
