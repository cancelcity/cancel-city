'use client';
import {create} from 'zustand';
export const ARRIVAL_KEY='cancel-city.arrival.v1';
export const useArrival=create<{loaded:boolean;completed:boolean;began:boolean;forced:boolean;load:()=>void;begin:()=>void;finish:()=>void;force:(value:boolean)=>void}>((set,get)=>({
 loaded:false,completed:false,began:false,forced:false,
 load:()=>{if(get().loaded)return;let completed=false;try{completed=localStorage.getItem(ARRIVAL_KEY)==='complete';}catch{}set({loaded:true,completed});},
 begin:()=>set({began:true}),
 finish:()=>{set({completed:true,began:false,forced:false});try{localStorage.setItem(ARRIVAL_KEY,'complete');}catch{}},
 force:forced=>set({forced}),
}));
