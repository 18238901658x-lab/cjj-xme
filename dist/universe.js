(() => {
  const root = document.documentElement;
  const hero = document.querySelector('.universe');
  const cat = document.querySelector('#little-cat');
  const heart = document.querySelector('#heartbeat');
  const toggle = document.querySelector('#motion-toggle');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let enabled = !preference.matches, frame = 0, messageTimer, hopTimer, heartTimer;
  function updateMotion() {
    enabled = enabled && !preference.matches;
    toggle.disabled = preference.matches;
    toggle.title = preference.matches ? '已遵循系统的减少动态效果设置' : '开关页面动效';
    root.classList.toggle('motion-off',!enabled);
    toggle.textContent = enabled ? '动效 ON' : '动效 OFF';
    toggle.setAttribute('aria-pressed',String(enabled));
    toggle.setAttribute('aria-label',enabled ? '暂停装饰动效' : '开启装饰动效');
  }
  toggle.onclick = () => { enabled = !enabled; updateMotion(); };
  preference.addEventListener('change',() => { enabled = !preference.matches; updateMotion(); });
  hero.addEventListener('pointermove',event => {
    if(!enabled || preference.matches || event.pointerType!=='mouse' || frame) return;
    const x = event.clientX, y = event.clientY;
    frame = requestAnimationFrame(() => {
      const r = hero.getBoundingClientRect(), pet = cat.getBoundingClientRect();
      hero.style.setProperty('--scene-x',`${((x-r.left)/r.width-.5)*9}px`);
      hero.style.setProperty('--scene-y',`${((y-r.top)/r.height-.5)*7}px`);
      hero.style.setProperty('--rotate-y',`${((x-r.left)/r.width-.5)*14}deg`);
      hero.style.setProperty('--rotate-x',`${-((y-r.top)/r.height-.5)*8}deg`);
      cat.style.setProperty('--eye-x',`${Math.max(-3,Math.min(3,(x-pet.left-pet.width/2)/80))}px`);
      cat.style.setProperty('--eye-y',`${Math.max(-2,Math.min(2,(y-pet.top-pet.height/2)/100))}px`);
      frame = 0;
    });
  });
  hero.addEventListener('pointerleave',() => { hero.style.setProperty('--rotate-y','0deg'); hero.style.setProperty('--rotate-x','0deg'); hero.style.setProperty('--scene-x','0px'); hero.style.setProperty('--scene-y','0px'); cat.style.setProperty('--eye-x','0px'); cat.style.setProperty('--eye-y','0px'); });
  function particles(target) {
    if(!enabled || preference.matches) return;
    target.querySelectorAll('.love-particle').forEach(node=>node.remove());
    for(let i=0;i<4;i++) {
      const item = document.createElement('span'); item.className='love-particle'; item.textContent='♡'; item.setAttribute('aria-hidden','true');
      item.style.setProperty('--particle-x',`${(i-1.5)*22}px`); item.style.animationDelay=`${i*.08}s`;
      target.append(item); item.addEventListener('animationend',()=>item.remove(),{once:true}); setTimeout(()=>item.remove(),2300);
    }
  }
  cat.onclick = () => {
    cat.classList.remove('petted'); void cat.offsetWidth; if(enabled) cat.classList.add('petted');
    document.querySelector('#pet-message').textContent='喵。你们的回忆，我好好保管。';
    clearTimeout(messageTimer); clearTimeout(hopTimer); particles(cat);
    hopTimer=setTimeout(()=>cat.classList.remove('petted'),800);
    messageTimer=setTimeout(()=>document.querySelector('#pet-message').textContent='这只小猫，住在我们的宇宙里。',3500);
  };
  heart.onclick = () => { heart.classList.remove('reacted'); void heart.offsetWidth; heart.classList.add('reacted'); particles(heart); clearTimeout(heartTimer); heartTimer=setTimeout(()=>heart.classList.remove('reacted'),1800); };
  let homeSlot = null, homeTimer;
  const frames = ['#cover-photo', '#couple-photo', '.orbit-photo-back'].map(selector => document.querySelector(selector));
  function refreshHomePhotos() {
    clearTimeout(homeTimer);
    const nextSlot = HomePhotos.slot();
    if (nextSlot !== homeSlot) {
      homeSlot = nextSlot;
      HomePhotos.choose(publishedPhotos).forEach((photo, index) => {
        const target = frames[index], img = target.querySelector('img');
        const preload = new Image();
        preload.onload = () => {
          if (homeSlot !== nextSlot) return;
          img.src = photo.src; img.alt = photo.caption;
          if (target.tagName === 'BUTTON') {
            target.setAttribute('aria-label', `查看照片：${photo.caption}`);
            target.onclick = () => enterPlayer(photos, Math.max(0, photos.findIndex(item => item.id === photo.id)), false);
          }
          if (!preference.matches && enabled) img.animate([{opacity:.3},{opacity:1}],{duration:650});
        };
        preload.src = photo.src;
      });
    }
    homeTimer = setTimeout(refreshHomePhotos, HomePhotos.untilNext() + 50);
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshHomePhotos(); });
  window.addEventListener('pageshow', refreshHomePhotos);
  refreshHomePhotos();
  const angle = document.querySelector('#scene-angle');
  angle.oninput = () => { hero.style.setProperty('--manual-y',`${angle.value}deg`); angle.setAttribute('aria-valuetext',`${angle.value} 度`); };
  document.querySelector('#scene-reset').onclick = () => { angle.value='0'; angle.oninput(); };
  updateMotion();
})();
