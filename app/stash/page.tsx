import {Suspense} from 'react';
import {Game} from '../../src/components/game';
export default function Page(){return <Suspense fallback={<div className="loading-city">Opening the evidence locker…</div>}><Game view="stash"/></Suspense>;}
