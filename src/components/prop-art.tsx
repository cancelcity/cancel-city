'use client';
import Image from 'next/image';
import {PROP_BY_ID} from '../data/props';
export function PropArt({id,priority=false,decorative=false}:{id:string;priority?:boolean;decorative?:boolean}){const prop=PROP_BY_ID[id];if(!Object.hasOwn(PROP_BY_ID,id))return null;return <Image src={prop.art} width={768} height={768} alt={decorative?'':`Illustrated ${prop.name}`} loading={priority?'eager':'lazy'} draggable={false}/>;}
