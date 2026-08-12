<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { _g9 } from '$lib/api.js';
  import { _q8z, _p1k, _x9a, _showMenu, _playlists } from '$lib/store.js';
  import { getPlaylists } from '$lib/playlist.js';

  const __cv = _q8z;
  let _ds = [], _ld = true, _er = null;
  let _loadingId = null;
  let _artists = [];
  let _artistsLoading = true;
  let _activeMood = 0;

  const _artistQuery = 'Denny Caknan Tulus Raisa Yura Yunita Mahalini Rizky Febian NIKI Rich Brian Weird Genius';

  const _moods = [
    { label: 'Viral', query: 'Lagu Indonesia Viral Tiktok 2026' },
    { label: 'Santai', query: 'Chill Vibes Lofi Songs' },
    { label: 'Fokus', query: 'Focus Deep Work Instrumental Music' },
    { label: 'Nyetir', query: 'Driving Roadtrip Music Indonesia' },
    { label: 'Gaming', query: 'Gaming EDM Hype Songs' },
    { label: 'Semangat', query: 'Energetic Workout Beats' },
    { label: 'Pesta', query: 'Party Dance Hits' },
    { label: 'Bahagia', query: 'Feel Good Happy Songs Indonesia' },
    { label: 'Romantis', query: 'Lagu Romantis Indonesia' },
    { label: 'Tidur', query: 'Sleeping Calming Relaxation Music' },
    { label: 'Galau', query: 'Lagu Sad Galau Indonesia' },
    { label: 'Nostalgia', query: 'Lagu Indonesia 2000an Nostalgia' },
  ];

  async function _loadMain(query) {
    _ld = true; _er = null;
    try {
      const r = await _g9(query);
      _ds = r.songs || [];
      _p1k.set(_ds);
    } catch (e) {
      _er = e.message;
    } finally {
      _ld = false;
    }
  }

  async function _pickMood(i) {
    if (_activeMood === i) return;
    _activeMood = i;
    await _loadMain(_moods[i].query);
  }

  onMount(async () => {
    _loadMain(_moods[_activeMood].query);
    try {
      const ra = await _g9(_artistQuery);
      _artists = (ra.artists || []).slice(0, 10);
    } catch {
      _artists = [];
    } finally {
      _artistsLoading = false;
    }
  });

  async function _pl(item, idx) {
    _loadingId = item.videoId;
    _p1k.set(_ds);
    _x9a.set(idx);
    _q8z.set(item);
    setTimeout(() => { _loadingId = null; }, 3000);
  }

  function _openMenu(e, item) {
    e.stopPropagation();
    _playlists.set(getPlaylists());
    _showMenu.set(item);
  }
</script>

