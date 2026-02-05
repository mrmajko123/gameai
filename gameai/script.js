// Mobile sidebar toggle
(function(){
  function qs(sel){ return document.querySelector(sel); }
  const header = qs('header');
  const toggle = qs('.menu-toggle');
  const sidebar = qs('.mobile-sidebar');
  const overlay = qs('.sidebar-overlay');
  const nav = qs('header nav');
  const logo = qs('.logo-link');

  if(!header) return;

  // Sidebar open/close helpers
  function open(){
    if(!sidebar) return;
    sidebar.classList.add('open');
    if(overlay) overlay.classList.add('open');
    document.documentElement.classList.add('no-scroll');
    document.body.classList.add('no-scroll');
  }
  function close(){
    if(!sidebar) return;
    sidebar.classList.remove('open');
    if(overlay) overlay.classList.remove('open');
    document.documentElement.classList.remove('no-scroll');
    document.body.classList.remove('no-scroll');
  }

  if(toggle && sidebar){
    toggle.addEventListener('click', ()=>{
      if(sidebar.classList.contains('open')) close(); else open();
    });
  }
  if(overlay) overlay.addEventListener('click', close);
  if(sidebar) sidebar.querySelectorAll('a').forEach(a=> a.addEventListener('click', close));

  // Detect nav overflow and toggle header.collapsed
  function measureNavRequiredWidth(){
    if(!nav) return 0;
    const computed = getComputedStyle(nav);
    const wasHidden = computed.display === 'none';
    const prev = { display: nav.style.display, position: nav.style.position, left: nav.style.left, visibility: nav.style.visibility };
    if(wasHidden){
      nav.style.display = 'flex';
      nav.style.position = 'absolute';
      nav.style.left = '-9999px';
      nav.style.visibility = 'hidden';
    }
    // Sum widths of children including horizontal margins
    let total = 0;
    const children = Array.from(nav.children).filter(n => n.tagName === 'A' || n.tagName === 'SPAN' || n.tagName === 'BUTTON');
    children.forEach(ch => {
      const rect = ch.getBoundingClientRect();
      const cs = getComputedStyle(ch);
      const mLeft = parseFloat(cs.marginLeft) || 0;
      const mRight = parseFloat(cs.marginRight) || 0;
      total += rect.width + mLeft + mRight;
    });
    // restore
    nav.style.display = prev.display;
    nav.style.position = prev.position;
    nav.style.left = prev.left;
    nav.style.visibility = prev.visibility;
    return Math.ceil(total);
  }

  function checkNavOverflow(){
    if(!nav || !logo) return;
    const headerWidth = header.clientWidth;
    const logoRect = logo.getBoundingClientRect();
    const logoWidth = logoRect.width || logo.offsetWidth || 0;
    const toggleRect = toggle ? toggle.getBoundingClientRect() : { width: 0 };
    const toggleWidth = toggleRect.width || 0;
    // small extra buffer for paddings
    const buffer = 24;
    const available = Math.max(0, headerWidth - logoWidth - toggleWidth - buffer);
    const needs = measureNavRequiredWidth();
    if(needs > available){
      header.classList.add('collapsed');
    } else {
      header.classList.remove('collapsed');
      close();
    }
  }

  // Run on load and resize. Use ResizeObserver for more responsiveness where available.
  window.addEventListener('resize', checkNavOverflow);
  window.addEventListener('load', checkNavOverflow);
  document.addEventListener('DOMContentLoaded', checkNavOverflow);

  if(window.ResizeObserver){
    const ro = new ResizeObserver(()=> requestAnimationFrame(checkNavOverflow));
    ro.observe(header);
    if(nav) ro.observe(nav);
    if(logo) ro.observe(logo);
  }

})();
