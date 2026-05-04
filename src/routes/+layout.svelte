<script>
  import '../app.css';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { _q8z, _m3v, _p1k, _x9a, _playing, _showNP } from '$lib/store.js';
  import { _getStreamUrl } from '$lib/api.js';
  import { onDestroy } from 'svelte';

  $: _rt = $page.url.pathname;

  $: if (typeof document !== 'undefined') {
    document.body.style.overflow = ($_showNP || $_m3v) ? 'hidden' : '';
  }

  function _dur2s(d) {
    if (!d) return 0;
    const p = d.split(':').map(Number);
    if (p.length === 3) return p[0]*3600 + p[1]*60 + p[2];
    if (p.length === 2) return p[0]*60 + p[1];
    return 0;
  }
  function _s2dur(s) {
    const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = Math.floor(s%60);
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    return `${m}:${String(sec).padStart(2,'0')}`;
  }

  let _elapsed = 0;
  let _total = 0;
  let _pct = 0;
  let _ticker = null;
  let _prev = null;
  let _audioEl = null;
  let _loading = false;
  let _seeking = false;

  function _setMediaSession(track) {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: 'Musictory',
      artwork: [
        { src: track.thumbnail, sizes: '256x256', type: 'image/jpeg' },
        { src: track.thumbnail, sizes: '512x512', type: 'image/jpeg' },
      ]
    });
    navigator.mediaSession.setActionHandler('play', () => {
      _playing.set(true);
      _audioEl?.play();
      navigator.mediaSession.playbackState = 'playing';
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      _playing.set(false);
      _audioEl?.pause();
      navigator.mediaSession.playbackState = 'paused';
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => _prv());
    navigator.mediaSession.setActionHandler('nexttrack', () => _nxt());
    navigator.mediaSession.setActionHandler('seekbackward', () => {
      if (_audioEl) _audioEl.currentTime = Math.max(0, _audioEl.currentTime - 10);
    });
    navigator.mediaSession.setActionHandler('seekforward', () => {
      if (_audioEl) _audioEl.currentTime = Math.min(_total, _audioEl.currentTime + 10);
    });
    navigator.mediaSession.playbackState = 'playing';
  }

  function _updatePositionState() {
    if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;
    try {
      navigator.mediaSession.setPositionState({
        duration: _total || 0,
        playbackRate: 1,
        position: _elapsed
      });
    } catch(_) {}
  }

  $: if ($_q8z && $_q8z !== _prev) {
    _prev = $_q8z;
    _elapsed = 0;
    _total = _dur2s($_q8z.duration);
    _pct = 0;
    _playing.set(true);
    _loadAndPlay($_q8z);
  }

  async function _loadAndPlay(track) {
    if (!_audioEl) return;
    _loading = true;
    _m3v.set(true);
    _audioEl.pause();
    _audioEl.src = '';
    const url = await _getStreamUrl(track.videoId);
    _loading = false;
    _m3v.set(false);
    if (!url) return;
    _audioEl.src = url;
    await _audioEl.play().catch(() => {});
    _setMediaSession(track);
    _startTick();
  }

  $: if (_prev && !_loading) {
    if ($_playing) {
      if (_audioEl?.paused) _audioEl.play().catch(() => {});
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
    } else {
      if (_audioEl && !_audioEl.paused) _audioEl.pause();
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
    }
  }

  function _startTick() {
    if (_ticker) clearInterval(_ticker);
    _ticker = setInterval(() => {
      if (!$_playing || !_audioEl || _seeking) return;
      _elapsed = Math.floor(_audioEl.currentTime);
      _total = _audioEl.duration && !isNaN(_audioEl.duration) ? Math.floor(_audioEl.duration) : _total;
      _pct = _total > 0 ? (_elapsed / _total) * 100 : 0;
      _updatePositionState();
    }, 1000);
  }

  onDestroy(() => {
    if (_ticker) clearInterval(_ticker);
    if (_audioEl) { _audioEl.pause(); _audioEl.src = ''; }
    if (typeof document !== 'undefined') document.body.style.overflow = '';
  });

  function _nxt() {
    const a = $_p1k, b = $_x9a;
    if (!a.length) return;
    const n = (b + 1) % a.length;
    _x9a.set(n); _q8z.set(a[n]);
  }
  function _prv() {
    const a = $_p1k, b = $_x9a;
    if (!a.length) return;
    const n = (b - 1 + a.length) % a.length;
    _x9a.set(n); _q8z.set(a[n]);
  }
  function _togglePlay() {
    _playing.update(v => !v);
  }

  function _onSeekStart() {
    _seeking = true;
  }
  function _onSeekInput(e) {
    const val = Number(e.target.value);
    _elapsed = Math.round((val / 100) * _total);
    _pct = val;
  }
  function _onSeekEnd(e) {
    const val = Number(e.target.value);
    const target = Math.round((val / 100) * _total);
    if (_audioEl) _audioEl.currentTime = target;
    _elapsed = target;
    _pct = val;
    _seeking = false;
  }
