"use client";

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import styles from './HomePage.module.css';
import GyroVisualizer from './GyroVisualizer';
import { Wifi, XCircle, CheckCircle2, Send, Trash2 } from 'lucide-react';

interface SensorData {
  ax: number; ay: number; az: number;
  gx: number; gy: number; gz: number;
}

const PI_SERVER_URL = process.env.NEXT_PUBLIC_PI_SERVER_URL;

export default function HomePage() {
  const [data, setData] = useState<SensorData>({ ax: 0, ay: 0, az: 0, gx: 0, gy: 0, gz: 0 });
  const [status, setStatus] = useState<'conectado' | 'desconectado' | 'conectando' | 'error'>('desconectado');
  const socketRef = useRef<Socket | null>(null);
  
  const [lcdText, setLcdText] = useState<string>('Proyecto OK!');
  const [targetScreen, setTargetScreen] = useState<number>(1);
  const [targetLine, setTargetLine] = useState<number>(0);

  useEffect(() => {
    if (!PI_SERVER_URL) { setStatus('error'); return; }
    
    const socket = io(PI_SERVER_URL, { transports: ['websocket'] });
    socketRef.current = socket;
    setStatus('conectando');

    socket.on('connect', () => setStatus('conectado'));
    socket.on('disconnect', () => setStatus('desconectado'));
    socket.on('connect_error', () => setStatus("error"));

    socket.on('sensor_update', (newData: SensorData) => {
      setData(newData);
    });
    
    return () => { socket.disconnect(); socketRef.current = null; };
  }, []);

  const handleSendTextToLcd = () => {
    if (socketRef.current) {
      socketRef.current.emit('update_lcd', { screen: targetScreen, line: targetLine, text: lcdText });
    }
  };

  const handleClearLcds = () => {
    if (socketRef.current) {
      socketRef.current.emit('clear_lcds', { screen: 'all' });
    }
  };

  const StatusIndicator = () => {
    let text = "Conectando...";
    let style = styles.statusConnecting;
    let Icon = <Wifi size={20} className={styles.iconPulse} />;

    if (status === 'conectado') {
        text = "Conectado";
        style = styles.statusOnline;
        Icon = <CheckCircle2 size={20} />;
    } else if (status === 'desconectado') {
        text = "Desconectado";
        style = styles.statusOffline;
        Icon = <XCircle size={20} />;
    } else if (status === 'error') {
        text = "Error de Conexión";
        style = styles.statusOffline;
        Icon = <XCircle size={20} />;
    }
    return <div className={`${styles.statusPill} ${style}`}>{Icon}<span>{text}</span></div>;
  };
  
  const DataCard = ({ axis, value, unit }: { axis: string; value: number; unit: string }) => (
    <div className={styles.card}>
      <p className={styles.cardTitle}>{axis}</p>
      <p className={styles.cardValue}>{value.toFixed(2)}</p>
      <p className={styles.cardUnit}>{unit}</p>
    </div>
  );

  return (
    <div className={styles.mainContainer}>
      <div className={styles.contentWrapper}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Entrega 2 de Proyecto AC</h1>
          </div>
          <StatusIndicator />
        </header>

        <section className={`${styles.card} ${styles.controlPanel}`}>
            <h2 className={styles.controlPanelTitle}>Panel de Control LCD</h2>
            <div className={styles.controlGrid}>
                <div className={styles.inputGroup}>
                    <input 
                        type="text"
                        value={lcdText}
                        onChange={(e) => setLcdText(e.target.value)}
                        maxLength={16}
                        className={styles.textInput}
                        placeholder="Texto para LCD (max 16)"
                    />
                    <div className={styles.selectGroup}>
                        <select value={targetScreen} onChange={(e) => setTargetScreen(Number(e.target.value))} className={styles.selectInput}>
                            <option value={1}>Pantalla 1</option>
                            <option value={2}>Pantalla 2</option>
                        </select>
                        <select value={targetLine} onChange={(e) => setTargetLine(Number(e.target.value))} className={styles.selectInput}>
                            <option value={0}>Línea 1</option>
                            <option value={1}>Línea 2</option>
                        </select>
                    </div>
                </div>
                <div className={styles.buttonGroup}>
                    <button onClick={handleSendTextToLcd} className={`${styles.button} ${styles.buttonPrimary}`} disabled={status !== 'conectado'}>
                        <Send size={18}/> Enviar Texto
                    </button>
                    <button onClick={handleClearLcds} className={`${styles.button} ${styles.buttonSecondary}`} disabled={status !== 'conectado'}>
                        <Trash2 size={18}/> Limpiar
                    </button>
                </div>
            </div>
        </section><br/>

        <main>
          <div className={`${styles.card} ${styles.visualizerContainer}`}>
             <GyroVisualizer gyroData={{ gx: data.gx, gy: data.gy, gz: data.gz }} />
          </div>
          
          <div className={styles.mainGrid}>
            <DataCard axis="Acel X" value={data.ax} unit="m/s²" />
            <DataCard axis="Acel Y" value={data.ay} unit="m/s²" />
            <DataCard axis="Acel Z" value={data.az} unit="m/s²" />
            <DataCard axis="Giro X" value={data.gx} unit="rad/s" />
            <DataCard axis="Giro Y" value={data.gy} unit="rad/s" />
            <DataCard axis="Giro Z" value={data.gz} unit="rad/s" />
          </div>
        </main>

      </div>
    </div>
  );
}