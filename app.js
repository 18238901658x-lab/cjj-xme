const $ = selector => document.querySelector(selector);
const samples = [
  {id:'sample-1',src:'assets/coast.jpg',caption:'湖边，暂停一下',date:'2026-05-20',category:'旅行'},
  {id:'sample-2',src:'assets/couple.jpg',caption:'关于我们',date:'2026-06-01',category:'我们'},
  {id:'sample-3',src:'assets/coffee.jpg',caption:'下午三点的咖啡',date:'2026-06-15',category:'日常'},
  {id:'sample-4',src:'assets/mountain.jpg',caption:'走进山里',date:'2026-07-12',category:'旅行'},
  {id:'sample-5',src:'assets/city.jpg',caption:'入夜之后',date:'2026-08-08',category:'旅行'},
  {id:'sample-6',src:'assets/sunset.jpg',caption:'落日余温',date:'2026-09-21',category:'日常'}
];
let photos = [...samples], filter = '全部', activeIndex = 0, toastTimer;
const visiblePhotos = () => photos.filter(p => filter === '全部' || p.category === filter);
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'),3500); }
function render() {
  $('#total-count').textContent = photos.length;
  $('#photo-grid').replaceChildren(...visiblePhotos().map((photo,index) => {
    const button = document.createElement('button'); button.className = 'photo-card';
    button.setAttribute('aria-label',`查看照片：${photo.caption}`);
    const wrap = document.createElement('span'); wrap.className = 'image-wrap';
    const img = document.createElement('img'); img.src = photo.src; img.alt = photo.caption; img.loading = 'lazy';
    const category = document.createElement('span'); category.className = 'photo-category'; category.textContent = photo.category;
    const zoom = document.createElement('span'); zoom.className = 'zoom-icon'; zoom.textContent = '↗';
    wrap.append(img,category,zoom);
    const bottom = document.createElement('span'); bottom.className = 'card-bottom';
    const title = document.createElement('span'); title.className = 'card-title'; title.textContent = photo.caption;
    const date = document.createElement('span'); date.className = 'card-date'; date.textContent = photo.date.replaceAll('-','.');
    bottom.append(title,date); button.append(wrap,bottom); button.addEventListener('click',() => openPhoto(index)); return button;
  }));
}
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click',() => {
  filter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(item => { item.classList.toggle('selected', item === button); item.setAttribute('aria-pressed',String(item === button)); }); render();
}));
let playlist = [], playing = false, playTimer, imageRequest = 0, collectionFilter = '全部';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const viewer = $('#lightbox');
function clearPlayback() { clearTimeout(playTimer); $('#slide-progress-fill').classList.remove('running'); }
function schedulePlayback() {
  clearPlayback();
  $('#play-toggle').textContent = playing ? '暂停轮播 Ⅱ' : '自动播放 ▶';
  if(playing && viewer.open && !$('#slideshow-view').hidden && !document.hidden && playlist.length > 1) {
    $('#slide-progress-fill').style.animationDuration = `${Number($('#play-speed').value)}ms`;
    void $('#slide-progress-fill').offsetWidth;
    $('#slide-progress-fill').classList.add('running');
    playTimer = setTimeout(() => stepPhoto(1),Number($('#play-speed').value));
  }
}
function renderThumbnails() {
  $('#slide-thumbnails').replaceChildren(...playlist.map((photo,index) => {
    const button = document.createElement('button'); button.setAttribute('aria-label',`跳到第 ${index+1} 张：${photo.caption}`);
    button.setAttribute('aria-current',String(index === activeIndex));
    const image = document.createElement('img'); image.src = photo.src; image.alt = ''; image.loading = 'lazy';
    button.append(image); button.onclick = () => { activeIndex = index; showPhoto(); }; return button;
  }));
}
async function showPhoto() {
  const photo = playlist[activeIndex]; if(!photo) return;
  clearPlayback(); resetZoom(); const request = ++imageRequest;
  $('#slide-loading').textContent = '正在加载…';
  try {
    const image = new Image(); image.src = photo.src; await image.decode();
    if(request !== imageRequest || !viewer.open || $('#slideshow-view').hidden) return;
    $('#lightbox-img').src = photo.src; $('#lightbox-img').alt = photo.caption;
    $('#slide-loading').textContent = '';
    $('#lightbox-caption').textContent = photo.caption;
    $('#slide-meta').textContent = `${photo.category} / ${photo.date.replaceAll('-','.')}`;
    $('#slide-count').textContent = `${String(activeIndex+1).padStart(2,'0')} / ${String(playlist.length).padStart(2,'0')}`;
    if(!reducedMotion.matches) $('#lightbox-img').animate([{opacity:.2},{opacity:1}],{duration:650,easing:'ease-out'});
    [...$('#slide-thumbnails').children].forEach((button,index) => button.setAttribute('aria-current',String(index === activeIndex)));
    $('#slide-thumbnails').children[activeIndex]?.scrollIntoView({block:'nearest',inline:'nearest',behavior:reducedMotion.matches?'instant':'smooth'});
    $('.previous').disabled = $('.next').disabled = playlist.length < 2;
    schedulePlayback();
  } catch {
    if(request !== imageRequest) return;
    $('#slide-loading').textContent = '照片加载失败，请切换下一张。'; playing = false; schedulePlayback();
  }
}
function enterPlayer(list,index=0,auto=false) {
  playlist = [...list]; if(!playlist.length) return;
  activeIndex = Math.min(index,playlist.length-1); playing = auto;
  $('#all-photos-view').hidden = true; $('#slideshow-view').hidden = false; $('#view-all').hidden = false;
  if(!viewer.open) viewer.showModal();
  document.body.classList.add('viewer-open'); viewer.scrollTop = 0;
  $('.viewer-hint').textContent = matchMedia('(pointer: coarse)').matches ? '左右滑动切换 · 双指缩放 · 放大后拖动' : '← → 切换 · 空格播放 / 暂停 · + − 缩放 · 0 复位 · Esc 返回';
  renderThumbnails(); showPhoto(); $('#play-toggle').focus({preventScroll:true});
}
function openPhoto(index) { enterPlayer(visiblePhotos(),index,false); }
function stepPhoto(step) { activeIndex = (activeIndex + step + playlist.length) % playlist.length; showPhoto(); }
function renderCollection() {
  const list = photos.filter(photo => collectionFilter === '全部' || photo.category === collectionFilter);
  $('#collection-count').textContent = `${list.length} 张照片 · 点击任意一张，进入大图浏览`;
  $('#collection-play').disabled = list.length === 0;
  $('#collection-grid').replaceChildren(...list.map((photo,index) => {
    const button = document.createElement('button'); button.className = 'collection-card'; button.setAttribute('aria-label',`打开照片：${photo.caption}`);
    const image = document.createElement('img'); image.src = photo.src; image.alt = photo.caption; image.loading = 'lazy';
    const title = document.createElement('span'); title.textContent = photo.caption;
    const date = document.createElement('small'); date.textContent = photo.date.replaceAll('-','.');
    button.append(image,title,date); button.onclick = () => enterPlayer(list,index,false); return button;
  }));
  if(!list.length) { const empty = document.createElement('p'); empty.className = 'collection-empty'; empty.textContent = '这个分类还没有照片，期待你们的第一张。'; $('#collection-grid').append(empty); }
  document.querySelectorAll('[data-view-filter]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.viewFilter === collectionFilter)));
}
function openCollection() {
  playing = false; clearPlayback(); imageRequest++;
  $('#slideshow-view').hidden = true; $('#all-photos-view').hidden = false; $('#view-all').hidden = true;
  collectionFilter = '全部'; renderCollection();
  if(!viewer.open) viewer.showModal();
  document.body.classList.add('viewer-open'); viewer.scrollTop = 0;
  $('[data-view-filter="全部"]').focus({preventScroll:true});
}
$('.previous').onclick = () => stepPhoto(-1); $('.next').onclick = () => stepPhoto(1);
$('#play-toggle').onclick = () => { playing = !playing; if(playing) resetZoom(); schedulePlayback(); };
$('#play-speed').onchange = schedulePlayback;
$('#start-story').onclick = $('#play-story').onclick = () => enterPlayer(photos,0,!reducedMotion.matches);
$('#view-all').onclick = openCollection;
document.querySelectorAll('[data-open-all]').forEach(button => button.onclick = openCollection);
document.querySelectorAll('[data-view-filter]').forEach(button => button.onclick = () => { collectionFilter = button.dataset.viewFilter; renderCollection(); });
$('#collection-play').onclick = () => enterPlayer(photos.filter(photo => collectionFilter === '全部' || photo.category === collectionFilter),0,!reducedMotion.matches);
viewer.addEventListener('keydown',event => {
  if($('#slideshow-view').hidden || ['INPUT','TEXTAREA','SELECT'].includes(event.target.tagName)) return;
  if(['+','=','-','0'].includes(event.key)) { event.preventDefault(); if(event.key === '0') resetZoom(); else setZoom(zoomScale + (event.key === '-' ? -.25 : .25)); }
  if(event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); stepPhoto(event.key === 'ArrowLeft'?-1:1); }
  if(event.code === 'Space' && !['INPUT','TEXTAREA','SELECT'].includes(event.target.tagName)) { event.preventDefault(); $('#play-toggle').click(); }
});
viewer.addEventListener('close',() => { playing = false; clearPlayback(); imageRequest++; resetZoom(); document.body.classList.remove('viewer-open'); });
document.addEventListener('visibilitychange',schedulePlayback);
// Scale is relative to the fitted image; pan limits use its actual visible dimensions.
const imageStage = $('.slide-image-wrap');
let zoomScale = 1, panX = 0, panY = 0, dragStart = null, pinchStart = null, gestureMoved = false;
const pointers = new Map();
function panLimits() {
  const img = $('#lightbox-img');
  const fit = Math.min(imageStage.clientWidth/(img.naturalWidth || 1),imageStage.clientHeight/(img.naturalHeight || 1));
  return {x:Math.max(0,((img.naturalWidth || 1)*fit*zoomScale-imageStage.clientWidth)/2),y:Math.max(0,((img.naturalHeight || 1)*fit*zoomScale-imageStage.clientHeight)/2)};
}
function applyZoom() {
  const limit = panLimits(); panX = Math.max(-limit.x,Math.min(limit.x,panX)); panY = Math.max(-limit.y,Math.min(limit.y,panY));
  $('#lightbox-img').style.transform = `translate(${panX}px, ${panY}px) scale(${zoomScale})`;
  imageStage.classList.toggle('zoomed',zoomScale>1);
  $('#zoom-level').textContent = `${Math.round(zoomScale*100)}%`;
  $('#zoom-out').disabled = zoomScale <= .5; $('#zoom-in').disabled = zoomScale >= 4;
}
function pauseForInspection() { if(playing) { playing = false; schedulePlayback(); } }
function setZoom(next,point) {
  pauseForInspection();
  const old = zoomScale; zoomScale = Math.max(.5,Math.min(4,next));
  if(point) {
    const rect = imageStage.getBoundingClientRect(), x = point.x-rect.left-rect.width/2, y = point.y-rect.top-rect.height/2;
    panX = x-(x-panX)*zoomScale/old; panY = y-(y-panY)*zoomScale/old;
  }
  applyZoom();
}
function resetZoom() {
  zoomScale = 1; panX = panY = 0; pointers.clear(); dragStart = pinchStart = null; imageStage.classList.remove('dragging'); applyZoom();
}
$('#zoom-in').onclick = () => setZoom(zoomScale+.25);
$('#zoom-out').onclick = () => setZoom(zoomScale-.25);
$('#zoom-reset').onclick = resetZoom;
imageStage.addEventListener('dblclick',event => { if(zoomScale>1) resetZoom(); else setZoom(2,{x:event.clientX,y:event.clientY}); });
imageStage.addEventListener('wheel',event => { event.preventDefault(); setZoom(zoomScale*Math.exp(-event.deltaY*.0015),{x:event.clientX,y:event.clientY}); },{passive:false});
function startGesture() {
  const list = [...pointers.values()];
  if(list.length>=2) {
    pauseForInspection(); gestureMoved = true;
    const rect = imageStage.getBoundingClientRect();
    pinchStart = {distance:Math.max(1,Math.hypot(list[1].x-list[0].x,list[1].y-list[0].y)),scale:zoomScale,x:panX,y:panY,mx:(list[0].x+list[1].x)/2-rect.left-rect.width/2,my:(list[0].y+list[1].y)/2-rect.top-rect.height/2};
    dragStart = null;
  } else if(list.length===1) { dragStart = {x:list[0].x,y:list[0].y,panX,panY}; pinchStart = null; }
}
imageStage.addEventListener('pointerdown',event => {
  if(event.pointerType === 'mouse' && event.button !== 0) return;
  imageStage.setPointerCapture(event.pointerId); pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
  if(pointers.size===1) gestureMoved = false;
  if(zoomScale>1) { pauseForInspection(); imageStage.classList.add('dragging'); }
  startGesture();
});
imageStage.addEventListener('pointermove',event => {
  if(!pointers.has(event.pointerId)) return;
  pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
  const list = [...pointers.values()];
  if(list.length>=2 && pinchStart) {
    const rect = imageStage.getBoundingClientRect();
    zoomScale = Math.max(.5,Math.min(4,pinchStart.scale*Math.hypot(list[1].x-list[0].x,list[1].y-list[0].y)/pinchStart.distance));
    const ratio = zoomScale/pinchStart.scale;
    panX = (list[0].x+list[1].x)/2-rect.left-rect.width/2-(pinchStart.mx-pinchStart.x)*ratio;
    panY = (list[0].y+list[1].y)/2-rect.top-rect.height/2-(pinchStart.my-pinchStart.y)*ratio; applyZoom();
  } else if(dragStart && zoomScale>1) {
    panX = dragStart.panX + event.clientX-dragStart.x; panY = dragStart.panY+event.clientY-dragStart.y; applyZoom();
  }
});
function endPointer(event) {
  if(!pointers.has(event.pointerId)) return;
  if(event.type === 'pointerup' && pointers.size===1 && dragStart && zoomScale===1 && !gestureMoved && event.pointerType!=='mouse') {
    const dx = event.clientX-dragStart.x, dy = event.clientY-dragStart.y;
    if(Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy)*1.5) stepPhoto(dx<0?1:-1);
  }
  pointers.delete(event.pointerId); imageStage.classList.remove('dragging');
  if(pointers.size) startGesture(); else dragStart = pinchStart = null;
}
imageStage.addEventListener('pointerup',endPointer); imageStage.addEventListener('pointercancel',endPointer); imageStage.addEventListener('lostpointercapture',endPointer);
new ResizeObserver(() => { if(viewer.open) applyZoom(); }).observe(imageStage);
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.close').onclick = () => dialog.close();
  dialog.addEventListener('click',event => { if(event.target === dialog) { const r = dialog.getBoundingClientRect(); if(event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
});
const today = new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
$('#upload-form').elements.date.value = today;
$('#upload-open').onclick = () => $('#upload-dialog').showModal();
let settings = {};
try { settings = JSON.parse(localStorage.getItem('our-days-settings') || '{}'); } catch { settings = {}; }
function renderSettings() {
  const names = settings.names || 'CJJ × XME';
  document.title = `${names} · 我们的小世界`;
  const line = $('#together-text'); line.replaceChildren();
  let message = names ? `${names} / OUR SHARED ARCHIVE` : 'YOU & ME / FRAME BY FRAME';
  if(settings.start) {
    const dayNumber = date => Date.UTC(date.getFullYear(),date.getMonth(),date.getDate());
    const start = new Date(`${settings.start}T00:00:00`);
    const days = Math.floor((dayNumber(new Date()) - dayNumber(start)) / 86400000) + 1;
    if(Number.isFinite(days) && days > 0) message = `${names ? names + ' · ' : ''}在一起的第 ${days} 天`;
  }
  line.append(document.createTextNode(message)); const small = document.createElement('small'); small.textContent = 'A LIFE IN PROGRESS.'; line.append(small);
}
$('#settings-open').onclick = () => { const form = $('#settings-form'); form.elements.names.value = settings.names || 'CJJ × XME'; form.elements.start.value = settings.start || ''; form.elements.start.max = today; $('#settings-dialog').showModal(); };
$('#settings-form').onsubmit = event => {
  event.preventDefault(); const form = event.currentTarget;
  const next = {names:form.elements.names.value.trim(),start:form.elements.start.value};
  try { localStorage.setItem('our-days-settings',JSON.stringify(next)); settings = next; renderSettings(); $('#settings-dialog').close(); toast('设置已保存'); } catch { toast('浏览器无法保存设置，请检查存储权限'); }
};
const dbPromise = new Promise((resolve,reject) => {
  const request = indexedDB.open('our-days-album',1);
  request.onupgradeneeded = () => request.result.createObjectStore('photos',{keyPath:'id'});
  request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
});
async function readPhotos() { const db = await dbPromise; return new Promise((resolve,reject) => { const req = db.transaction('photos').objectStore('photos').getAll(); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); }); }
async function storePhotos(records) { const db = await dbPromise; return new Promise((resolve,reject) => { const tx = db.transaction('photos','readwrite'); for(const record of records) tx.objectStore('photos').put(record); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error || new Error('保存失败')); }); }
async function compressImage(file) {
  const bitmap = await createImageBitmap(file); const scale = Math.min(1,2000 / Math.max(bitmap.width,bitmap.height));
  const canvas = document.createElement('canvas'); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height); bitmap.close();
  return new Promise((resolve,reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('无法处理照片')),'image/jpeg',.88));
}
$('#upload-form').onsubmit = async event => {
  event.preventDefault(); const form = event.currentTarget; const files = [...$('#photo-files').files];
  const status = $('#upload-status'); const button = form.querySelector('[type=submit]');
  if(files.length > 30) { status.textContent = '一次最多添加 30 张照片。'; return; }
  if(files.some(f => f.size > 15*1024*1024 || !['image/jpeg','image/png','image/webp'].includes(f.type))) { status.textContent = '请选择每张 15 MB 以内的 JPG、PNG 或 WebP 照片。'; return; }
  button.disabled = true; status.textContent = '正在整理你的照片…';
  try {
    const records = [];
    for(let i=0;i<files.length;i++) records.push({id:crypto.randomUUID(),blob:await compressImage(files[i]),caption:form.elements.caption.value.trim() + (files.length > 1 ? ` · ${i+1}` : ''),date:form.elements.date.value,category:form.elements.category.value,createdAt:Date.now()+i});
    await storePhotos(records);
    photos.unshift(...records.map(record => ({...record,src:URL.createObjectURL(record.blob)})));
    $('[data-filter="全部"]').click(); $('#upload-dialog').close(); form.reset(); form.elements.date.value = today; status.textContent = ''; toast(`已收藏 ${records.length} 张照片`);
  } catch(error) { status.textContent = '照片未保存。请确认图片有效、浏览器存储空间充足后重试。'; console.error(error); }
  finally { button.disabled = false; }
};
const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if(entry.isIntersecting) document.querySelectorAll('nav a').forEach(a => a.classList.toggle('active', a.hash === '#' + entry.target.id)); }); },{rootMargin:'-15% 0px -60% 0px'});
['home','album','story'].forEach(id => observer.observe(document.getElementById(id)));
renderSettings(); render();
readPhotos().then(records => { photos = [...records.sort((a,b) => b.createdAt - a.createdAt).map(record => ({...record,src:URL.createObjectURL(record.blob)})),...samples]; render(); }).catch(() => toast('浏览器照片存储暂不可用，仍可浏览示例相册'));
