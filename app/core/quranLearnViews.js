(function(window){
  'use strict';

  var deps=null;

  function register(nextDeps){
    if(deps||!nextDeps||typeof nextDeps!=='object'||Array.isArray(nextDeps)) return false;
    if(typeof nextDeps.esc!=='function'||typeof nextDeps.icon!=='function') return false;
    deps={esc:nextDeps.esc,icon:nextDeps.icon};
    return true;
  }
  function escapeText(value){
    if(!deps) throw new Error('KAO2-04: görünüm bağımlılıkları kayıtlı değil');
    return deps.esc(value==null?'':String(value));
  }
  function matchingDivEnd(html,start){
    var tags=/<\/?div\b[^>]*>/gi,depth=0,match;
    tags.lastIndex=start;
    while((match=tags.exec(html))){
      if(/^<\//.test(match[0])) depth-=1; else depth+=1;
      if(depth===0) return tags.lastIndex;
    }
    return -1;
  }
  function extractLargeTitle(html){
    var start=html.indexOf('<div class="kao-view-head"');
    if(start<0) return {html:html,content:''};
    var end=matchingDivEnd(html,start);
    if(end<0) throw new Error('KAO2-04: görünüm başlığı dengeli değil');
    var block=html.slice(start,end),openEnd=block.indexOf('>')+1,closeStart=block.lastIndexOf('</div>');
    var content=block.slice(openEnd,closeStart).replace(/<button\b(?=[^>]*class="kao-back")[^>]*>[\s\S]*?<\/button>/g,'');
    return {html:html.slice(0,start)+html.slice(end),content:content};
  }
  function navBar(options){
    if(!deps) throw new Error('KAO2-04: görünüm bağımlılıkları kayıtlı değil');
    var title=escapeText(options.title),isRoot=options.view==='home',action=isRoot?'App.kaoClose()':'App.kaoBack()',label=isRoot?'Kapat':'‹ '+escapeText(options.previousTitle||"Kur'an Arapçası");
    return '<nav class="kao-navbar" aria-label="'+title+'"><button type="button" class="kao-navbar-action" onclick="'+action+'" aria-label="'+label+'">'+label+'</button><span class="kao-navbar-title" title="'+title+'">'+title+'</span><span class="kao-navbar-spacer" aria-hidden="true"></span></nav>';
  }
  function largeTitle(title,content){
    var heading=content||'';
    if(!/<h2\b/i.test(heading)) heading='<h2 class="kao-largetitle-heading">'+escapeText(title)+'</h2>'+heading;
    return '<div class="kao-largetitle">'+heading+'</div>';
  }
  function renderScreen(options){
    if(!deps) throw new Error('KAO2-04: görünüm bağımlılıkları kayıtlı değil');
    if(options.view==='session') return options.body;
    var extracted=extractLargeTitle(String(options.body||''));
    return '<section class="kao-screen kao-screen-'+escapeText(options.view)+'">'+navBar(options)+largeTitle(options.title,extracted.content)+extracted.html+'</section>';
  }

  window.SeymaQuranLearnViews={version:1,register:register,navBar:navBar,largeTitle:largeTitle,renderScreen:renderScreen};
})(window);
