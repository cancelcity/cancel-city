import {Suspense} from 'react';
import {Game} from '../../src/components/game';
export default function Page(){return <Suspense fallback={<div className="loading-city">The microphone is warming up…</div>}><Game view="roast"/></Suspense>;}
