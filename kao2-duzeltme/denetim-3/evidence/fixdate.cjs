// Denetim-3: argümansız Date()/Date.now()'u verilen yerel saate sabitler (yalnız teşhis).
const H=process.env.D3_HOUR||'12:00'; const Real=Date; const base=new Real(); const [h,m]=H.split(':').map(Number);
const fixed=new Real(base.getFullYear(),base.getMonth(),base.getDate(),h,m,0).getTime();
class FDate extends Real{ constructor(...a){ if(a.length===0) super(fixed); else super(...a); } static now(){ return fixed; } }
globalThis.Date=FDate;
