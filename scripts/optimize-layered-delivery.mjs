import {copyFile,mkdir,readFile,rename,stat,writeFile,access} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';

// Preserve the original encode before making a smaller web delivery. The art,
// frame count, resolution, timing and encoded AAC audio remain the same.
const films=JSON.parse(await readFile('src/data/layered-films.json','utf8'));
const probe=file=>JSON.parse(execFileSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json',file],{encoding:'utf8'}));
const fingerprint=p=>p.streams.map(s=>[s.codec_type,s.codec_name,s.width,s.height,s.r_frame_rate,s.nb_frames,s.sample_rate,s.channels]);
await mkdir('work/delivery-originals',{recursive:true});await mkdir('work/delivery-check',{recursive:true});
for(const film of films){
 if(process.argv.length>2&&!process.argv.slice(2).includes(film.slug))continue;
 const reportFile=`docs/art/layered-specials/${film.slug}/render-report.json`,report=JSON.parse(await readFile(reportFile,'utf8'));
 if(report.deliveryEncoding?.crf===27||report.encoding?.crf===27)continue;
 const file=`public${film.video}`,original=`work/delivery-originals/${film.slug}.mp4`,temporary=`work/delivery-check/${film.slug}-web.mp4`;
 try{await access(original);}catch{await copyFile(file,original);}
 const before=probe(original),originalBytes=(await stat(original)).size;
 execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',original,'-c:v','libx264','-threads','2','-preset','slow','-tune','animation','-crf','27','-pix_fmt','yuv420p','-c:a','copy','-movflags','+faststart',temporary],{stdio:'pipe'});
 execFileSync('ffmpeg',['-v','error','-i',temporary,'-f','null','-'],{stdio:'pipe'});
 const after=probe(temporary);
 if(JSON.stringify(fingerprint(before))!==JSON.stringify(fingerprint(after))||Math.abs(Number(before.format.duration)-Number(after.format.duration))>.001)throw Error(`Delivery changed media timing/streams: ${film.slug}`);
 const bytes=(await stat(temporary)).size;if(bytes>=originalBytes)throw Error(`Delivery did not shrink: ${film.slug}`);
 await rename(temporary,file);
 report.probe=probe(file);report.deliveryEncoding={codec:'H.264/AAC',crf:27,preset:'slow',tune:'animation',width:1280,height:720,fps:60,audio:'AAC packets copied',originalBytes,bytes,sha256:createHash('sha256').update(await readFile(file)).digest('hex'),fullDecodeVerified:true,timingAndStreamsUnchanged:true};
 await writeFile(reportFile,JSON.stringify(report,null,2)+'\n');
 console.log(`${film.slug}: ${(originalBytes/1048576).toFixed(2)} → ${(bytes/1048576).toFixed(2)} MiB; same frames, timing and audio`);
}
