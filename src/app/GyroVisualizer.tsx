"use client";

import { useRef, FC } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

// Define la estructura de los datos del giroscopio que el componente espera
interface GyroData {
  gx: number;
  gy: number;
  gz: number;
}

interface VisualizerProps {
  gyroData: GyroData;
}

// Componente interno que representa el Cubo que rota
const RotatingBox: FC<VisualizerProps> = ({ gyroData }) => {
  const meshRef = useRef<Mesh>(null!);

  // useFrame se ejecuta en cada frame de la animación (usualmente 60 veces por segundo)
  useFrame((state, delta) => {
    // El giroscopio mide velocidad angular (radianes por segundo).
    // Para obtener la nueva rotación, integramos esta velocidad en el tiempo.
    // Multiplicamos por 'delta' (tiempo desde el último frame) para que la
    // rotación sea suave e independiente de los fotogramas por segundo.
    if (meshRef.current) {
      // Mapeamos los ejes del sensor a los ejes de rotación del objeto 3D.
      // A veces es necesario ajustar el signo (-gy) o el orden de los ejes
      // para que la rotación en pantalla coincida con el movimiento real.
      meshRef.current.rotation.x += gyroData.gy * delta;
      meshRef.current.rotation.y += gyroData.gx * delta;
      meshRef.current.rotation.z += gyroData.gz * delta;
    }
  });

  return (
    // Define la malla 3D (nuestro cubo)
    <mesh ref={meshRef} scale={1.5}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={'#22d3ee'} wireframe />
    </mesh>
  );
};

// Componente principal que se exporta y se usa en la página
const GyroVisualizer: FC<VisualizerProps> = ({ gyroData }) => {
  return (
    // El Canvas es donde se renderiza la escena 3D
    <Canvas>
      {/* Añadimos luces para que el objeto sea visible */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <RotatingBox gyroData={gyroData} />
    </Canvas>
  );
};

export default GyroVisualizer;