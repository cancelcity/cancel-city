'use client';
import dynamic from 'next/dynamic';
import {useEffect} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import {useGame} from '../state/store';
import {useArrival} from '../state/arrival';
import {showFirstClash} from '../domain/arrival';
import {FirstClash} from './first-clash';

const ReferenceHome=dynamic(()=>import('./reference-home').then(m=>m.ReferenceHome));
const ClashShare=dynamic(()=>import('./clash-share').then(m=>m.ClashShare));

export function WelcomeHome(){
 const save=useGame(s=>s.save),arrival=useArrival(),params=useSearchParams(),router=useRouter();
 const challenge=params.get('clash')||undefined;
 useEffect(()=>{arrival.load();arrival.force(!!challenge);return()=>arrival.force(false);},[arrival.load,arrival.force,challenge]);
 const visible=showFirstClash(save,arrival.completed,arrival.began,!!challenge);
 const explore=()=>{arrival.finish();router.replace('/',{scroll:false});};
 const continueToPack=()=>{arrival.finish();router.push('/packs/?welcome=1');};
 if(!visible)return <ReferenceHome/>;
 return <FirstClash key={challenge||'welcome'} initialChallenge={challenge} packAction={save?.pendingOpening?'resume':save?.lifetimePacksOpened?'browse':'first'} onBegin={arrival.begin} onContinue={continueToPack} onExplore={explore} renderShare={result=><ClashShare result={result} challengeUrl="https://cancel-city-gacha.tokieth.chatgpt.site/"/>}/>;
}
