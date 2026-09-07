(function(){
  'use strict';
  const cfg=window.LACCD_ENGLISH_RESOURCES||{};
  const eventCfg=window.LACCD_ENGLISH_EVENTS||{};
  const list=document.querySelector('[data-resource-list]');
  const count=document.querySelector('[data-resource-count]');
  const controls=document.querySelector('[data-resource-controls]');
  const submitLinks=Array.from(document.querySelectorAll('[data-resource-submit-link]'));
  const eventLinks=Array.from(document.querySelectorAll('[data-event-submit-link]'));
  let resources=[];

  configureLinks(submitLinks,cfg.submitUrl);
  configureLinks(eventLinks,eventCfg.submitUrl,'events.html#share-event');
  if(!list)return;

  window.LACCDEnglishResourcesReceive=function(payload){
    try{
      resources=Array.isArray(payload)?payload:(payload&&Array.isArray(payload.resources)?payload.resources:[]);
      resources=resources.slice().sort((a,b)=>String(a.title||'').localeCompare(String(b.title||''),'en',{sensitivity:'base'}));
      populateFilters();
      if(controls)controls.hidden=resources.length<6;
      render();
    }catch(error){renderError();}
  };

  if(!cfg.feedUrl){renderUnconfigured();return;}
  const script=document.createElement('script');
  const separator=cfg.feedUrl.includes('?')?'&':'?';
  script.src=cfg.feedUrl+separator+'action=resources&callback=LACCDEnglishResourcesReceive&_='+Date.now();
  script.async=true;script.referrerPolicy='no-referrer';script.onerror=renderError;document.head.appendChild(script);

  document.querySelectorAll('[data-resource-filter]').forEach(control=>{control.addEventListener('input',render);control.addEventListener('change',render);});
  const reset=document.querySelector('[data-resource-reset]');
  if(reset)reset.addEventListener('click',()=>{document.querySelectorAll('[data-resource-filter]').forEach(c=>{c.value='';});render();});

  function configureLinks(links,url,fallback){
    links.forEach(link=>{
      if(url){link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.removeAttribute('aria-disabled');link.classList.remove('is-disabled');}
      else if(fallback){link.href=fallback;link.removeAttribute('target');link.removeAttribute('rel');}
      else{link.removeAttribute('href');link.removeAttribute('target');link.setAttribute('aria-disabled','true');link.classList.add('is-disabled');}
    });
  }
  function populateFilters(){
    populateSelect('#resource-type-filter',unique(resources.map(r=>r.type).filter(Boolean)),'All types');
    populateSelect('#resource-college-filter',unique(resources.map(r=>r.college).filter(Boolean)),'All colleges');
  }
  function populateSelect(selector,values,firstLabel){const select=document.querySelector(selector);if(!select)return;const current=select.value;select.replaceChildren(new Option(firstLabel,''));values.sort((a,b)=>a.localeCompare(b)).forEach(v=>select.add(new Option(v,v)));if(values.includes(current))select.value=current;}
  function render(){
    const filtered=getFiltered();list.replaceChildren();
    if(count)count.textContent=filtered.length===1?'1 teaching resource':filtered.length+' teaching resources';
    if(!filtered.length){const box=el('div','resource-empty');const has=resources.length>0;box.append(el('h3','',has?'No resources match those filters.':'The shelves are ready.'),el('p','',has?'Try a different type, college, or search term.':'No approved public resources are posted yet. Faculty can submit the first one through the Share a Teaching Resource form.'));if(!has&&cfg.submitUrl){const a=el('a','button secondary','Share a Teaching Resource');a.href=cfg.submitUrl;a.target='_blank';a.rel='noopener noreferrer';box.append(a);}list.append(box);return;}
    filtered.forEach(resource=>list.append(buildCard(resource)));
  }
  function getFiltered(){const search=value('#resource-search').toLowerCase();const type=value('#resource-type-filter');const college=value('#resource-college-filter');return resources.filter(r=>{if(type&&r.type!==type)return false;if(college&&r.college!==college)return false;if(search){const hay=[r.title,r.type,r.college,r.description,r.courses,r.accessibility,r.credit,...(r.tags||[])].filter(Boolean).join(' ').toLowerCase();if(!hay.includes(search))return false;}return true;});}
  function buildCard(resource){
    const article=el('article','resource-card');article.dataset.resourceId=resource.id||'';
    article.append(el('p','resource-type',resource.type||'Teaching resource'),el('h3','',resource.title||'Untitled resource'));
    const meta=[resource.college,resource.courses].filter(Boolean).join(' · ');if(meta)article.append(el('p','resource-meta',meta));
    if(resource.description)article.append(el('p','resource-description',resource.description));
    if(resource.accessibility)article.append(detail('Accessibility note',resource.accessibility));
    if(Array.isArray(resource.tags)&&resource.tags.length){const ul=el('ul','resource-tags');ul.setAttribute('aria-label','Resource keywords');resource.tags.forEach(tag=>ul.append(el('li','',tag)));article.append(ul);}
    if(resource.credit)article.append(el('p','resource-credit','Shared by '+resource.credit));
    if(resource.url){const actions=el('div','resource-actions');const a=el('a','','Open '+(resource.title||'resource'));a.href=resource.url;a.target='_blank';a.rel='noopener noreferrer';actions.append(a);article.append(actions);}
    return article;
  }
  function detail(label,text){const wrap=el('div','resource-detail');wrap.append(el('h4','',label),el('p','',text));return wrap;}
  function renderUnconfigured(){list.replaceChildren();const box=el('div','resource-empty');box.append(el('h3','','The Teaching Commons is ready for its shelves.'),el('p','','Run the included Teaching Commons Apps Script setup, deploy the read-only feed, and add the generated URLs to config.js. Nothing publishes until it is approved in the private Sheet.'));list.append(box);if(count)count.textContent='Teaching Commons setup in progress';if(controls)controls.hidden=true;}
  function renderError(){list.replaceChildren();const box=el('div','resource-error');box.append(el('h3','','Teaching resources are temporarily unavailable.'),el('p','','The rest of the site still works. Please try the Teaching Commons again later.'));list.append(box);if(count)count.textContent='Resources temporarily unavailable';if(controls)controls.hidden=true;}
  function value(selector){const node=document.querySelector(selector);return node?String(node.value||'').trim():'';}
  function unique(values){return Array.from(new Set(values));}
  function el(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(typeof text==='string')node.textContent=text;return node;}
})();
