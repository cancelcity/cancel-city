import type {Metadata} from 'next';
import {CinemaShowcase} from '../../src/components/cinema-showcase';

export const metadata: Metadata = {
  title: 'Receipt Apocalypse — Cancel City Pictures',
  description: 'Final Boss Karen has a complaint. Watch the Cancel City cinematic premiere.',
};

export default function CinemaPage() {return <CinemaShowcase/>;}