</script>

<audio
  bind:this={_audioEl}
  style="display:none"
  on:ended={_nxt}
  on:play={() => { if (!_loading) _playing.set(true); }}
  on:pause={() => { if (!_loading) _playing.set(false); }}
></audio>

<div style="padding-bottom:{$_q8z ? '11rem' : '4.5rem'}">
  <slot />
</div>

{#if $_q8z}
<div class="player-bar" style="position:fixed;bottom:58px;left:0;right:0;z-index:40;padding:12px 16px 10px">
  <div style="max-width:560px;margin:0 auto">

    <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">

      <button on:click={() => _showNP.set(true)}
        style="display:flex;align-items:center;gap:12px;flex:1;min-width:0;background:none;border:none;cursor:pointer;text-align:left;padding:0">

        <div style="position:relative;flex-shrink:0;width:46px;height:46px">
          <img src={$_q8z.thumbnail} alt=""
            style="width:46px;height:46px;border-radius:50%;object-fit:cover;display:block;
              border:2px solid rgba(255,215,0,.3)" />
          <div style="position:absolute;inset:-4px;border-radius:50%;
            border:2px solid transparent;
            border-top-color:#FFD700;border-right-color:rgba(255,215,0,.25);
            animation:_ring 1.8s linear infinite;
            animation-play-state:{$_playing ? 'running' : 'paused'}"></div>
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
            width:8px;height:8px;border-radius:50%;background:#0e0d07;
            border:1.5px solid rgba(255,215,0,.4)"></div>
        </div>

        <div style="flex:1;min-width:0">
          <p style="font-size:.76rem;font-weight:700;color:#FFD700;
            white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:4px">{$_q8z.title}</p>
          <div style="display:flex;align-items:center;gap:6px">
            <div style="display:flex;align-items:flex-end;gap:2px;height:10px">
              {#each [1,2,3,4] as bar}
                <div class="eqbar eqbar{bar}" style="width:3px;border-radius:2px;background:#FFD700;
                  animation-play-state:{$_playing ? 'running' : 'paused'}"></div>
              {/each}
            </div>
            <span style="font-size:.62rem;color:rgba(255,246,204,.35)">
              {_s2dur(_elapsed)} / {$_q8z.duration}
            </span>
          </div>
        </div>
      </button>

      <div style="display:flex;gap:5px;align-items:center;flex-shrink:0">
        <button on:click={_prv}
          style="width:33px;height:33px;border-radius:50%;display:flex;align-items:center;justify-content:center;
            background:rgba(255,215,0,.07);border:1px solid rgba(255,215,0,.12);cursor:pointer;
            color:rgba(255,246,204,.55);transition:all .15s"
          onmouseenter="this.style.background='rgba(255,215,0,.18)';this.style.color='#FFD700'"
          onmouseleave="this.style.background='rgba(255,215,0,.07)';this.style.color='rgba(255,246,204,.55)'">
          <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
        </button>

        <button on:click={_togglePlay}
          style="width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;
            background:linear-gradient(135deg,#FFD700,#FFC300);border:none;cursor:pointer;
            color:#0A0A0A;transition:all .15s;box-shadow:0 0 14px rgba(255,215,0,.3)"
          onmouseenter="this.style.transform='scale(1.08)'"
          onmouseleave="this.style.transform='scale(1)'">
          {#if $_playing}
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          {:else}
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          {/if}
        </button>

        <button on:click={_nxt}
          style="width:33px;height:33px;border-radius:50%;display:flex;align-items:center;justify-content:center;
            background:rgba(255,215,0,.07);border:1px solid rgba(255,215,0,.12);cursor:pointer;
            color:rgba(255,246,204,.55);transition:all .15s"
          onmouseenter="this.style.background='rgba(255,215,0,.18)';this.style.color='#FFD700'"
          onmouseleave="this.style.background='rgba(255,215,0,.07)';this.style.color='rgba(255,246,204,.55)'">
          <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6h2v12h-2zm-3.5 6L4 6v12z"/></svg>
        </button>
      </div>
    </div>

    <div style="position:relative;height:3px;border-radius:99px;background:rgba(255,215,0,.1);cursor:pointer">
      <div style="height:100%;width:{_pct}%;border-radius:99px;
        background:linear-gradient(to right,#FFD700,#FFC300);
        transition:width {_seeking ? '0s' : '1s'} linear;min-width:{_pct>0 ? '6px':'0'}"></div>
      <input
        type="range" min="0" max="100" step="0.1"
        value={_pct}
        on:mousedown={_onSeekStart}
        on:touchstart={_onSeekStart}
        on:input={_onSeekInput}
        on:change={_onSeekEnd}
        on:mouseup={_onSeekEnd}
        on:touchend={_onSeekEnd}
        style="position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;margin:0;padding:0;
          -webkit-appearance:none;appearance:none;background:transparent;touch-action:none" />
    </div>

  </div>
</div>
{/if}

{#if $_showNP && $_q8z}
<div class="overlay-enter" style="position:fixed;inset:0;z-index:90;display:flex;flex-direction:column;
  background:linear-gradient(180deg,#0e0c05 0%,#0A0A0A 100%);overflow:hidden;overscroll-behavior:none;touch-action:none">

  <div style="display:flex;align-items:center;justify-content:space-between;padding:20px 20px 0">
    <button on:click={() => _showNP.set(false)}
      style="width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;
        background:rgba(255,215,0,.07);border:1px solid rgba(255,215,0,.12);cursor:pointer;color:rgba(255,246,204,.6)">
      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
    </button>
    <p style="font-size:.75rem;font-weight:700;color:rgba(255,215,0,.5);letter-spacing:.1em">NOW PLAYING</p>
    <div style="width:38px"></div>
  </div>

  <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 32px;gap:32px;overflow:hidden">

    <div style="position:relative;width:240px;height:240px">
      <img src={$_q8z.thumbnail} alt=""
        style="width:240px;height:240px;border-radius:50%;object-fit:cover;display:block;
          border:3px solid rgba(255,215,0,.2);
          animation:_spin 8s linear infinite;
          animation-play-state:{$_playing ? 'running' : 'paused'}" />
      <div style="position:absolute;inset:-8px;border-radius:50%;
        border:2px solid transparent;
        border-top-color:#FFD700;border-right-color:rgba(255,215,0,.2);
        animation:_ring 2.5s linear infinite;
        animation-play-state:{$_playing ? 'running' : 'paused'}"></div>
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
        width:16px;height:16px;border-radius:50%;background:#0A0A0A;
        border:2px solid rgba(255,215,0,.4)"></div>
    </div>

    <div style="text-align:center;width:100%">
      <p style="font-size:1rem;font-weight:700;color:#FFF6CC;line-height:1.4;
        display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
        margin-bottom:6px">{$_q8z.title}</p>
      <p style="font-size:.72rem;color:rgba(255,215,0,.4)">{$_q8z.duration}</p>
    </div>

    <div style="width:100%">
      <div style="position:relative;height:4px;border-radius:99px;background:rgba(255,215,0,.1);margin-bottom:8px;cursor:pointer">
        <div style="height:100%;width:{_pct}%;border-radius:99px;
          background:linear-gradient(to right,#FFD700,#FFC300);
          transition:width {_seeking ? '0s' : '1s'} linear;min-width:{_pct>0 ? '8px':'0'}"></div>
        <input
          type="range" min="0" max="100" step="0.1"
          value={_pct}
          on:mousedown={_onSeekStart}
          on:touchstart={_onSeekStart}
          on:input={_onSeekInput}
          on:change={_onSeekEnd}
          on:mouseup={_onSeekEnd}
          on:touchend={_onSeekEnd}
          style="position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;margin:0;padding:0;
            -webkit-appearance:none;appearance:none;background:transparent;touch-action:none" />
      </div>
      <div style="display:flex;justify-content:space-between">
        <span style="font-size:.65rem;color:rgba(255,246,204,.35)">{_s2dur(_elapsed)}</span>
        <span style="font-size:.65rem;color:rgba(255,246,204,.35)">{$_q8z.duration}</span>
      </div>
    </div>

    <div style="display:flex;align-items:center;justify-content:center;gap:20px">
      <button on:click={_prv}
        style="width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;
          background:rgba(255,215,0,.07);border:1px solid rgba(255,215,0,.12);cursor:pointer;
          color:rgba(255,246,204,.6);transition:all .15s"
        onmouseenter="this.style.background='rgba(255,215,0,.18)';this.style.color='#FFD700'"
        onmouseleave="this.style.background='rgba(255,215,0,.07)';this.style.color='rgba(255,246,204,.6)'">
        <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
      </button>

      <button on:click={_togglePlay}
        style="width:68px;height:68px;border-radius:50%;display:flex;align-items:center;justify-content:center;
          background:linear-gradient(135deg,#FFD700,#FFC300);border:none;cursor:pointer;
          color:#0A0A0A;transition:all .18s;box-shadow:0 0 28px rgba(255,215,0,.35)"
        onmouseenter="this.style.transform='scale(1.07)'"
        onmouseleave="this.style.transform='scale(1)'">
        {#if $_playing}
          <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        {:else}
          <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        {/if}
      </button>

      <button on:click={_nxt}
        style="width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;
          background:rgba(255,215,0,.07);border:1px solid rgba(255,215,0,.12);cursor:pointer;
          color:rgba(255,246,204,.6);transition:all .15s"
        onmouseenter="this.style.background='rgba(255,215,0,.18)';this.style.color='#FFD700'"
        onmouseleave="this.style.background='rgba(255,215,0,.07)';this.style.color='rgba(255,246,204,.6)'">
        <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6h2v12h-2zm-3.5 6L4 6v12z"/></svg>
      </button>
    </div>

  </div>

</div>
{/if}

<nav class="nav-bar" style="position:fixed;bottom:0;left:0;right:0;z-index:50">
  <div style="max-width:560px;margin:0 auto;display:flex">
    {#each [
      ['/', 'Beranda', 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z'],
      ['/search', 'Cari', 'M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'],
      ['/library', 'Library', 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z']
    ] as [p, l, ic]}
      <button on:click={() => goto(p)}
        style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 0 8px;
          background:none;border:none;cursor:pointer;transition:color .2s;
          color:{_rt===p ? '#FFD700' : 'rgba(255,246,204,.38)'}">
        <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d={ic}/></svg>
        <span style="font-size:10px;font-weight:600;letter-spacing:.04em">{l}</span>
      </button>
    {/each}
  </div>
</nav>

{#if $_m3v}
<div style="position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;
  background:rgba(8,8,5,.92);backdrop-filter:blur(20px);
  overscroll-behavior:none;touch-action:none;overflow:hidden">
  <div class="glass glow" style="border-radius:24px;padding:36px 32px;display:flex;flex-direction:column;align-items:center;gap:22px;max-width:280px;margin:0 16px;text-align:center">

    <div style="position:relative;width:88px;height:88px">
      <div style="position:absolute;inset:0;border-radius:50%;
        border:2px solid rgba(255,215,0,.12);border-top-color:rgba(255,215,0,.5);
        animation:_sp 2s linear infinite"></div>
      <div style="position:absolute;inset:6px;border-radius:50%;
        background:#111008;
        border:1.5px solid rgba(255,215,0,.15)"></div>
      <div style="position:absolute;inset:18px;border-radius:50%;
        background:linear-gradient(135deg,rgba(255,215,0,.18),rgba(255,195,0,.08));
        border:1px solid rgba(255,215,0,.2);
        animation:_pl 1.8s ease-in-out infinite"></div>
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
        width:10px;height:10px;border-radius:50%;background:#0e0d07;
        border:1.5px solid rgba(255,215,0,.35)"></div>
      <div style="position:absolute;inset:-10px;border-radius:50%;
        border:1.5px solid transparent;border-top-color:#FFD700;border-right-color:rgba(255,215,0,.15);
        animation:_sp 1.4s linear infinite reverse"></div>
    </div>

    <div style="display:flex;align-items:flex-end;gap:4px;height:28px">
      {#each [1,2,3,4,5] as bar}
        <div class="eqbar-lg eqbar-lg{bar}" style="width:5px;border-radius:3px;background:#FFD700;opacity:.85"></div>
      {/each}
    </div>

    <p style="color:#FFF6CC;font-size:.85rem;line-height:1.65;font-weight:400">sabar yaa, server kami butuh waktu untuk merespon🥰</p>
  </div>
</div>
{/if}

<style>
  @keyframes _sp   { to { transform: rotate(360deg); } }
  @keyframes _pl   { 0%,100%{opacity:.4;transform:scale(.95)} 50%{opacity:.9;transform:scale(1.05)} }
  @keyframes _ring { to { transform: rotate(360deg); } }
  @keyframes _spin { to { transform: rotate(360deg); } }

  .eqbar { height: 3px; transition: height .1s; }
  .eqbar1 { animation: _eq1 .5s ease-in-out infinite alternate; }
  .eqbar2 { animation: _eq2 .7s ease-in-out infinite alternate; }
  .eqbar3 { animation: _eq3 .6s ease-in-out infinite alternate; }
  .eqbar4 { animation: _eq4 .4s ease-in-out infinite alternate; }

  @keyframes _eq1 { from{height:2px} to{height:10px} }
  @keyframes _eq2 { from{height:5px} to{height:10px} }
  @keyframes _eq3 { from{height:3px} to{height:8px}  }
  @keyframes _eq4 { from{height:7px} to{height:4px}  }

  .eqbar-lg { height: 4px; }
  .eqbar-lg1 { animation: _eql1 .45s ease-in-out infinite alternate; }
  .eqbar-lg2 { animation: _eql2 .65s ease-in-out infinite alternate; }
  .eqbar-lg3 { animation: _eql3 .55s ease-in-out infinite alternate; }
  .eqbar-lg4 { animation: _eql4 .38s ease-in-out infinite alternate; }
  .eqbar-lg5 { animation: _eql5 .72s ease-in-out infinite alternate; }

  @keyframes _eql1 { from{height:4px} to{height:22px} }
  @keyframes _eql2 { from{height:8px} to{height:26px} }
  @keyframes _eql3 { from{height:14px} to{height:28px} }
  @keyframes _eql4 { from{height:6px} to{height:20px} }
  @keyframes _eql5 { from{height:10px} to{height:24px} }
</style>
