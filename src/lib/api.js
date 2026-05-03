const _e1 = (s) => btoa(unescape(encodeURIComponent(s)));
const _d1 = (s) => decodeURIComponent(escape(atob(s)));
const _k = { t: 'title', th: 'thumbnail', d: 'duration', v: 'views', id: 'videoId', u: 'uploaded' };
const _h0 = (r) => r.map(i => ({ title: i.t, thumbnail: i.th, duration: i.d, views: i.v, videoId: i.id, uploaded: i.u }));
const _f2 = (raw) => {
  const d = JSON.parse(raw);
  if (!d.result) return [];
  return d.result.map(i => ({
    t: i.title, th: i.thumbnail, d: i.duration, v: i.views, id: i.videoId, u: i.uploaded
  }));
};
const _b4 = ['aHR0cHM6Ly9hcGku', 'ZGFuenku', 'd2ViLmlkL2FwaS9zZWFyY2gveXRzP3E9'];
const _u = () => _d1(_b4[0]) + _d1(_b4[1]) + _d1(_b4[2]);
export async function _g9(q) {
  const _ep = _u() + encodeURIComponent(q);
  const _rs = await fetch(_ep);
  const _tx = await _rs.text();
  const _en = _e1(_tx);
  const _dc = _d1(_en);
  return _h0(_f2(_dc));
}
