import React, { Suspense, useRef, useState, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Stage } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from 'three';

const MODEL_URL = "/models/brain_HILabs.glb";

const regionMap = {
  "Stillness_Prefrontal": { lab: "Lab of Stillness", display: "Prefrontal Cortex", fact: "Responsible for planning, attention, and self-control.", color: "#BEE6FF" },
  "Stillness_Cingulate": { lab: "Lab of Stillness", display: "Anterior Cingulate", fact: "Involved in attention and emotional regulation.", color: "#9FC9FF" },
  "Echoes_Temporal": { lab: "Lab of Echoes", display: "Temporal Lobe", fact: "Processes sounds and language-related signals.", color: "#FFE7AF" },
  "Echoes_AuditoryCortex": { lab: "Lab of Echoes", display: "Auditory Cortex", fact: "Primary area for hearing and auditory pattern recognition.", color: "#FFD27A" },
  "Motor_Primary": { lab: "Lab of Movement", display: "Primary Motor Cortex", fact: "Executes voluntary movements.", color: "#CFFFE6" },
  "Cerebellum": { lab: "Lab of Movement", display: "Cerebellum", fact: "Coordinates balance and fine motor control.", color: "#D9EEFF" },
  "Brainstem": { lab: "Core", display: "Brainstem", fact: "Controls vital functions like breathing and heart rate.", color: "#DADADA" }
};

function ProceduralFallback({ onHoverRegion, onClickRegion, hoveredName }){
  const group = useRef();
  useFrame((state, delta) => { if(group.current) group.current.rotation.y += delta * 0.05; });
  const keys = Object.keys(regionMap);
  const markers = keys.map((k,i)=>{ const phi = (i/keys.length) * Math.PI * 2; const x = Math.cos(phi) * 0.45; const y = Math.sin(phi) * 0.12; const z = Math.sin(phi * 1.3) * 0.25; return { name:k, pos:[x,y,z], color: regionMap[k].color }; });
  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[0.78,4]} />
        <meshStandardMaterial roughness={0.8} metalness={0.05} color={'#071022'} transparent opacity={0.9} />
      </mesh>
      {markers.map(m=> (
        <mesh key={m.name} position={m.pos} onPointerOver={(e)=>{e.stopPropagation(); onHoverRegion(m.name)}} onPointerOut={(e)=>{e.stopPropagation(); onHoverRegion(null)}} onClick={(e)=>{e.stopPropagation(); onClickRegion(m.name)}}>
          <sphereGeometry args={[0.06,16,16]} />
          <meshStandardMaterial emissive={m.color} emissiveIntensity={0.9} color={'#00121a'} />
        </mesh>
      ))}
    </group>
  );
}

function BrainModelGLB({ onHoverRegion, onClickRegion, hoveredName, setRegionObject }){
  const { scene, nodes } = useGLTF(MODEL_URL);
  const regionMeshes = useMemo(()=>{
    const list = [];
    Object.keys(nodes).forEach(k=>{ if(regionMap[k]) list.push({name:k, mesh: nodes[k]}); });
    return list;
  }, [nodes]);

  useEffect(()=>{
    if(!setRegionObject) return;
    const map = {};
    regionMeshes.forEach(r=>{ map[r.name] = r.mesh; });
    setRegionObject(map);
  }, [regionMeshes, setRegionObject]);

  return (
    <group dispose={null}>
      <primitive object={scene} />
      {regionMeshes.map(({name, mesh})=>{ const cfg = regionMap[name]; return (
        <mesh key={name} geometry={mesh.geometry} position={mesh.position} rotation={mesh.rotation} scale={mesh.scale} onPointerOver={(e)=>{e.stopPropagation(); onHoverRegion(name);}} onPointerOut={(e)=>{e.stopPropagation(); onHoverRegion(null);}} onClick={(e)=>{e.stopPropagation(); onClickRegion(name);}} castShadow receiveShadow>
          <meshStandardMaterial color={cfg.color} opacity={hoveredName===name?1:0.6} transparent roughness={0.4} metalness={0.05} emissive={hoveredName===name?cfg.color:'#000'} emissiveIntensity={hoveredName===name?0.6:0.0} />
        </mesh>
      ); })}
    </group>
  );
}

