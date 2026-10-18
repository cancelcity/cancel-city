import {defineConfig} from 'vite';
import {cloudflare} from '@cloudflare/vite-plugin';
import {sites} from './build/sites-vite-plugin';
export default defineConfig({publicDir:'out',build:{outDir:'dist'},plugins:[sites({mockAuth:false}),cloudflare({viteEnvironment:{name:'server'},config:{name:'cancel-city',main:'./worker/index.ts',compatibility_date:'2026-05-15',compatibility_flags:['nodejs_compat'],assets:{binding:'ASSETS',run_worker_first:true,html_handling:'force-trailing-slash',not_found_handling:'404-page'},d1_databases:[{binding:'DB',database_name:'site-creator-d1',database_id:'00000000-0000-4000-8000-000000000000'}]}})]});