<div style="max-width:560px;margin:0 auto;padding:28px 16px 0">

  <div style="margin-bottom:20px">
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

  {#if _artistsLoading}
    <div class="hscroll hide-scrollbar" style="margin-bottom:20px">
      {#each Array(6) as _}
        <div style="flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:8px;width:76px">
          <div class="skeleton" style="width:64px;height:64px;border-radius:50%"></div>
          <div class="skeleton" style="height:8px;width:50px;border-radius:4px"></div>
        </div>
      {/each}
    </div>
  {:else if _artists.length}
    <div style="margin-bottom:20px">
      <div class="section-title" style="margin-bottom:10px">
        <span class="bar"></span>
        <span style="font-size:.85rem;font-weight:700;color:#FFF6CC">Artis Pilihan</span>
      </div>
      <div class="hscroll hide-scrollbar">
        {#each _artists as a}
          <button on:click={() => goto(`/artist/${a.id}`)}
            style="flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:8px;width:76px;background:none;border:none;cursor:pointer;padding:0">
            <img src={a.cover} alt={a.title} style="width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,215,0,.2)" loading="lazy" />
            <span style="font-size:.66rem;font-weight:600;color:rgba(255,246,204,.75);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%">{a.title}</span>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <div class="hscroll hide-scrollbar" style="margin-bottom:20px">
    {#each _moods as mood, i}
      <button on:click={() => _pickMood(i)}
        class="chip-tab {_activeMood === i ? 'active' : ''}"
        style="flex-shrink:0;padding:8px 16px;border-radius:99px;font-size:.72rem;font-weight:700;cursor:pointer;
          background:{_activeMood === i ? '' : 'rgba(255,215,0,.06)'};
          border:1px solid {_activeMood === i ? 'transparent' : 'rgba(255,215,0,.15)'};
          color:{_activeMood === i ? '' : 'rgba(255,246,204,.6)'}">
        {mood.label}
      </button>
    {/each}
  </div>

  <div class="section-title" style="margin-bottom:10px">
    <span class="bar"></span>
    <span style="font-size:.85rem;font-weight:700;color:#FFF6CC">Untukmu</span>
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
    <div class="song-grid" style="padding-bottom:8px">
      {#each _ds as item, i}
        <div class="glass-card animate-card-up"
          style="border-radius:14px;padding:9px;display:flex;gap:10px;align-items:center;animation-delay:{Math.min(i,10)*30}ms;
            {$_q8z?.videoId === item.videoId ? 'border-color:rgba(255,215,0,.38);box-shadow:0 0 18px rgba(255,215,0,.13)' : ''}">

          <button on:click={() => _pl(item, i)}
            style="display:flex;gap:10px;align-items:center;flex:1;min-width:0;background:none;border:none;cursor:pointer;text-align:left;padding:0">
            <div style="position:relative;flex-shrink:0">
              <img src={item.thumbnail} alt={item.title}
                style="width:52px;height:52px;border-radius:8px;object-fit:cover;display:block" loading="lazy" />
              {#if _loadingId === item.videoId}
                <div style="position:absolute;inset:0;border-radius:8px;background:rgba(10,10,10,.7);display:flex;align-items:center;justify-content:center">
                  <div class="mini-spin"></div>
                </div>
              {:else if $__cv?.videoId === item.videoId}
                <div style="position:absolute;inset:0;border-radius:8px;background:rgba(10,10,10,.55);display:flex;align-items:center;justify-content:center">
                  {#if $_q8z?.videoId === item.videoId}
                    <div style="display:flex;align-items:flex-end;gap:2px;height:12px">
                      <div class="eq-bar-nm animate-eq-a" style="height:6px"></div>
                      <div class="eq-bar-nm animate-eq-b" style="height:10px"></div>
                      <div class="eq-bar-nm animate-eq-c" style="height:5px"></div>
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
            <div style="flex:1;min-width:0">
              <p style="font-size:.83rem;font-weight:700;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
                color:{$_q8z?.videoId === item.videoId ? '#FFD700' : '#FFF6CC'};margin-bottom:3px">
                {item.title}
              </p>
              {#if item.author}
                {#if item.artistId}
                  <span role="link" tabindex="0" on:click|stopPropagation={() => goto(`/artist/${item.artistId}`)} on:keydown={() => {}}
                    style="font-size:.7rem;font-weight:500;color:rgba(255,215,0,.5);margin:0;cursor:pointer;
                    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block">
                    {item.author}
                  </span>
                {:else}
                  <p style="font-size:.7rem;font-weight:500;color:rgba(255,255,255,.4);margin:0;
                    white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                    {item.author}
                  </p>
                {/if}
              {/if}
            </div>
          </button>

          <button on:click={e => _openMenu(e, item)}
            style="width:28px;height:28px;flex-shrink:0;border-radius:50%;display:flex;align-items:center;justify-content:center;
              background:transparent;border:none;cursor:pointer;color:rgba(255,246,204,.3);transition:all .15s"
            onmouseenter="this.style.background='rgba(255,215,0,.1)';this.style.color='rgba(255,215,0,.7)'"
            onmouseleave="this.style.background='transparent';this.style.color='rgba(255,246,204,.3)'">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
          </button>

        </div>
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

  .song-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
  }
  @media (min-width: 560px) {
    .song-grid { grid-template-columns: 1fr 1fr; }
  }
</style>
