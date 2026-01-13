import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Target, FolderKanban, BarChart3, Calendar } from 'lucide-react';
import frentesService from '../../services/frentesService';
import projetosService from '../../services/projetosService';
import objetivosService from '../../services/objetivosService';
import tarefasService from '../../services/tarefasService';
import GanttChart from './GanttChart';
import ChartsPanel from './ChartsPanel';
import styles from './Acompanhamento.module.css';

const Acompanhamento = () => {
    const [frentes, setFrentes] = useState([]);
    const [projetos, setProjetos] = useState([]);
    const [selectedFrenteId, setSelectedFrenteId] = useState('');
    const [selectedProjetoId, setSelectedProjetoId] = useState('');
    const [objetivos, setObjetivos] = useState([]);
    const [tarefas, setTarefas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('gantt');

    // Load frentes on mount
    useEffect(() => {
        loadFrentes();
    }, []);

    // Load projetos when frente changes
    useEffect(() => {
        if (selectedFrenteId) {
            loadProjetos(selectedFrenteId);
        } else {
            setProjetos([]);
            setSelectedProjetoId('');
        }
    }, [selectedFrenteId]);

    // Load objetivos e tarefas when projeto changes
    useEffect(() => {
        if (selectedProjetoId) {
            loadProjetoData(selectedProjetoId);
        } else {
            setObjetivos([]);
            setTarefas([]);
        }
    }, [selectedProjetoId]);

    const loadFrentes = async () => {
        try {
            const data = await frentesService.getAll();
            setFrentes(data || []);
        } catch (error) {
            console.error('Erro ao carregar frentes:', error);
        }
    };

    const loadProjetos = async (frenteId) => {
        try {
            const data = await projetosService.getByFrente(frenteId);
            setProjetos(data || []);
        } catch (error) {
            console.error('Erro ao carregar projetos:', error);
        }
    };

    const loadProjetoData = async (projetoId) => {
        setLoading(true);
        try {
            // Carregar objetivos do projeto
            const objetivosData = await objetivosService.getByProjeto(projetoId);
            setObjetivos(objetivosData || []);

            // Carregar tarefas de cada objetivo
            const allTarefas = [];
            for (const obj of (objetivosData || [])) {
                const tarefasObj = await tarefasService.getByObjetivo(obj.id);
                allTarefas.push(...(tarefasObj || []).map(t => ({ ...t, objetivo: obj })));
            }
            setTarefas(allTarefas);
        } catch (error) {
            console.error('Erro ao carregar dados do projeto:', error);
        } finally {
            setLoading(false);
        }
    };

    // Dados processados para os gráficos
    const chartData = useMemo(() => {
        const concluidas = tarefas.filter(t => t.concluida).length;
        const pendentes = tarefas.filter(t => !t.concluida).length;
        const atrasadas = tarefas.filter(t => {
            if (t.concluida) return false;
            if (!t.data_expectativa) return false;
            return new Date(t.data_expectativa) < new Date();
        }).length;

        // Por objetivo
        const porObjetivo = objetivos.map(obj => {
            const tarefasObj = tarefas.filter(t => t.objetivo_id === obj.id);
            return {
                nome: obj.codigo,
                descricao: obj.descricao,
                total: tarefasObj.length,
                concluidas: tarefasObj.filter(t => t.concluida).length,
                pendentes: tarefasObj.filter(t => !t.concluida).length
            };
        });

        return {
            total: tarefas.length,
            concluidas,
            pendentes,
            atrasadas,
            porcentagemConcluida: tarefas.length > 0 ? Math.round((concluidas / tarefas.length) * 100) : 0,
            porObjetivo
        };
    }, [objetivos, tarefas]);

    const selectedProjeto = projetos.find(p => p.id === selectedProjetoId);
    const selectedFrente = frentes.find(f => f.id === selectedFrenteId);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    <TrendingUp size={28} />
                    Acompanhamento
                </h1>
            </div>

            {/* Seleção de Frente e Projeto */}
            <div className={styles.filterSection}>
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>
                        <Target size={16} />
                        Frente Estratégica
                    </label>
                    <select
                        className={styles.filterSelect}
                        value={selectedFrenteId}
                        onChange={(e) => setSelectedFrenteId(e.target.value)}
                    >
                        <option value="">Selecione uma frente...</option>
                        {frentes.map(frente => (
                            <option key={frente.id} value={frente.id}>
                                {frente.codigo} - {frente.descricao}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>
                        <FolderKanban size={16} />
                        Projeto
                    </label>
                    <select
                        className={styles.filterSelect}
                        value={selectedProjetoId}
                        onChange={(e) => setSelectedProjetoId(e.target.value)}
                        disabled={!selectedFrenteId}
                    >
                        <option value="">Selecione um projeto...</option>
                        {projetos.map(projeto => (
                            <option key={projeto.id} value={projeto.id}>
                                {projeto.codigo} - {projeto.descricao}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Conteúdo principal */}
            {selectedProjetoId ? (
                loading ? (
                    <div className={styles.loading}>Carregando dados do projeto...</div>
                ) : (
                    <>
                        {/* Info do projeto selecionado */}
                        <div className={styles.projectInfo}>
                            <span className={styles.projectBadge}>{selectedProjeto?.codigo}</span>
                            <span className={styles.projectName}>{selectedProjeto?.descricao}</span>
                        </div>

                        {/* Abas */}
                        <div className={styles.tabs}>
                            <button
                                className={`${styles.tab} ${activeTab === 'gantt' ? styles.active : ''}`}
                                onClick={() => setActiveTab('gantt')}
                            >
                                <Calendar size={18} />
                                Gantt
                            </button>
                            <button
                                className={`${styles.tab} ${activeTab === 'graficos' ? styles.active : ''}`}
                                onClick={() => setActiveTab('graficos')}
                            >
                                <BarChart3 size={18} />
                                Gráficos
                            </button>
                        </div>

                        {/* Conteúdo das abas */}
                        <div className={styles.tabContent}>
                            {activeTab === 'gantt' ? (
                                <GanttChart objetivos={objetivos} tarefas={tarefas} />
                            ) : (
                                <ChartsPanel data={chartData} objetivos={objetivos} tarefas={tarefas} />
                            )}
                        </div>
                    </>
                )
            ) : (
                <div className={styles.emptyState}>
                    <TrendingUp size={48} className={styles.emptyIcon} />
                    <h2 className={styles.emptyTitle}>Selecione um projeto para acompanhar</h2>
                    <p className={styles.emptyDescription}>
                        Escolha uma frente estratégica e um projeto para visualizar o cronograma Gantt e os gráficos de acompanhamento.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Acompanhamento;
