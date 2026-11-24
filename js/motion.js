/* motion engine · own build for this page */
(function(){
  var d=document,h=d.documentElement,W=window;
  var top=d.querySelector('.top');
  function setTop(){ if(top) h.style.setProperty('--top-h',top.offsetHeight+'px'); }
  setTop(); W.addEventListener('resize',setTop); W.addEventListener('load',setTop);

  /* burger */
  var bt=d.querySelector('.burger'),mn=d.getElementById('menu');
  if(bt&&mn){
    var set=function(o){bt.setAttribute('aria-expanded',o?'true':'false');mn.classList.toggle('open',o);};
    bt.addEventListener('click',function(){set(bt.getAttribute('aria-expanded')!=='true');});
    mn.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){set(false);});});
    d.addEventListener('keydown',function(e){if(e.key==='Escape')set(false);});
    W.addEventListener('resize',function(){if(W.innerWidth>=900)set(false);});
  }

  /* map on click */
  d.querySelectorAll('[data-map]').forEach(function(b){
    b.addEventListener('click',function(){
      var box=b.closest('.map'),f=d.createElement('iframe');
      f.src=b.getAttribute('data-map');f.title='Карта: Этуаль де Жэнесс';f.setAttribute('allowfullscreen','');
      box.classList.add('live');box.innerHTML='';box.appendChild(f);
    });
  });

  var fine=W.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var reduce=W.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* light spot (fine pointer only, own fixed layer, transform only) */
  var spot=d.querySelector('.spot');
  if(spot&&fine&&!reduce){
    var sx=0,sy=0,sq=false;
    W.addEventListener('pointermove',function(e){sx=e.clientX;sy=e.clientY;if(!sq){sq=true;requestAnimationFrame(function(){spot.style.transform='translate('+(sx-300)+'px,'+(sy-300)+'px)';spot.classList.add('on');sq=false;});}},{passive:true});
  }
  /* tilt with cursor */
  if(fine&&!reduce){
    d.querySelectorAll('[data-tilt]').forEach(function(el){
      var p=el.parentElement;
      p.addEventListener('pointermove',function(e){var r=p.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform='perspective(900px) rotateY('+(x*7).toFixed(2)+'deg) rotateX('+(-y*6).toFixed(2)+'deg)';});
      p.addEventListener('pointerleave',function(){el.style.transform='';});
    });
  }

  if(!h.classList.contains('m-on')) return;
  h.classList.add('m-ready');

  /* split words of short headings */
  d.querySelectorAll('[data-split]').forEach(function(el){
    var i=0,walk=function(n){
      Array.prototype.slice.call(n.childNodes).forEach(function(c){
        if(c.nodeType===3){
          var parts=c.textContent.split(/(\s+)/),fr=d.createDocumentFragment();
          parts.forEach(function(p){
            if(!p) return;
            if(/^\s+$/.test(p)){fr.appendChild(d.createTextNode(p));return;}
            var w=d.createElement('span'),wi=d.createElement('span');
            w.className='w';wi.className='wi';wi.style.setProperty('--k',i++);wi.textContent=p;w.appendChild(wi);fr.appendChild(w);
          });
          n.replaceChild(fr,c);
        } else if(c.nodeType===1 && !c.classList.contains('w')) walk(c);
      });
    };
    walk(el);
  });

  /* stagger index from parent group */
  d.querySelectorAll('[data-st]').forEach(function(g){
    var k=0;g.querySelectorAll('[data-rv],[data-pin],[data-cur]').forEach(function(c){c.style.setProperty('--i',k++);});
  });

  /* curtain: release clip after reveal */
  d.querySelectorAll('[data-cur]').forEach(function(f){
    f.addEventListener('transitionend',function(e){if(e.propertyName==='clip-path'&&f.classList.contains('in'))f.classList.add('done');});
  });

  var sel='[data-rv],[data-split],[data-cur],[data-pin],[data-ln],[data-mark]';
  var all=Array.prototype.slice.call(d.querySelectorAll(sel)).filter(function(e){return !e.closest('.hero');});
  var show=function(e){
    if(e.classList.contains('in')) return;
    e.classList.add('in');
    if(e.hasAttribute('data-mark')) mark(e);
  };
  var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){show(x.target);io.unobserve(x.target);}});},{rootMargin:'0px 0px -8% 0px',threshold:.01});
  all.forEach(function(e){io.observe(e);});
  var sweep=function(){var vh=W.innerHeight;all.forEach(function(e){if(!e.classList.contains('in')&&e.getBoundingClientRect().top<vh)show(e);});};

  /* hero chain: starts 300ms after DOM ready */
  var hero=d.querySelector('.hero');
  var go=function(){setTimeout(function(){if(hero)hero.querySelectorAll(sel).forEach(show);},300);};
  if(d.readyState==='loading') d.addEventListener('DOMContentLoaded',go); else go();

  /* "assemble from marks" captions */
  var noise='+×·/|:–';
  function mark(el){
    var nz=el.querySelector('.nz'); if(!nz) return;
    var txt=nz.getAttribute('data-t')||nz.textContent; nz.setAttribute('data-t',txt);
    var t0=performance.now(),dur=700;
    (function step(t){
      var p=Math.min(1,(t-t0)/dur),n=Math.floor(txt.length*p),s=txt.slice(0,n);
      for(var j=n;j<txt.length;j++) s+=txt[j]===' '?' ':noise[(j+Math.floor(t/60))%noise.length];
      nz.textContent=s; if(p<1) requestAnimationFrame(step); else nz.textContent=txt;
    })(t0);
  }

  /* scroll-linked: glowing paragraph + contacts panel */
  var glow=d.querySelectorAll('[data-glow]'),gl=[];
  glow.forEach(function(p){
    var ws=[];p.childNodes.forEach&&0;
    var txt=p.textContent.trim().split(/\s+/);p.textContent='';
    txt.forEach(function(w,i){var s=d.createElement('span');s.className='gw';s.textContent=w;p.appendChild(s);if(i<txt.length-1)p.appendChild(d.createTextNode(' '));ws.push(s);});
    p.classList.add('gl');gl.push({p:p,ws:ws});
  });
  var panels=d.querySelectorAll('[data-panel]');
  var ticking=false;
  var frame=function(){
    ticking=false;var vh=W.innerHeight;
    gl.forEach(function(g){
      var r=g.p.getBoundingClientRect();if(r.bottom<0||r.top>vh)return;
      var pr=Math.max(0,Math.min(1,(vh*.88-r.top)/(vh*.5))),n=Math.round(pr*g.ws.length);
      g.ws.forEach(function(s,i){s.classList.toggle('lit',i<n);});
    });
    panels.forEach(function(p){
      var t=p.getBoundingClientRect().top,k=(t-vh*.4)/(vh*.6);k=Math.max(0,Math.min(1,k));if(W.scrollY+vh>=h.scrollHeight-4)k=0;
      p.style.setProperty('--fx',(48*k).toFixed(1)+'px');
    });
    sweep();
  };
  var onScroll=function(){if(!ticking){ticking=true;requestAnimationFrame(frame);}};
  W.addEventListener('scroll',onScroll,{passive:true});
  W.addEventListener('resize',onScroll);
  W.addEventListener('load',onScroll);
  W.addEventListener('hashchange',function(){setTimeout(sweep,60);});
  W.addEventListener('beforeprint',function(){all.forEach(show);});
  frame();
})();
