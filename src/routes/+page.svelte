<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { _g9 } from '$lib/api.js';
  import { _q8z, _p1k, _x9a, _showMenu, _playlists } from '$lib/store.js';
  import { getPlaylists } from '$lib/playlist.js';

  const __cv = _q8z;
  let _ds = [], _ld = true, _er = null;
  let _moodAlbums = [];
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

  // Derived, index-preserving slices so playback queue order always matches _ds.
  $: _hero = _ds.length ? { item: _ds[0], idx: 0 } : null;
  $: _quick = _ds.slice(1, 5).map((item, i) => ({ item, idx: i + 1 }));
  $: _rest = _ds.slice(5).map((item, i) => ({ item, idx: i + 5 }));

  async function _loadMain(query) {
    _ld = true; _er = null;
    try {
      const r = await _g9(query, '_home_mood');
      _ds = r.songs || [];
      _moodAlbums = (r.albums || []).slice(0, 10);
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
      const ra = await _g9(_artistQuery, '_home_artists');
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

  <div style="margin-bottom:22px">
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:10px">

      <div style="position:relative;width:64px;height:64px;flex-shrink:0">
        <svg width="64" height="64" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="512" height="512" rx="112" fill="#0D0D0D"/>
          <path
            d="M348 180
               C322 151 282 136 238 136
               C169 136 116 188 116 256
               C116 324 169 376 238 376
               C282 376 322 361 348 331
               V256
               H250"
            stroke="#FFFFFF"
            stroke-width="38"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle cx="220" cy="256" r="46" fill="#F5F5F5"/>
          <circle cx="220" cy="256" r="38" stroke="#C8C8C8" stroke-width="2"/>
          <circle cx="220" cy="256" r="31" stroke="#D5D5D5" stroke-width="2"/>
          <g stroke="#0D0D0D" stroke-width="5" stroke-linecap="round">
            <path d="M192 250V262"/>
            <path d="M200 243V269"/>
            <path d="M208 237V275"/>
            <path d="M216 246V266"/>
            <path d="M224 231V281"/>
            <path d="M232 239V273"/>
            <path d="M240 246V266"/>
            <path d="M248 241V271"/>
          </g>
          <circle cx="220" cy="256" r="4" fill="#F5F5F5"/>
        </svg>
      </div>

      <div style="flex:1;min-width:0;display:flex;align-items:center">
        <span style="font-size:1.75rem;font-weight:700;color:#FFFFFF;letter-spacing:-.02em;font-family:'Quicksand',sans-serif">Ganify</span>
      </div>

      <button
        on:click={() => goto('/search')}
        style="width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;
          background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);
          cursor:pointer;color:rgba(255,255,255,0.7);flex-shrink:0;transition:all .15s"
        onmouseenter="this.style.background='rgba(255,255,255,0.18)';this.style.color='#FFFFFF';this.style.borderColor='rgba(255,255,255,0.4)'"
        onmouseleave="this.style.background='rgba(255,255,255,0.07)';this.style.color='rgba(255,255,255,0.7)';this.style.borderColor='rgba(255,255,255,0.15)'"
        aria-label="Cari lagu"
      >
        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
      </button>

    </div>
  </div>

  <!-- ARTIS TOP: identity circles, horizontal scroll (fits naturally, kept as-is) -->
  {#if _artistsLoading}
    <div class="hscroll hide-scrollbar" style="margin-bottom:22px">
      {#each Array(6) as _}
        <div style="flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:8px;width:76px">
          <div class="skeleton" style="width:64px;height:64px;border-radius:50%"></div>
          <div class="skeleton" style="height:8px;width:50px;border-radius:4px"></div>
        </div>
      {/each}
    </div>
  {:else if _artists.length}
    <div style="margin-bottom:22px">
      <div class="section-title" style="margin-bottom:10px">
        <span class="bar"></span>
        <span style="font-size:.85rem;font-weight:700;color:#F5F5F5">Artis Top</span>
      </div>
      <div class="hscroll hide-scrollbar">
        {#each _artists as a}
          <button on:click={() => goto(`/artist/${a.id}`)}
            style="flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:8px;width:76px;background:none;border:none;cursor:pointer;padding:0">
            <img src={a.cover} alt={a.title} style="width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,.2)" loading="lazy" />
            <span style="font-size:.66rem;font-weight:600;color:rgba(245,245,245,.75);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;display:block">{a.title}</span>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- MOOD PICKER: pill tabs, horizontal scroll -->
  <div class="hscroll hide-scrollbar" style="margin-bottom:24px">
    {#each _moods as mood, i}
      <button on:click={() => _pickMood(i)}
        class="chip-tab {_activeMood === i ? 'active' : ''}"
        style="flex-shrink:0;padding:8px 16px;border-radius:99px;font-size:.72rem;font-weight:700;cursor:pointer;
          background:{_activeMood === i ? '' : 'rgba(255,255,255,.06)'};
          border:1px solid {_activeMood === i ? 'transparent' : 'rgba(255,255,255,.15)'};
          color:{_activeMood === i ? '' : 'rgba(245,245,245,.6)'}">
        {mood.label}
      </button>
    {/each}
  </div>

  {#if _ld}
    <!-- Loading skeleton mirrors the real hierarchy: hero -> grid -> list -->
    <div class="skeleton" style="width:100%;aspect-ratio:16/10;border-radius:20px;margin-bottom:22px"></div>
    <div class="quick-grid" style="margin-bottom:22px">
      {#each Array(4) as _}
        <div class="skeleton" style="width:100%;aspect-ratio:1;border-radius:14px"></div>
      {/each}
    </div>
    <div style="display:flex;flex-direction:column;gap:10px">
      {#each Array(4) as _}
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
    <div class="glass-card" style="border-radius:16px;padding:24px;text-align:center;color:rgba(245,245,245,.55)">
      <p style="font-size:.875rem">Gagal memuat data 😔</p>
      <p style="font-size:.75rem;margin-top:4px;opacity:.6">{_er}</p>
    </div>

  {:else}

    <!-- FEATURED: one large hero card for the top pick of the active mood -->
    {#if _hero}
      {@const item = _hero.item}{@const idx = _hero.idx}
      <div style="margin-bottom:24px">
        <div class="section-title" style="margin-bottom:10px">
          <span class="bar"></span>
          <span style="font-size:.85rem;font-weight:700;color:#F5F5F5">Sorotan {_moods[_activeMood].label}</span>
        </div>
        <div class="glass-card hero-card animate-card-up"
          style="border-radius:20px;overflow:hidden;position:relative;cursor:pointer;
            {$_q8z?.videoId === item.videoId ? 'border-color:rgba(255,255,255,.4);box-shadow:0 0 24px rgba(255,255,255,.15)' : ''}"
          role="button" tabindex="0"
          on:click={() => _pl(item, idx)} on:keydown={e => e.key === 'Enter' && _pl(item, idx)}>
          <img src={item.thumbnail} alt={item.title} class="hero-img" loading="lazy" />
          <div class="hero-scrim"></div>

          {#if _loadingId === item.videoId}
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(10,10,10,.35)">
              <div class="mini-spin"></div>
            </div>
          {:else if $__cv?.videoId === item.videoId && $_q8z?.videoId === item.videoId}
            <div style="position:absolute;top:14px;right:14px;background:rgba(10,10,10,.55);border-radius:99px;padding:6px 10px;display:flex;align-items:flex-end;gap:2px;height:14px">
              <div class="eq-bar-nm animate-eq-a" style="height:6px"></div>
              <div class="eq-bar-nm animate-eq-b" style="height:10px"></div>
              <div class="eq-bar-nm animate-eq-c" style="height:5px"></div>
            </div>
          {/if}

          <button on:click={e => _openMenu(e, item)}
            style="position:absolute;top:12px;left:12px;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;
              background:rgba(10,10,10,.45);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.2);cursor:pointer;color:rgba(245,245,245,.85)">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
          </button>

          <div class="hero-body">
            <p style="font-size:.62rem;font-weight:700;color:#FFFFFF;letter-spacing:.1em;text-transform:uppercase;margin:0 0 6px">Pilihan Teratas</p>
            <p style="font-size:1.08rem;font-weight:700;line-height:1.3;margin:0 0 4px;
              display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
              color:{$_q8z?.videoId === item.videoId ? '#FFFFFF' : '#F5F5F5'}">{item.title}</p>
            {#if item.author}
              <p style="font-size:.76rem;font-weight:600;color:rgba(245,245,245,.65);margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{item.author}</p>
            {/if}
          </div>

          <div class="hero-play">
            <svg width="20" height="20" fill="#141414" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      </div>
    {/if}

    <!-- REKOMENDASI CEPAT: compact 2-column grid of square cards, distinct from the list below -->
    {#if _quick.length}
      <div style="margin-bottom:24px">
        <div class="section-title" style="margin-bottom:10px">
          <span class="bar"></span>
          <span style="font-size:.85rem;font-weight:700;color:#F5F5F5">Rekomendasi Cepat</span>
        </div>
        <div class="quick-grid">
          {#each _quick as { item, idx }, i}
            <div class="glass-card animate-card-up quick-card"
              style="border-radius:14px;overflow:hidden;position:relative;cursor:pointer;animation-delay:{i*40}ms;
                {$_q8z?.videoId === item.videoId ? 'border-color:rgba(255,255,255,.4);box-shadow:0 0 16px rgba(255,255,255,.13)' : ''}"
              role="button" tabindex="0"
              on:click={() => _pl(item, idx)} on:keydown={e => e.key === 'Enter' && _pl(item, idx)}>
              <img src={item.thumbnail} alt={item.title} class="quick-img" loading="lazy" />
              <div class="quick-scrim"></div>

              {#if _loadingId === item.videoId}
                <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(10,10,10,.4)">
                  <div class="mini-spin"></div>
                </div>
              {:else if $_q8z?.videoId === item.videoId}
                <div style="position:absolute;top:8px;right:8px;display:flex;align-items:flex-end;gap:2px;height:12px">
                  <div class="eq-bar-nm animate-eq-a" style="height:6px"></div>
                  <div class="eq-bar-nm animate-eq-b" style="height:10px"></div>
                  <div class="eq-bar-nm animate-eq-c" style="height:5px"></div>
                </div>
              {:else}
                <button on:click={e => _openMenu(e, item)}
                  style="position:absolute;top:6px;right:6px;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;
                    background:rgba(10,10,10,.5);border:none;cursor:pointer;color:rgba(245,245,245,.85)">
                  <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                </button>
              {/if}

              <div class="quick-body">
                <p style="font-size:.72rem;font-weight:700;line-height:1.25;margin:0 0 2px;
                  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
                  color:{$_q8z?.videoId === item.videoId ? '#FFFFFF' : '#F5F5F5'}">{item.title}</p>
                {#if item.author}
                  <p style="font-size:.62rem;font-weight:600;color:rgba(245,245,245,.55);margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{item.author}</p>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- ALBUM & SINGLE POPULER: horizontal carousel, reuses data already returned by the mood query -->
    {#if _moodAlbums.length}
      <div style="margin-bottom:24px">
        <div class="section-title" style="margin-bottom:10px">
          <span class="bar"></span>
          <span style="font-size:.85rem;font-weight:700;color:#F5F5F5">Album &amp; Single Populer</span>
        </div>
        <div class="hscroll hide-scrollbar">
          {#each _moodAlbums as al}
            <button on:click={() => goto(`/album/${al.id}`)}
              style="background:none;border:none;cursor:pointer;text-align:left;width:128px;flex-shrink:0;padding:0">
              <img src={al.cover} alt={al.title} style="width:128px;height:128px;border-radius:12px;object-fit:cover;display:block;margin-bottom:8px" loading="lazy" />
              <p style="font-size:.74rem;font-weight:700;color:#F5F5F5;margin:0 0 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{al.title}</p>
              <p style="font-size:.65rem;color:rgba(245,245,245,.4);margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{al.artist}</p>
            </button>
          {/each}
        </div>
      </div>
    {/if}

    <!-- UNTUKMU: full list, compact rows, highest density section by design -->
    {#if _rest.length}
      <div class="section-title" style="margin-bottom:10px">
        <span class="bar"></span>
        <span style="font-size:.85rem;font-weight:700;color:#F5F5F5">Untukmu</span>
      </div>

      <div style="display:flex;flex-direction:column;gap:8px;padding-bottom:8px">
        {#each _rest as { item, idx }, i}
          <div class="glass-card animate-card-up"
            style="border-radius:14px;padding:9px;display:flex;gap:10px;align-items:center;animation-delay:{Math.min(i,10)*30}ms;
              {$_q8z?.videoId === item.videoId ? 'border-color:rgba(255,255,255,.38);box-shadow:0 0 18px rgba(255,255,255,.13)' : ''}">

            <button on:click={() => _pl(item, idx)}
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
                  color:{$_q8z?.videoId === item.videoId ? '#FFFFFF' : '#F5F5F5'};margin-bottom:3px">
                  {item.title}
                </p>
                {#if item.author}
                  {#if item.artistId}
                    <span role="link" tabindex="0" on:click|stopPropagation={() => goto(`/artist/${item.artistId}`)} on:keydown={() => {}}
                      style="font-size:.7rem;font-weight:500;color:rgba(255,255,255,.5);margin:0;cursor:pointer;
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
                background:transparent;border:none;cursor:pointer;color:rgba(245,245,245,.3);transition:all .15s"
              onmouseenter="this.style.background='rgba(255,255,255,.1)';this.style.color='rgba(255,255,255,.7)'"
              onmouseleave="this.style.background='transparent';this.style.color='rgba(245,245,245,.3)'">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
            </button>

          </div>
        {/each}
      </div>
    {/if}
  {/if}

  {#if !_ld && !_er}
  <div style="padding:20px 0 24px;text-align:center">
    <span style="font-size:.62rem;color:rgba(255,255,255,.2);letter-spacing:.12em;font-weight:600">· dibuat dengan ❤️ oleh givy ·</span>
  </div>
  {/if}

</div>

<style>
  .mini-spin {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 2.5px solid rgba(255,255,255,.2);
    border-top-color: #FFFFFF;
    animation: _mspin .7s linear infinite;
  }
  @keyframes _mspin { to { transform: rotate(360deg); } }

  /* Featured hero card */
  .hero-card { width: 100%; aspect-ratio: 16 / 11; }
  .hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
  .hero-scrim {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(10,10,10,.05) 0%, rgba(10,10,10,.35) 55%, rgba(10,10,10,.92) 100%);
  }
  .hero-body { position: absolute; left: 16px; right: 70px; bottom: 16px; min-width: 0; }
  .hero-play {
    position: absolute; right: 16px; bottom: 16px; width: 44px; height: 44px; border-radius: 50%;
    background: linear-gradient(135deg, var(--gold), var(--gold-soft));
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 16px rgba(255,255,255,.35);
  }

  /* Rekomendasi cepat grid */
  .quick-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .quick-card { aspect-ratio: 1; }
  .quick-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
  .quick-scrim {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(10,10,10,.05) 0%, rgba(10,10,10,.25) 45%, rgba(10,10,10,.88) 100%);
  }
  .quick-body { position: absolute; left: 10px; right: 10px; bottom: 9px; min-width: 0; }

  @media (min-width: 420px) {
    .hero-body { right: 80px; }
  }
</style>
