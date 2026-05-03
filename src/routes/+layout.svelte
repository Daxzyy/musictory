<script>
  import '../app.css';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { _q8z, _m3v, _p1k, _x9a } from '$lib/store.js';

  $: _rt = $page.url.pathname;

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
</script>

<div style="padding-bottom:{$_q8z ? '11rem' : '4.5rem'}">
  <slot />
</div>

{#if $_q8z}
<div class="player-bar" style="position:fixed;bottom:58px;left:0;right:0;z-index:40;padding:10px 16px 8px">
  <div style="max-width:560px;margin:0 auto">

    <!-- Track info row -->
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
      <img src={$_q8z.thumbnail} alt=""
        style="width:44px;height:44px;border-radius:10px;object-fit:cover;flex-shrink:0;border:1px solid rgba(255,215,0,.2)" />
      <div style="flex:1;min-width:0">
        <p style="font-size:.75rem;font-weight:700;color:#FFD700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{$_q8z.title}</p>
        <p style="font-size:.65rem;color:rgba(255,246,204,.4);margin-top:2px">{$_q8z.duration}</p>
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        <button on:click={_prv}
          style="width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;
            background:rgba(255,215,0,.07);border:1px solid rgba(255,215,0,.14);cursor:pointer;
            color:rgba(255,246,204,.6);transition:all .15s"
          onmouseenter="this.style.background='rgba(255,215,0,.15)';this.style.color='#FFD700'"
          onmouseleave="this.style.background='rgba(255,215,0,.07)';this.style.color='rgba(255,246,204,.6)'">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
        </button>
        <button on:click={_nxt}
          style="width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;
            background:rgba(255,215,0,.07);border:1px solid rgba(255,215,0,.14);cursor:pointer;
            color:rgba(255,246,204,.6);transition:all .15s"
          onmouseenter="this.style.background='rgba(255,215,0,.15)';this.style.color='#FFD700'"
          onmouseleave="this.style.background='rgba(255,215,0,.07)';this.style.color='rgba(255,246,204,.6)'">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6h2v12h-2zm-3.5 6L4 6v12z"/></svg>
        </button>
      </div>
    </div>

    <!-- Progress bar visual (dekoratif) -->
    <div style="height:3px;border-radius:99px;background:rgba(255,215,0,.1);overflow:hidden">
      <div style="height:100%;width:40%;border-radius:99px;background:linear-gradient(to right,#FFD700,#FFC300);
        animation:_prog 4s linear infinite"></div>
    </div>

    <!-- Hidden YouTube iframe — audio only, not visible -->
    <div style="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden">
      <iframe
        src="https://www.youtube.com/embed/{$_q8z.videoId}?autoplay=1&controls=0&rel=0&modestbranding=1"
        width="1" height="1" frameborder="0"
        allow="autoplay; encrypted-media" title="audio"
      ></iframe>
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
        style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 0 8px;background:none;border:none;cursor:pointer;transition:color .2s;color:{_rt===p ? '#FFD700' : 'rgba(255,246,204,.38)'}">
        <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d={ic}/></svg>
        <span style="font-size:10px;font-weight:600;letter-spacing:.04em">{l}</span>
        {#if _rt === p}
          <div style="width:4px;height:4px;border-radius:50%;background:#FFD700;margin-top:1px"></div>
        {/if}
      </button>
    {/each}
  </div>
</nav>

{#if $_m3v}
<div class="overlay-enter" style="position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;background:rgba(8,8,5,.9);backdrop-filter:blur(20px)">
  <div class="glass glow" style="border-radius:24px;padding:36px 32px;display:flex;flex-direction:column;align-items:center;gap:18px;max-width:270px;margin:0 16px;text-align:center">
    <div style="position:relative;width:52px;height:52px">
      <div style="position:absolute;inset:0;border-radius:50%;border:2.5px solid rgba(255,215,0,.15);border-top-color:#FFD700;animation:_sp .85s linear infinite"></div>
      <div style="position:absolute;inset:6px;border-radius:50%;background:linear-gradient(135deg,#FFD700,#FFC300);opacity:.75;animation:_pl 1.4s ease infinite"></div>
    </div>
    <p style="color:#FFF6CC;font-size:.85rem;line-height:1.65;font-weight:400">sabar yaa, server kami butuh waktu untuk merespon🥰</p>
  </div>
</div>
{/if}

<style>
  @keyframes _sp { to { transform: rotate(360deg); } }
  @keyframes _pl { 0%,100% { opacity:.55 } 50% { opacity:.9 } }
  @keyframes _prog { 0% { width:0% } 100% { width:100% } }
</style>
