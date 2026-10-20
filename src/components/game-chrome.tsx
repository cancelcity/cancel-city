'use client';
import {ComicHeader,ComicTicker} from './comic-chrome';
export type MainTab='city'|'battle'|'packs'|'collection'|'market'|'stash';
export function CityGameHeader(){return <ComicHeader/>;}
export function CityGameNavigation({active}:{active?:MainTab}){return <ComicTicker/>;}
