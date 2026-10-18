import type {Metadata} from 'next';
import {GokartCinema} from '../../../src/components/gokart-cinema';

export const metadata:Metadata={title:'Gokart — Full Throttle | Cancel City',description:'An absurdly small vehicle. An unnecessarily powerful special. Watch the Gokart cinematic prototype.'};
export default function GokartPage(){return <GokartCinema/>;}
