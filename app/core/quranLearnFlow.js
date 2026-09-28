(function(window){
  'use strict';

  var VIEWS={home:true,units:true,word:true,reader:true,settings:true,phonics:true,ayah:true,map:true,prayer:true,stats:true,gate:true,session:true};

  function entry(view,param,title){
    if(typeof view!=='string'||!VIEWS[view]) return null;
    if(param!==null&&param!==undefined&&typeof param!=='string'&&typeof param!=='number') return null;
    return {view:view,param:param===undefined?null:param,title:typeof title==='string'?title:''};
  }
  function home(title){ return {view:'home',param:null,title:typeof title==='string'&&title?title:"Kur'an Arapçası"}; }
  function createStack(homeTitle){ return [home(homeTitle)]; }
  function normalize(stack,homeTitle){
    var root=home(homeTitle),result=[root];
    if(!Array.isArray(stack)) return result;
    for(var i=0;i<stack.length;i+=1){
      var item=stack[i],normalized=item&&entry(item.view,item.param,item.title);
      if(!normalized) continue;
      if(normalized.view==='home'){
        if(result.length===1&&normalized.title) result[0]=normalized;
      }else result.push(normalized);
    }
    return result;
  }
  function openStack(view,param,title,homeTitle){
    var result=createStack(homeTitle),next=entry(view,param,title);
    if(next&&next.view!=='home') result.push(next);
    return result;
  }
  function push(stack,view,param,title,homeTitle){
    var result=normalize(stack,homeTitle),next=entry(view,param,title);
    if(next&&next.view!=='home') result.push(next);
    return result;
  }
  function reset(view,param,title,homeTitle){ return openStack(view,param,title,homeTitle); }
  function replaceTop(stack,view,param,title,homeTitle){
    var result=normalize(stack,homeTitle),next=entry(view,param,title);
    if(!next) return result;
    if(next.view==='home') return createStack(homeTitle);
    if(result.length===1) result.push(next); else result[result.length-1]=next;
    return result;
  }
  function current(stack,homeTitle){
    var result=normalize(stack,homeTitle);
    return result[result.length-1];
  }
  function previous(stack,homeTitle){
    var result=normalize(stack,homeTitle);
    return result.length>1?result[result.length-2]:null;
  }
  function back(stack,homeTitle){
    var result=normalize(stack,homeTitle);
    if(result.length<2) return {stack:result,entry:result[0],changed:false};
    result=result.slice(0,-1);
    return {stack:result,entry:result[result.length-1],changed:true};
  }

  window.SeymaQuranLearnFlow={version:1,createStack:createStack,openStack:openStack,push:push,reset:reset,replaceTop:replaceTop,current:current,previous:previous,back:back};
})(window);
