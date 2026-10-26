export const PRIMARY_DESTINATIONS=[
 {id:'play',label:'PLAY',href:'/'},
 {id:'collection',label:'COLLECTION',href:'/collection/'},
 {id:'city',label:'CITY',href:'/city/'},
] as const;
export type NavigationGroup=typeof PRIMARY_DESTINATIONS[number]['id'];
const rootOf=(path:string)=>path.split(/[?#]/,1)[0].split('/').filter(Boolean)[0]||'';
export function navigationGroup(path:string):NavigationGroup|null{
 const root=rootOf(path);
 if(['','battle','roast','missions'].includes(root))return 'play';
 if(['collection','packs','market','stash'].includes(root))return 'collection';
 return root==='city'?'city':null;
}
