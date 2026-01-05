import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function MangaNest() {
  const [readers, setReaders] = useState([
    { name: 'Simone', color: 'green', avatar: '' },
    { name: 'Andrea', color: 'yellow', avatar: '' },
  ]);
  const [currentReader, setCurrentReader] = useState(readers[0].name);

  const [sagas, setSagas] = useState([]);
  const [series, setSeries] = useState([]);
  const [newSaga, setNewSaga] = useState('');
  const [newSeries, setNewSeries] = useState('');

  // AGGIUNGI SAGHE
  const addSaga = () => {
    if (newSaga.trim()) {
      setSagas([...sagas, { name: newSaga, favoriteBy: [] }]);
      setNewSaga('');
    }
  };

  // AGGIUNGI SERIE
  const addSeries = () => {
    if (!newSeries.trim()) return;
    setSeries([...series, {
      name: newSeries,
      saga: null,
      status: 'in corso',
      authors: [],
      publisher: '',
      orderIndex: series.length,
      volumes: [],
      cover: '',
      favoriteBy: [],
    }]);
    setNewSeries('');
  };

  // AGGIUNGI VOLUMI
  const addVolume = (sIndex) => {
    const volNum = prompt('Numero volume singolo o intervallo (es. 1 o 3-7)');
    if (!volNum) return;
    const updated = [...series];
    if (volNum.includes('-')) {
      const [start, end] = volNum.split('-').map(Number);
      for (let i = Math.min(start,end); i <= Math.max(start,end); i++) {
        if (!updated[sIndex].volumes.find(v=>v.number===i))
          updated[sIndex].volumes.push({ number: i, read: {}, isLast: false });
      }
    } else {
      const n = Number(volNum);
      if (!updated[sIndex].volumes.find(v=>v.number===n))
        updated[sIndex].volumes.push({ number: n, read: {}, isLast: false });
    }
    setSeries(updated);
  };

  // TOGGLE LETTURA
  const toggleRead = (sIndex, vIndex) => {
    const updated = [...series];
    const vol = updated[sIndex].volumes[vIndex];
    vol.read[currentReader] = !vol.read[currentReader];
    setSeries(updated);
  };

  // SEGNA TUTTI LETTI
  const markAllRead = (sIndex) => {
    const updated = [...series];
    updated[sIndex].volumes.forEach(v=>v.read[currentReader]=true);
    setSeries(updated);
  };

  // CUORI SERIE/SAGA
  const toggleFavoriteSeries = (sIndex) => {
    const updated = [...series];
    const favIndex = updated[sIndex].favoriteBy.indexOf(currentReader);
    if(favIndex===-1) updated[sIndex].favoriteBy.push(currentReader);
    else updated[sIndex].favoriteBy.splice(favIndex,1);
    setSeries(updated);
  };

  const toggleFavoriteSaga = (sIndex) => {
    const updated = [...sagas];
    const favIndex = updated[sIndex].favoriteBy.indexOf(currentReader);
    if(favIndex===-1) updated[sIndex].favoriteBy.push(currentReader);
    else updated[sIndex].favoriteBy.splice(favIndex,1);
    setSagas(updated);
  };

  // FLAG ULTIMO VOLUME
  const toggleLastVolume = (sIndex,vIndex)=>{
    const updated = [...series];
    updated[sIndex].volumes.forEach(v=>v.isLast=false);
    updated[sIndex].volumes[vIndex].isLast = true;
    updated[sIndex].status = 'finita';
    setSeries(updated);
  };

  const lastVolumeNumber = (s)=>s.volumes.length?Math.max(...s.volumes.map(v=>v.number)):0;

  // DRAG & DROP SERIE
  const onDragEnd = (result) => {
    if(!result.destination) return;
    const items = Array.from(series);
    const [reordered] = items.splice(result.source.index,1);
    items.splice(result.destination.index,0,reordered);
    setSeries(items);
  };

  return (
    <div className='p-4 max-w-6xl mx-auto space-y-4'>
      <h1 className='text-3xl font-bold'>MangaNest</h1>

      <div className='flex gap-2'>
        <Input placeholder='Nuova saga' value={newSaga} onChange={e=>setNewSaga(e.target.value)}/>
        <Button onClick={addSaga}>+ Saga</Button>
      </div>

      <div className='flex gap-2'>
        <Input placeholder='Nuova serie' value={newSeries} onChange={e=>setNewSeries(e.target.value)}/>
        <Button onClick={addSeries}>+ Serie</Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId='series'>
          {(provided)=>(
            <div {...provided.droppableProps} ref={provided.innerRef} className='space-y-2'>
              {series.map((s,sIndex)=>(
                <Draggable key={sIndex} draggableId={s.name+sIndex} index={sIndex}>
                  {(provided)=>(
                    <Card ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      <CardContent className='space-y-2'>
                        <div className='flex justify-between items-center gap-2'>
                          <h2 className='text-xl font-semibold'>{s.name} {s.favoriteBy.includes(currentReader)?'❤️':''}</h2>
                          <div className='flex gap-2'>
                            <Button size='sm' onClick={()=>markAllRead(sIndex)}>Segna tutta letta</Button>
                            <Button size='sm' onClick={()=>addVolume(sIndex)}>+ Volume/i</Button>
                            <Button size='sm' onClick={()=>toggleFavoriteSeries(sIndex)}>❤️ Serie</Button>
                          </div>
                        </div>
                        <div className='flex gap-2 items-center'>
                          <span>Stato: {s.status}</span>
                          <span>Editore: {s.publisher}</span>
                          <span>Autori: {s.authors.join(', ')}</span>
                        </div>
                        {s.volumes.length===0 && <p className='text-sm text-muted-foreground'>Nessun volume inserito</p>}
                        {s.volumes.map((v,vIndex)=>(
                          <div key={vIndex} className='flex items-center justify-between border rounded-xl p-2'>
                            <span>Volume {v.number}{v.isLast?' (Ultimo)':''}</span>
                            <div className='flex gap-4 items-center'>
                              <label className='flex items-center gap-1'>
                                <Checkbox checked={v.read[currentReader]||false} onCheckedChange={()=>toggleRead(sIndex,vIndex)} /> {currentReader}
                              </label>
                              <Button size='sm' onClick={()=>toggleLastVolume(sIndex,vIndex)}>Ultimo</Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Card>
        <CardContent>
          <h2 className='text-xl font-semibold'>🏪 Volumi mancanti</h2>
          {series.map(s=>{
            const missing = s.volumes.filter(v=>!v.read[readers[0].name] || !v.read[readers[1].name]);
            if(missing.length===0) return null;
            return (<div key={s.name} className='mb-2'>
              <strong>{s.name}</strong>: {missing.map(v=>v.number).join(', ')} (ultimo volume registrato: {lastVolumeNumber(s)})
            </div>);
          })}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Button onClick={()=>{
            const csv = series.map(s=>s.volumes.map(v=>`${s.name},${v.number},${Object.keys(v.read).filter(r=>v.read[r]).join('|')},${s.status},${s.authors.join('|')},${s.publisher},${v.isLast}`).join('\n')).join('\n');
            const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download','manga_backup.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}>📦 Backup CSV</Button>
        </CardContent>
      </Card>
    </div>
  );
}
