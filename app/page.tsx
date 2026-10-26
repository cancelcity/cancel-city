import {Suspense} from 'react';
import {WelcomeHome} from '../src/components/welcome-home';
export default function Page(){return <Suspense fallback={<div className="loading-city">Entering the city…</div>}><WelcomeHome/></Suspense>;}
