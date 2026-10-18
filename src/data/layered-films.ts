import films from './layered-films.json';
import type {CinematicMode,SpecialPlayback} from '../domain/cinematic';

export interface CinemaFilm {
 title:string;tagline?:string;duration:number;video:string;poster:string;captions:string;
 shots:{id:string;title:string;start:number;end:number;thumbnail:string;description:string}[];
}
export type LayeredFilm=typeof films[number];
export const LAYERED_FILMS:readonly LayeredFilm[]=films;
export function filmForPlayback(playback:Pick<SpecialPlayback,'cardId'|'duoId'|'propId'>,mode:CinematicMode,reduced:boolean){
 return mode==='full'&&!reduced&&!playback.duoId&&!playback.propId?LAYERED_FILMS.find(f=>f.cardId===playback.cardId):undefined;
}
