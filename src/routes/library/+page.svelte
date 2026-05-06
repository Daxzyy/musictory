<script>
  import { onMount } from 'svelte';
  import { _q8z, _p1k, _x9a, _showMenu, _showAddPl, _playlists, _recentlyPlayed } from '$lib/store.js';
  import { getRecentlyPlayed, getPlaylists, createPlaylist, deletePlaylist, removeRecentlyPlayed } from '$lib/playlist.js';

  let _tab = 'recent';
  let _loadingId = null;
  let _showNewPl = false;
  let _newPlName = '';
  let _showDelConfirm = null;
  let _openedPlaylist = null;
  let _showRename = false;
  let _renameName = '';

  function focusScroll(node) {
    function onFocus() {
      setTimeout(() => {
        node.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 320);
    }
    node.addEventListener('focus', onFocus);
    return { destroy() { node.removeEventListener('focus', onFocus); } };
  }

  onMount(() => {
    _recentlyPlayed.set(getRecentlyPlayed());
    _playlists.set(getPlaylists());
  });

  function _pl(item, list, idx) {
    _loadingId = item.videoId;
    _p1k.set(list);
    _x9a.set(idx);
    _q8z.set(item);
    setTimeout(() => { _loadingId = null; }, 3000);
  }

  function _openMenu(e, item) {
    e.stopPropagation();
    _showMenu.set(item);
  }

  function _doCreatePl() {
    if (!_newPlName.trim()) return;
    createPlaylist(_newPlName.trim());
    _playlists.set(getPlaylists());
    _newPlName = '';
    _showNewPl = false;
  }

  function _doDeletePl(id) {
    deletePlaylist(id);
    _playlists.set(getPlaylists());
    _showDelConfirm = null;
    if (_openedPlaylist?.id === id) _openedPlaylist = null;
  }

  function _doRemoveRecent(videoId) {
    removeRecentlyPlayed(videoId);
    _recentlyPlayed.set(getRecentlyPlayed());
  }

  function _openPl(pl) {
    _openedPlaylist = { ...$_playlists.find(p => p.id === pl.id) };
  }

  function _doRename() {
    if (!_renameName.trim() || !_openedPlaylist) return;
    import('$lib/playlist.js').then(m => {
      m.renamePlaylist(_openedPlaylist.id, _renameName.trim());
      _playlists.set(getPlaylists());
      _openedPlaylist = { ...$_playlists.find(p => p.id === _openedPlaylist.id) };
      _showRename = false;
      _renameName = '';
    });
  }

  function _removeFromPl(videoId) {
    if (!_openedPlaylist) return;
    import('$lib/playlist.js').then(m => {
      m.removeTrackFromPlaylist(_openedPlaylist.id, videoId);
      _playlists.set(getPlaylists());
      _openedPlaylist = { ...$_playlists.find(p => p.id === _openedPlaylist.id) };
    });
  }

  $: _rp = $_recentlyPlayed;
  $: _pls = $_playlists;
</script>

<div style="max-width:560px;margin:0 auto;padding:28px 16px 0">

  <div style="margin-bottom:20px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px">
      <div style="width:5px;height:26px;border-radius:3px;background:linear-gradient(to bottom,#FFD700,#FFC300);flex-shrink:0"></div>
      <h1 style="font-size:1.35rem;font-weight:700;color:#FFD700;margin:0">Library</h1>
    </div>

    <div style="display:flex;gap:8px">
      <button on:click={() => _tab='recent'}
        style="flex:1;padding:9px 0;border-radius:99px;border:1.5px solid {_tab==='recent' ? '#FFD700' : 'rgba(255,215,0,.15)'};
          background:{_tab==='recent' ? 'rgba(255,215,0,.12)' : 'transparent'};
          color:{_tab==='recent' ? '#FFD700' : 'rgba(255,246,204,.4)'};
          font-family:'Quicksand',sans-serif;font-size:.78rem;font-weight:700;cursor:pointer;transition:all .18s">
        Terakhir Diputar
      </button>
      <button on:click={() => _tab='playlist'}
        style="flex:1;padding:9px 0;border-radius:99px;border:1.5px solid {_tab==='playlist' ? '#FFD700' : 'rgba(255,215,0,.15)'};
          background:{_tab==='playlist' ? 'rgba(255,215,0,.12)' : 'transparent'};
          color:{_tab==='playlist' ? '#FFD700' : 'rgba(255,246,204,.4)'};
          font-family:'Quicksand',sans-serif;font-size:.78rem;font-weight:700;cursor:pointer;transition:all .18s">
        Playlist
      </button>
    </div>
  </div>

  {#if _tab === 'recent'}
    {#if _rp.length === 0}
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 0;gap:14px">
        <div style="width:64px;height:64px;border-radius:50%;background:rgba(255,215,0,.07);display:flex;align-items:center;justify-content:center">
          <svg width="28" height="28" fill="rgba(255,215,0,.4)" viewBox="0 0 24 24"><path d="M13 3a9 9 0 1 0 .001 18.001A9 9 0 0 0 13 3zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm.5-11H12v6l5.25 3.15.75-1.23-4.5-2.67V8z"/></svg>
        </div>
        <p style="color:rgba(255,246,204,.38);font-size:.84rem;text-align:center">Belum ada riwayat<br><span style="font-size:.74rem;color:rgba(255,246,204,.25)">Putar lagu dulu yuk!</span></p>
      </div>
    {:else}
      <div style="display:flex;flex-direction:column;gap:10px;padding-bottom:8px">
        {#each _rp as item, i}
          <div class="glass-card" style="border-radius:16px;padding:12px;display:flex;gap:12px;align-items:center;
            {$_q8z?.videoId === item.videoId ? 'border-color:rgba(255,215,0,.38);box-shadow:0 0 18px rgba(255,215,0,.13)' : ''}">
            <button on:click={() => _pl(item, _rp, i)}
              style="display:flex;gap:12px;align-items:center;flex:1;min-width:0;background:none;border:none;cursor:pointer;text-align:left;padding:0">
              <div style="position:relative;flex-shrink:0">
                <img src={item.thumbnail} alt={item.title}
                  style="width:56px;height:56px;border-radius:8px;object-fit:cover;display:block" loading="lazy" />
                {#if _loadingId === item.videoId}
                  <div style="position:absolute;inset:0;border-radius:8px;background:rgba(10,10,10,.7);display:flex;align-items:center;justify-content:center">
                    <div class="mini-spin"></div>
                  </div>
                {:else if $_q8z?.videoId === item.videoId}
                  <div style="position:absolute;inset:0;border-radius:8px;background:rgba(10,10,10,.55);display:flex;align-items:center;justify-content:center">
                    <svg width="16" height="16" fill="#FFD700" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                  </div>
                {/if}
              </div>
              <div style="flex:1;min-width:0">
                <p style="font-size:.82rem;font-weight:700;line-height:1.35;
                  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
                  color:{$_q8z?.videoId === item.videoId ? '#FFD700' : '#FFF6CC'};margin-bottom:3px">{item.title}</p>
                {#if item.author}
                  <p style="font-size:.7rem;color:rgba(255,255,255,.4);margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{item.author}</p>
                {/if}
              </div>
            </button>
            <button on:click={e => _openMenu(e, { ...item, _ctx: 'recent' })}
              style="width:32px;height:32px;flex-shrink:0;border-radius:50%;display:flex;align-items:center;justify-content:center;
                background:transparent;border:none;cursor:pointer;color:rgba(255,246,204,.3);transition:all .15s"
              onmouseenter="this.style.background='rgba(255,215,0,.1)';this.style.color='rgba(255,215,0,.7)'"
              onmouseleave="this.style.background='transparent';this.style.color='rgba(255,246,204,.3)'">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
            </button>
          </div>
        {/each}
      </div>
    {/if}

  {:else}
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <span style="font-size:.75rem;color:rgba(255,246,204,.35);font-weight:600">{_pls.length} playlist</span>
      <button on:click={() => _showNewPl = true}
        style="display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:99px;
          background:rgba(255,215,0,.1);border:1.5px solid rgba(255,215,0,.25);cursor:pointer;
          color:#FFD700;font-family:'Quicksand',sans-serif;font-size:.75rem;font-weight:700;transition:all .15s"
        onmouseenter="this.style.background='rgba(255,215,0,.2)'"
        onmouseleave="this.style.background='rgba(255,215,0,.1)'">
        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        Buat Playlist
      </button>
    </div>

    {#if _pls.length === 0}
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 0;gap:14px">
        <div style="width:64px;height:64px;border-radius:50%;background:rgba(255,215,0,.07);display:flex;align-items:center;justify-content:center">
          <svg width="28" height="28" fill="rgba(255,215,0,.4)" viewBox="0 0 24 24"><path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/></svg>
        </div>
        <p style="color:rgba(255,246,204,.38);font-size:.84rem;text-align:center">Belum ada playlist<br><span style="font-size:.74rem;color:rgba(255,246,204,.25)">Buat playlist pertamamu!</span></p>
      </div>
    {:else}
      <div style="display:flex;flex-direction:column;gap:10px;padding-bottom:8px">
        {#each _pls as pl}
          <button on:click={() => _openPl(pl)}
            class="glass-card"
            style="border-radius:16px;padding:14px;display:flex;gap:12px;align-items:center;text-align:left;width:100%;cursor:pointer">
            <div style="width:56px;height:56px;border-radius:10px;flex-shrink:0;
              background:rgba(255,215,0,.08);border:1px solid rgba(255,215,0,.15);
              display:flex;align-items:center;justify-content:center;overflow:hidden">
              {#if pl.tracks.length > 0}
                <img src={pl.tracks[0].thumbnail} alt="" style="width:100%;height:100%;object-fit:cover" />
              {:else}
                <svg width="22" height="22" fill="rgba(255,215,0,.4)" viewBox="0 0 24 24"><path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/></svg>
              {/if}
            </div>
            <div style="flex:1;min-width:0">
              <p style="font-size:.84rem;font-weight:700;color:#FFF6CC;margin:0 0 4px;
                white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{pl.name}</p>
              <p style="font-size:.7rem;color:rgba(255,246,204,.35);margin:0">{pl.tracks.length} lagu</p>
            </div>
            <button on:click|stopPropagation={() => _showDelConfirm = pl.id}
              style="width:32px;height:32px;flex-shrink:0;border-radius:50%;display:flex;align-items:center;justify-content:center;
                background:transparent;border:none;cursor:pointer;color:rgba(255,100,100,.4);transition:all .15s"
              onmouseenter="this.style.background='rgba(255,80,80,.1)';this.style.color='rgba(255,100,100,.8)'"
              onmouseleave="this.style.background='transparent';this.style.color='rgba(255,100,100,.4)'">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
          </button>
        {/each}
      </div>
    {/if}
  {/if}

</div>

{#if _showNewPl}
  <div style="position:fixed;inset:0;z-index:100;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;padding:20px"
    on:click={() => _showNewPl = false}>
    <div style="width:100%;max-width:400px;background:#1c1c1c;border-radius:20px;padding:24px 20px;border:1px solid rgba(255,215,0,.15)"
      on:click|stopPropagation>
      <p style="font-size:.95rem;font-weight:700;color:#FFD700;margin:0 0 16px">Playlist Baru</p>
      <input
        bind:value={_newPlName}
        on:keydown={e => e.key === 'Enter' && _doCreatePl()}
        placeholder="Nama playlist..."
        style="width:100%;background:rgba(255,215,0,.05);border:1.5px solid rgba(255,215,0,.2);color:#FFF6CC;
          font-family:'Quicksand',sans-serif;font-size:1rem;font-weight:500;
          border-radius:12px;padding:12px 16px;outline:none;margin-bottom:14px;box-sizing:border-box"
        autofocus
        use:focusScroll
      />
      <div style="display:flex;gap:10px">
        <button on:click={() => _showNewPl = false}
          style="flex:1;padding:12px;border-radius:12px;background:rgba(255,215,0,.07);
            border:1px solid rgba(255,215,0,.15);cursor:pointer;font-family:'Quicksand',sans-serif;
            font-size:.85rem;font-weight:700;color:rgba(255,246,204,.6)">Batal</button>
        <button on:click={_doCreatePl}
          style="flex:1;padding:12px;border-radius:12px;background:linear-gradient(135deg,#FFD700,#FFC300);
            border:none;cursor:pointer;font-family:'Quicksand',sans-serif;font-size:.85rem;font-weight:700;color:#141414">
          Buat
        </button>
      </div>
    </div>
  </div>
{/if}

{#if _showDelConfirm}
  <div style="position:fixed;inset:0;z-index:100;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;padding:20px"
    on:click={() => _showDelConfirm = null}>
    <div style="width:100%;max-width:320px;background:#1c1c1c;border-radius:18px;padding:24px 20px;border:1px solid rgba(255,100,100,.2)"
      on:click|stopPropagation>
      <p style="font-size:.92rem;font-weight:700;color:#FFF6CC;margin:0 0 8px">Hapus Playlist?</p>
      <p style="font-size:.78rem;color:rgba(255,246,204,.45);margin:0 0 20px">Playlist ini akan dihapus permanen.</p>
      <div style="display:flex;gap:10px">
        <button on:click={() => _showDelConfirm = null}
          style="flex:1;padding:11px;border-radius:10px;background:rgba(255,215,0,.07);
            border:1px solid rgba(255,215,0,.15);cursor:pointer;font-family:'Quicksand',sans-serif;
            font-size:.8rem;font-weight:700;color:rgba(255,246,204,.6)">Batal</button>
        <button on:click={() => _doDeletePl(_showDelConfirm)}
          style="flex:1;padding:11px;border-radius:10px;background:rgba(255,60,60,.15);
            border:1px solid rgba(255,60,60,.3);cursor:pointer;font-family:'Quicksand',sans-serif;
            font-size:.8rem;font-weight:700;color:rgba(255,100,100,.9)">Hapus</button>
      </div>
    </div>
  </div>
{/if}

{#if _openedPlaylist}
  <div style="position:fixed;inset:0;z-index:95;background:#141414;overflow-y:auto;overscroll-behavior:contain">
    <div style="max-width:560px;margin:0 auto;padding:24px 16px 0">

      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
        <button on:click={() => _openedPlaylist = null}
          style="width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;
            background:rgba(255,215,0,.07);border:1px solid rgba(255,215,0,.12);cursor:pointer;color:rgba(255,246,204,.6);flex-shrink:0">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <div style="flex:1;min-width:0">
          <p style="font-size:1.1rem;font-weight:700;color:#FFD700;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{_openedPlaylist.name}</p>
          <p style="font-size:.7rem;color:rgba(255,246,204,.35);margin:0">{_openedPlaylist.tracks.length} lagu</p>
        </div>
        <button on:click={() => { _showRename = true; _renameName = _openedPlaylist.name; }}
          style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;
            background:rgba(255,215,0,.07);border:1px solid rgba(255,215,0,.12);cursor:pointer;color:rgba(255,246,204,.5);flex-shrink:0">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
        </button>
      </div>

      {#if _openedPlaylist.tracks.length === 0}
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 0;gap:14px">
          <p style="color:rgba(255,246,204,.38);font-size:.84rem;text-align:center">Playlist masih kosong<br><span style="font-size:.74rem;color:rgba(255,246,204,.25)">Tambah lagu lewat ⋮ di Home atau Cari</span></p>
        </div>
      {:else}
        <div style="display:flex;flex-direction:column;gap:10px;padding-bottom:8px">
          {#each _openedPlaylist.tracks as item, i}
            <div class="glass-card" style="border-radius:16px;padding:12px;display:flex;gap:12px;align-items:center;
              {$_q8z?.videoId === item.videoId ? 'border-color:rgba(255,215,0,.38);box-shadow:0 0 18px rgba(255,215,0,.13)' : ''}">
              <button on:click={() => _pl(item, _openedPlaylist.tracks, i)}
                style="display:flex;gap:12px;align-items:center;flex:1;min-width:0;background:none;border:none;cursor:pointer;text-align:left;padding:0">
                <div style="position:relative;flex-shrink:0">
                  <img src={item.thumbnail} alt={item.title}
                    style="width:56px;height:56px;border-radius:8px;object-fit:cover;display:block" loading="lazy" />
                  {#if $_q8z?.videoId === item.videoId}
                    <div style="position:absolute;inset:0;border-radius:8px;background:rgba(10,10,10,.55);display:flex;align-items:center;justify-content:center">
                      <svg width="16" height="16" fill="#FFD700" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                    </div>
                  {/if}
                </div>
                <div style="flex:1;min-width:0">
                  <p style="font-size:.82rem;font-weight:700;line-height:1.35;
                    display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
                    color:{$_q8z?.videoId === item.videoId ? '#FFD700' : '#FFF6CC'};margin-bottom:3px">{item.title}</p>
                  {#if item.author}
                    <p style="font-size:.7rem;color:rgba(255,255,255,.4);margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{item.author}</p>
                  {/if}
                </div>
              </button>
              <button on:click={() => _removeFromPl(item.videoId)}
                style="width:32px;height:32px;flex-shrink:0;border-radius:50%;display:flex;align-items:center;justify-content:center;
                  background:transparent;border:none;cursor:pointer;color:rgba(255,100,100,.4);transition:all .15s"
                onmouseenter="this.style.background='rgba(255,80,80,.1)';this.style.color='rgba(255,100,100,.8)'"
                onmouseleave="this.style.background='transparent';this.style.color='rgba(255,100,100,.4)'">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}

{#if _showRename && _openedPlaylist}
  <div style="position:fixed;inset:0;z-index:110;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;padding:20px"
    on:click={() => _showRename = false}>
    <div style="width:100%;max-width:400px;background:#1c1c1c;border-radius:20px;padding:24px 20px;border:1px solid rgba(255,215,0,.15)"
      on:click|stopPropagation>
      <p style="font-size:.95rem;font-weight:700;color:#FFD700;margin:0 0 16px">Ganti Nama Playlist</p>
      <input
        bind:value={_renameName}
        on:keydown={e => e.key === 'Enter' && _doRename()}
        style="width:100%;background:rgba(255,215,0,.05);border:1.5px solid rgba(255,215,0,.2);color:#FFF6CC;
          font-family:'Quicksand',sans-serif;font-size:1rem;font-weight:500;
          border-radius:12px;padding:12px 16px;outline:none;margin-bottom:14px;box-sizing:border-box"
        autofocus
        use:focusScroll
      />
      <div style="display:flex;gap:10px">
        <button on:click={() => _showRename = false}
          style="flex:1;padding:12px;border-radius:12px;background:rgba(255,215,0,.07);
            border:1px solid rgba(255,215,0,.15);cursor:pointer;font-family:'Quicksand',sans-serif;
            font-size:.85rem;font-weight:700;color:rgba(255,246,204,.6)">Batal</button>
        <button on:click={_doRename}
          style="flex:1;padding:12px;border-radius:12px;background:linear-gradient(135deg,#FFD700,#FFC300);
            border:none;cursor:pointer;font-family:'Quicksand',sans-serif;font-size:.85rem;font-weight:700;color:#141414">
          Simpan
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .mini-spin {
    width: 20px; height: 20px; border-radius: 50%;
    border: 2px solid rgba(255,215,0,.2); border-top-color: #FFD700;
    animation: _ms .7s linear infinite;
  }
  @keyframes _ms { to { transform: rotate(360deg); } }
</style>