export default function HILabs3DBrainViewer(){
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [tourActive, setTourActive] = useState(false);
  const [regionObjects, setRegionObjects] = useState({});

  useEffect(()=>{ if(!tourActive) return; let idx=0; const keys=Object.keys(regionMap); const interval=setInterval(()=>{ setSelected(keys[idx]); idx=(idx+1)%keys.length; }, 3000); return ()=>clearInterval(interval); }, [tourActive]);

  function FocusController(){ const { camera } = useThree(); useFrame(()=>{ if(!selected || !regionObjects[selected]) return; const target = new THREE.Vector3(); regionObjects[selected].getWorldPosition(target); const desired = new THREE.Vector3(target.x + 0.6, target.y + 0.2, target.z + 1.0); camera.position.lerp(desired, 0.08); camera.lookAt(target); }); return null; }

  const onHoverRegion = useCallback((name)=> setHovered(name), []);
  const onClickRegion = useCallback((name)=> setSelected(name), []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-b from-[#020617] via-[#041029] to-[#061426] text-white">
      <div className="flex-1 h-[70vh] md:h-screen relative">
        <Canvas shadows camera={{ position: [0, 0.8, 2.5], fov: 40 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5,5,5]} intensity={0.5} />
          <Suspense fallback={<ProceduralFallback onHoverRegion={onHoverRegion} onClickRegion={onClickRegion} hoveredName={hovered}/> }>
            <Stage environment={null} intensity={0.7} adjustCamera={false} shadows={false}>
              <BrainModelGLB onHoverRegion={onHoverRegion} onClickRegion={onClickRegion} hoveredName={hovered} setRegionObject={setRegionObjects} />
            </Stage>
          </Suspense>
          <FocusController />
          <OrbitControls enablePan enableZoom enableRotate />
        </Canvas>
        <div className="absolute bottom-6 left-6 p-2 rounded-md bg-black/30 backdrop-blur text-xs">Click a region to zoom • Drag to rotate</div>
      </div>

      <aside className="w-full md:w-96 p-6 bg-gradient-to-t from-[#071226] to-[#04101a] border-l border-black/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-wide">HI Labs — Brain Explorer</h2>
            <p className="text-sm text-slate-300">Artistic Spiritual Aura — soft bloom highlights</p>
          </div>
          <div className="flex flex-col items-end">
            <button onClick={()=>setTourActive(s=>!s)} className={`px-3 py-1 rounded-md text-sm ${tourActive? 'bg-indigo-600 text-white':'bg-white/5 text-indigo-300'}`}>{tourActive? 'Stop Tour':'Start Tour'}</button>
            <button onClick={()=>{ setSelected(null); setHovered(null); }} className="mt-2 text-xs text-slate-400">Reset</button>
          </div>
        </div>

        <div className="space-y-3">
          {Object.keys(regionMap).map(key => { const r = regionMap[key]; const isSelected = selected===key; return (
            <motion.div key={key} layout initial={{opacity:0}} animate={{opacity:1}} whileHover={{scale:1.01}} className={`p-3 rounded-lg border ${isSelected? 'border-indigo-500 shadow-lg':'border-transparent'} flex items-start gap-3`} onClick={()=>setSelected(key)}>
              <div style={{width:14,height:14,background:r.color,borderRadius:4,marginTop:6}} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{r.display}</div>
                    <div className="text-xs text-slate-400">{r.lab}</div>
                  </div>
                  <div className="text-xs text-slate-400">{isSelected? 'Selected':''}</div>
                </div>
                <div className="text-sm text-slate-300 mt-2 line-clamp-3">{r.fact}</div>
              </div>
            </motion.div>
          ); })}
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:12}} className="mt-4 p-4 rounded-lg bg-gradient-to-r from-black/30 to-black/10 border">
              <h3 className="text-lg font-semibold">{regionMap[selected].display}</h3>
              <p className="text-sm text-slate-400 mt-1">{regionMap[selected].lab}</p>
              <p className="mt-3 text-sm text-slate-200">{regionMap[selected].fact}</p>
              <div className="mt-4 flex gap-2">
                <button className="px-3 py-2 rounded-md border text-sm">Learn more</button>
                <button className="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm" onClick={()=>navigator.clipboard&&navigator.clipboard.writeText(regionMap[selected].fact)}>Copy Fact</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 text-xs text-slate-400">Tips: The segmented GLB is included at <code>public/models/brain_HILabs.glb</code>. Replace it with higher-resolution atlas if needed.</div>
      </aside>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
