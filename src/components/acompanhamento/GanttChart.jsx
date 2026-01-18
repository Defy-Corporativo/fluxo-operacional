import React from 'react';
import { Flag, CheckSquare, AlertTriangle } from 'lucide-react';
import styles from './Acompanhamento.module.css';

const GanttChart = ({ objetivos, tarefas }) => {
    // Calcular datas mínima e máxima para o range do gráfico
    const allDates = [
        ...objetivos.map(o => o.data_inicio).filter(Boolean),
        ...objetivos.map(o => o.data_expectativa).filter(Boolean),
        ...tarefas.map(t => t.data_inicio).filter(Boolean),
        ...tarefas.map(t => t.data_expectativa).filter(Boolean)
    ].map(d => new Date(d));

    const today = new Date();
    const minDate = allDates.length > 0 ? new Date(Math.min(...allDates, today)) : today;
    const maxDate = allDates.length > 0 ? new Date(Math.max(...allDates, today)) : today;

    // Adicionar margem de 7 dias em cada lado
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 14);

    const totalDays = Math.max(1, Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)));

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    };

    const getBarPosition = (startDate, endDate) => {
        // Retorna null se não tiver ambas as datas
        if (!startDate || !endDate) return null;

        const start = new Date(startDate);
        const end = new Date(endDate);

        const startOffset = Math.max(0, (start - minDate) / (1000 * 60 * 60 * 24));
        const endOffset = Math.max(0, (end - minDate) / (1000 * 60 * 60 * 24));

        return {
            left: `${(startOffset / totalDays) * 100}%`,
            width: `${Math.max(2, ((endOffset - startOffset) / totalDays) * 100)}%`
        };
    };

    const getTodayPosition = () => {
        const offset = (today - minDate) / (1000 * 60 * 60 * 24);
        return `${(offset / totalDays) * 100}%`;
    };

    const isOverdue = (tarefa) => {
        if (tarefa.concluida) return false;
        if (!tarefa.data_expectativa) return false;
        return new Date(tarefa.data_expectativa) < today;
    };

    const tarefaExceedsObjetivo = (tarefa, objetivo) => {
        if (!objetivo?.data_expectativa || !tarefa.data_expectativa) return false;
        return new Date(tarefa.data_expectativa) > new Date(objetivo.data_expectativa);
    };

    // Gerar labels do eixo de tempo
    const timeLabels = [];
    const labelInterval = Math.max(1, Math.floor(totalDays / 6));
    for (let i = 0; i <= totalDays; i += labelInterval) {
        const date = new Date(minDate);
        date.setDate(date.getDate() + i);
        timeLabels.push({
            position: `${(i / totalDays) * 100}%`,
            label: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        });
    }

    if (objetivos.length === 0) {
        return (
            <div className={styles.ganttEmpty}>
                <p>Nenhum objetivo encontrado para este projeto.</p>
            </div>
        );
    }

    const todayPos = getTodayPosition();

    return (
        <div className={styles.ganttContainer}>
            {/* Legenda */}
            <div className={styles.ganttLegend}>
                <span className={styles.legendItem}>
                    <span className={`${styles.legendColor} ${styles.objetivo}`}></span>
                    Objetivo
                </span>
                <span className={styles.legendItem}>
                    <span className={`${styles.legendColor} ${styles.pendente}`}></span>
                    Pendente
                </span>
                <span className={styles.legendItem}>
                    <span className={`${styles.legendColor} ${styles.concluida}`}></span>
                    Concluída
                </span>
                <span className={styles.legendItem}>
                    <span className={`${styles.legendColor} ${styles.atrasada}`}></span>
                    Atrasada
                </span>
                <span className={styles.legendItem}>
                    <span className={`${styles.legendColor} ${styles.excede}`}></span>
                    Excede Objetivo
                </span>
            </div>

            {/* Header com eixo de tempo */}
            <div className={styles.ganttHeader}>
                <div className={styles.ganttLabelHeader}></div>
                <div className={styles.ganttTimeAxisWrapper}>
                    <div className={styles.ganttTimeAxis}>
                        {timeLabels.map((label, index) => (
                            <span
                                key={index}
                                className={styles.timeLabel}
                                style={{ left: label.position }}
                            >
                                {label.label}
                            </span>
                        ))}
                        {/* Marcador de hoje no header */}
                        <div
                            className={styles.todayMarker}
                            style={{ left: todayPos }}
                        >
                            Hoje
                        </div>
                    </div>
                </div>
            </div>

            {/* Gantt Chart */}
            <div className={styles.ganttChart}>
                {/* Coluna de labels */}
                <div className={styles.ganttLabelsColumn}>
                    {objetivos.map(objetivo => {
                        const tarefasDoObjetivo = tarefas.filter(t => t.objetivo_id === objetivo.id);
                        return (
                            <div key={objetivo.id} className={styles.ganttGroup}>
                                <div className={styles.ganttLabelRow}>
                                    <Flag size={14} className={styles.ganttIcon} />
                                    <span className={styles.ganttLabelText}>{objetivo.titulo || objetivo.descricao}</span>
                                </div>
                                {tarefasDoObjetivo.map(tarefa => {
                                    const exceeds = tarefaExceedsObjetivo(tarefa, objetivo);
                                    return (
                                        <div key={tarefa.id} className={`${styles.ganttLabelRow} ${styles.tarefaLabelRow}`}>
                                            <CheckSquare size={12} className={styles.ganttIcon} />
                                            <span className={styles.ganttLabelText}>
                                                {tarefa.titulo || tarefa.descricao}
                                                {exceeds && !tarefa.concluida && (
                                                    <AlertTriangle size={12} className={styles.alertIcon} title="Ultrapassa data do objetivo" />
                                                )}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>

                {/* Coluna de barras com linha única de hoje */}
                <div className={styles.ganttBarsColumn}>
                    {/* Linha única de hoje atravessando todo o gráfico */}
                    <div className={styles.todayLineGlobal} style={{ left: todayPos }} />

                    {objetivos.map(objetivo => {
                        const tarefasDoObjetivo = tarefas.filter(t => t.objetivo_id === objetivo.id);
                        const objetivoBar = getBarPosition(objetivo.data_inicio, objetivo.data_expectativa);

                        return (
                            <div key={objetivo.id} className={styles.ganttBarsGroup}>
                                {/* Barra do objetivo */}
                                <div className={styles.ganttBarRow}>
                                    {objetivoBar && (
                                        <div
                                            className={`${styles.ganttBar} ${styles.objetivoBar}`}
                                            style={objetivoBar}
                                            title={`${objetivo.codigo}: ${formatDate(objetivo.data_inicio)} - ${formatDate(objetivo.data_expectativa)}`}
                                        >
                                            <span className={styles.barDate}>
                                                {formatDate(objetivo.data_inicio)} - {formatDate(objetivo.data_expectativa)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Barras das tarefas */}
                                {tarefasDoObjetivo.map(tarefa => {
                                    const bar = getBarPosition(tarefa.data_inicio, tarefa.data_expectativa);
                                    const overdue = isOverdue(tarefa);
                                    const exceeds = tarefaExceedsObjetivo(tarefa, objetivo);

                                    let barClass = styles.tarefaBar;
                                    if (tarefa.concluida) barClass += ` ${styles.concluida}`;
                                    else if (overdue) barClass += ` ${styles.atrasada}`;
                                    else barClass += ` ${styles.pendente}`;

                                    if (exceeds && !tarefa.concluida) barClass += ` ${styles.excede}`;

                                    return (
                                        <div key={tarefa.id} className={`${styles.ganttBarRow} ${styles.tarefaBarRow}`}>
                                            {bar && (
                                                <div
                                                    className={barClass}
                                                    style={bar}
                                                    title={`${tarefa.titulo || tarefa.descricao}: ${formatDate(tarefa.data_inicio)} - ${formatDate(tarefa.data_expectativa)} (${tarefa.concluida ? 'Concluída' : (overdue ? 'Atrasada' : 'Pendente')}${exceeds ? ' - Ultrapassa objetivo' : ''})`}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default GanttChart;
