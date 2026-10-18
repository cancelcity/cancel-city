import {Suspense} from 'react';
import {Game} from '../../src/components/game';
export default function Page(){return <Suspense fallback={<div className="loading-city">Loading the city…</div>}><Game view="battle"/></Suspense>;}
