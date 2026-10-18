import Image from 'next/image';
import {Skull} from 'lucide-react';
export function CityLogo({small=false,priority=true}:{small?:boolean;priority?:boolean}){return <div className={`city-logo ${small?'small':''}`}><Image src="/assets/reference/title-logo.webp" alt="Cancel City — Everyone is the problem." width={720} height={420} priority={priority}/></div>;}
export function PackWrapper(){return <div className="pack-wrapper"><div className="pack-seal"/><CityLogo small priority={false}/><span className="pack-label">TRADING CARDS</span><span className="pack-warning">SAME OUTRAGE.<br/>DIFFERENT DAY.</span><div className="pack-rat"><Skull size={55}/></div><span className="pack-corner">5 RESIDENTS · 3 SETS</span><div className="pack-seal bottom"/></div>;}
