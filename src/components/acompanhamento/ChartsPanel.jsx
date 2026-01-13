import React from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    LineChart, Line, Area, AreaChart
} from 'recharts';
import { CheckCircle, Clock, AlertTriangle, Target } from 'lucide-react';
import styles from './Acompanhamento.module.css';

const COLORS = {
    concluida: '#059669',
    pendente: '#d97706',
    atrasada: '#dc2626',
    total: '#3b82f6'
};

const ChartsPanel = ({ data, objetivos, tarefas }) => {
    // Dados para o gráfico de progresso (donut)
    const progressData = [
        { name: 'Concluídas', value: data.concluidas, color: COLORS.concluida },
        { name: 'Pendentes', value: data.pendentes - data.atrasadas, color: COLORS.pendente },
        { name: 'Atrasadas', value: data.atrasadas, color: COLORS.atrasada }
    ].filter(d => d.value > 0);

    // Dados para o gráfico por objetivo
    const porObjetivoData = data.porObjetivo.map(obj => ({
        name: obj.nome,
        Concluídas: obj.concluidas,
        Pendentes: obj.pendentes
    }));

    // Dados para timeline (simulação de conclusões ao longo do tempo)
    const timelineData = generateTimelineData(tarefas);

    return (
        <div className={styles.chartsGrid}>
            {/* Big Numbers */}
            <div className={styles.bigNumbers}>
                <div className={`${styles.bigNumber} ${styles.total}`}>
                    <Target size={24} />
                    <div className={styles.bigNumberValue}>{data.total}</div>
                    <div className={styles.bigNumberLabel}>Total de Tarefas</div>
                </div>
                <div className={`${styles.bigNumber} ${styles.concluidas}`}>
                    <CheckCircle size={24} />
                    <div className={styles.bigNumberValue}>{data.concluidas}</div>
                    <div className={styles.bigNumberLabel}>Concluídas</div>
                </div>
                <div className={`${styles.bigNumber} ${styles.pendentes}`}>
                    <Clock size={24} />
                    <div className={styles.bigNumberValue}>{data.pendentes}</div>
                    <div className={styles.bigNumberLabel}>Pendentes</div>
                </div>
                <div className={`${styles.bigNumber} ${styles.atrasadas}`}>
                    <AlertTriangle size={24} />
                    <div className={styles.bigNumberValue}>{data.atrasadas}</div>
                    <div className={styles.bigNumberLabel}>Atrasadas</div>
                </div>
            </div>

            {/* Gráfico 1: Progresso Geral (Donut) */}
            <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Progresso Geral</h3>
                <div className={styles.chartContainer}>
                    {progressData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={progressData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {progressData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className={styles.noData}>Nenhuma tarefa para exibir</div>
                    )}
                </div>
                <div className={styles.chartFooter}>
                    <span className={styles.progressPercent}>{data.porcentagemConcluida}% concluído</span>
                </div>
            </div>

            {/* Gráfico 2: Por Objetivo (Barras Horizontais) */}
            <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Tarefas por Objetivo</h3>
                <div className={styles.chartContainer}>
                    {porObjetivoData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart
                                data={porObjetivoData}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={50} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Concluídas" stackId="a" fill={COLORS.concluida} />
                                <Bar dataKey="Pendentes" stackId="a" fill={COLORS.pendente} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className={styles.noData}>Nenhum objetivo para exibir</div>
                    )}
                </div>
            </div>

            {/* Gráfico 3: Timeline de Evolução */}
            <div className={`${styles.chartCard} ${styles.fullWidth}`}>
                <h3 className={styles.chartTitle}>Evolução do Projeto</h3>
                <div className={styles.chartContainer}>
                    {timelineData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="data" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="concluidas"
                                    name="Concluídas"
                                    stackId="1"
                                    stroke={COLORS.concluida}
                                    fill={COLORS.concluida}
                                    fillOpacity={0.6}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="pendentes"
                                    name="Pendentes"
                                    stackId="1"
                                    stroke={COLORS.pendente}
                                    fill={COLORS.pendente}
                                    fillOpacity={0.6}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className={styles.noData}>Dados insuficientes para timeline</div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Função auxiliar para gerar dados de timeline
const generateTimelineData = (tarefas) => {
    if (!tarefas || tarefas.length === 0) return [];

    // Agrupar tarefas por mês
    const months = {};
    const today = new Date();

    // Criar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);
        const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
        months[key] = { data: key, concluidas: 0, pendentes: 0 };
    }

    // Contar tarefas
    tarefas.forEach(tarefa => {
        const dataRef = tarefa.updated_at || tarefa.created_at;
        if (!dataRef) return;

        const date = new Date(dataRef);
        const key = `${date.getMonth() + 1}/${date.getFullYear()}`;

        if (months[key]) {
            if (tarefa.concluida) {
                months[key].concluidas++;
            } else {
                months[key].pendentes++;
            }
        }
    });

    return Object.values(months);
};

export default ChartsPanel;
