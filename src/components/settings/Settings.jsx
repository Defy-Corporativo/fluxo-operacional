import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check, X, Users, Target, Download, FileSpreadsheet } from 'lucide-react';
import responsaveisService from '../../services/responsaveisService';
import frentesService from '../../services/frentesService';
import tarefasService from '../../services/tarefasService';
import projetosService from '../../services/projetosService';
import objetivosService from '../../services/objetivosService';
import styles from './Settings.module.css';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('frentes');

    // Estados para Responsáveis
    const [responsaveis, setResponsaveis] = useState([]);
    const [loadingResp, setLoadingResp] = useState(true);
    const [newNomeResp, setNewNomeResp] = useState('');
    const [editingIdResp, setEditingIdResp] = useState(null);
    const [editingNomeResp, setEditingNomeResp] = useState('');
    const [savingResp, setSavingResp] = useState(false);

    // Estados para Frentes
    const [frentes, setFrentes] = useState([]);
    const [loadingFrentes, setLoadingFrentes] = useState(true);
    const [newDescricaoFrente, setNewDescricaoFrente] = useState('');
    const [editingIdFrente, setEditingIdFrente] = useState(null);
    const [editingDescricaoFrente, setEditingDescricaoFrente] = useState('');
    const [savingFrente, setSavingFrente] = useState(false);

    // Estados para Exportação
    const [separator, setSeparator] = useState(';');
    const [exporting, setExporting] = useState(false);

    // Carregar dados
    useEffect(() => {
        loadResponsaveis();
        loadFrentes();
    }, []);

    // ==================== RESPONSÁVEIS ====================
    const loadResponsaveis = async () => {
        try {
            setLoadingResp(true);
            const data = await responsaveisService.getAll();
            setResponsaveis(data || []);
        } catch (error) {
            console.error('Erro ao carregar responsáveis:', error);
        } finally {
            setLoadingResp(false);
        }
    };

    const handleAddResp = async () => {
        if (!newNomeResp.trim() || savingResp) return;
        try {
            setSavingResp(true);
            const created = await responsaveisService.create(newNomeResp.trim());
            setResponsaveis([...responsaveis, created]);
            setNewNomeResp('');
        } catch (error) {
            console.error('Erro ao adicionar responsável:', error);
            alert('Erro ao adicionar responsável');
        } finally {
            setSavingResp(false);
        }
    };

    const startEditResp = (id, nome) => {
        setEditingIdResp(id);
        setEditingNomeResp(nome);
    };

    const cancelEditResp = () => {
        setEditingIdResp(null);
        setEditingNomeResp('');
    };

    const handleUpdateResp = async () => {
        if (!editingNomeResp.trim() || savingResp) return;
        try {
            setSavingResp(true);
            const updated = await responsaveisService.update(editingIdResp, editingNomeResp.trim());
            setResponsaveis(responsaveis.map(r => r.id === editingIdResp ? updated : r));
            cancelEditResp();
        } catch (error) {
            console.error('Erro ao atualizar responsável:', error);
            alert('Erro ao atualizar responsável');
        } finally {
            setSavingResp(false);
        }
    };

    const handleDeleteResp = async (id) => {
        if (!confirm('Deseja realmente excluir este responsável?')) return;
        try {
            await responsaveisService.remove(id);
            setResponsaveis(responsaveis.filter(r => r.id !== id));
        } catch (error) {
            console.error('Erro ao excluir responsável:', error);
            alert('Erro ao excluir responsável');
        }
    };

    // ==================== FRENTES ====================
    const loadFrentes = async () => {
        try {
            setLoadingFrentes(true);
            const data = await frentesService.getAll();
            setFrentes(data || []);
        } catch (error) {
            console.error('Erro ao carregar frentes:', error);
        } finally {
            setLoadingFrentes(false);
        }
    };

    const handleAddFrente = async () => {
        if (!newDescricaoFrente.trim() || savingFrente) return;
        try {
            setSavingFrente(true);
            const created = await frentesService.create(newDescricaoFrente.trim());
            setFrentes([...frentes, created]);
            setNewDescricaoFrente('');
        } catch (error) {
            console.error('Erro ao adicionar frente:', error);
            alert('Erro ao adicionar frente estratégica');
        } finally {
            setSavingFrente(false);
        }
    };

    const startEditFrente = (id, descricao) => {
        setEditingIdFrente(id);
        setEditingDescricaoFrente(descricao);
    };

    const cancelEditFrente = () => {
        setEditingIdFrente(null);
        setEditingDescricaoFrente('');
    };

    const handleUpdateFrente = async () => {
        if (!editingDescricaoFrente.trim() || savingFrente) return;
        try {
            setSavingFrente(true);
            const updated = await frentesService.update(editingIdFrente, editingDescricaoFrente.trim());
            setFrentes(frentes.map(f => f.id === editingIdFrente ? updated : f));
            cancelEditFrente();
        } catch (error) {
            console.error('Erro ao atualizar frente:', error);
            alert('Erro ao atualizar frente estratégica');
        } finally {
            setSavingFrente(false);
        }
    };

    const handleDeleteFrente = async (id) => {
        if (!confirm('Deseja realmente excluir esta frente estratégica? Todos os projetos, objetivos e tarefas vinculados serão excluídos.')) return;
        try {
            await frentesService.remove(id);
            setFrentes(frentes.filter(f => f.id !== id));
        } catch (error) {
            console.error('Erro ao excluir frente:', error);
            alert('Erro ao excluir frente estratégica');
        }
    };

    const handleKeyPress = (e, action) => {
        if (e.key === 'Enter') {
            action();
        }
    };

    // ==================== EXPORTAÇÃO CSV ====================
    const exportToCSV = async () => {
        try {
            setExporting(true);

            // Carregar todos os dados
            const [frentesData, projetosData, tarefasData] = await Promise.all([
                frentesService.getAll(),
                projetosService.getAll(),
                tarefasService.getAll()
            ]);

            // Criar mapa de frentes e projetos para lookup
            const frentesMap = {};
            (frentesData || []).forEach(f => {
                frentesMap[f.id] = f;
            });

            const projetosMap = {};
            (projetosData || []).forEach(p => {
                projetosMap[p.id] = p;
            });

            // Gerar linhas desnormalizadas
            const rows = [];

            // Header
            const headers = [
                'Frente Código',
                'Frente Descrição',
                'Projeto Código',
                'Projeto Descrição',
                'Objetivo Código',
                'Objetivo Descrição',
                'Tarefa Código',
                'Tarefa Descrição',
                'Responsável',
                'Data Expectativa',
                'Concluída'
            ];
            rows.push(headers.join(separator));

            // Dados
            (tarefasData || []).forEach(tarefa => {
                const objetivo = tarefa.objetivo || {};
                const projetoId = objetivo.projeto_id;
                const projeto = projetosMap[projetoId] || {};
                const frenteId = projeto.frente_id;
                const frente = frentesMap[frenteId] || {};

                const row = [
                    frente.codigo || '',
                    (frente.descricao || '').replace(/[\n\r]/g, ' '),
                    projeto.codigo || '',
                    (projeto.descricao || '').replace(/[\n\r]/g, ' '),
                    objetivo.codigo || '',
                    (objetivo.descricao || '').replace(/[\n\r]/g, ' '),
                    tarefa.codigo || '',
                    (tarefa.descricao || '').replace(/[\n\r]/g, ' '),
                    tarefa.responsavel || '',
                    tarefa.data_expectativa ? new Date(tarefa.data_expectativa).toLocaleDateString('pt-BR') : '',
                    tarefa.concluida ? 'Sim' : 'Não'
                ];

                // Escape separator in values
                const escapedRow = row.map(val => {
                    if (val.includes(separator) || val.includes('"')) {
                        return `"${val.replace(/"/g, '""')}"`;
                    }
                    return val;
                });

                rows.push(escapedRow.join(separator));
            });

            // Gerar arquivo
            const csvContent = '\uFEFF' + rows.join('\n'); // BOM for Excel UTF-8
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `fluxo_operacional_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            URL.revokeObjectURL(link.href);

            alert(`Exportados ${tarefasData.length} registros com sucesso!`);
        } catch (error) {
            console.error('Erro ao exportar:', error);
            alert('Erro ao exportar dados. Verifique o console para mais detalhes.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="container">
            <div className="page-header">
                <h1 className="page-title">Configurações</h1>
            </div>

            <div className={styles.settingsContent}>
                {/* Tabs */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'frentes' ? styles.active : ''}`}
                        onClick={() => setActiveTab('frentes')}
                    >
                        <Target size={16} style={{ marginRight: '6px' }} />
                        Frentes Estratégicas
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'responsaveis' ? styles.active : ''}`}
                        onClick={() => setActiveTab('responsaveis')}
                    >
                        <Users size={16} style={{ marginRight: '6px' }} />
                        Responsáveis
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'exportar' ? styles.active : ''}`}
                        onClick={() => setActiveTab('exportar')}
                    >
                        <Download size={16} style={{ marginRight: '6px' }} />
                        Exportar
                    </button>
                </div>

                {/* Tab Content: Frentes */}
                {activeTab === 'frentes' && (
                    <div className={styles.tabContent}>
                        <p className={styles.settingsDescription} style={{ marginBottom: '24px' }}>
                            Cadastre as Frentes Estratégicas do seu fluxo operacional.
                        </p>

                        {loadingFrentes ? (
                            <div className={styles.loading}>Carregando...</div>
                        ) : (
                            <>
                                <div className={styles.responsaveisList}>
                                    {frentes.length === 0 ? (
                                        <div className={styles.emptyState}>
                                            Nenhuma frente estratégica cadastrada
                                        </div>
                                    ) : (
                                        frentes.map(frente => (
                                            <div key={frente.id} className={styles.responsavelItem}>
                                                {editingIdFrente === frente.id ? (
                                                    <>
                                                        <input
                                                            type="text"
                                                            className={styles.editInput}
                                                            value={editingDescricaoFrente}
                                                            onChange={(e) => setEditingDescricaoFrente(e.target.value)}
                                                            onKeyPress={(e) => handleKeyPress(e, handleUpdateFrente)}
                                                            autoFocus
                                                        />
                                                        <div className={styles.responsavelActions}>
                                                            <button
                                                                className={styles.actionBtn}
                                                                onClick={handleUpdateFrente}
                                                                disabled={savingFrente}
                                                                title="Salvar"
                                                            >
                                                                <Check size={18} />
                                                            </button>
                                                            <button
                                                                className={styles.actionBtn}
                                                                onClick={cancelEditFrente}
                                                                title="Cancelar"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <span className={styles.codigoBadge}>{frente.codigo}</span>
                                                            <span className={styles.responsavelNome}>{frente.descricao}</span>
                                                        </div>
                                                        <div className={styles.responsavelActions}>
                                                            <button
                                                                className={styles.actionBtn}
                                                                onClick={() => startEditFrente(frente.id, frente.descricao)}
                                                                title="Editar"
                                                            >
                                                                <Pencil size={16} />
                                                            </button>
                                                            <button
                                                                className={`${styles.actionBtn} ${styles.delete}`}
                                                                onClick={() => handleDeleteFrente(frente.id)}
                                                                title="Excluir"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className={styles.addForm}>
                                    <input
                                        type="text"
                                        className={styles.addInput}
                                        placeholder="Descrição da frente estratégica"
                                        value={newDescricaoFrente}
                                        onChange={(e) => setNewDescricaoFrente(e.target.value)}
                                        onKeyPress={(e) => handleKeyPress(e, handleAddFrente)}
                                    />
                                    <button
                                        className={styles.addBtn}
                                        onClick={handleAddFrente}
                                        disabled={!newDescricaoFrente.trim() || savingFrente}
                                    >
                                        <Plus size={18} />
                                        Adicionar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Tab Content: Responsáveis */}
                {activeTab === 'responsaveis' && (
                    <div className={styles.tabContent}>
                        <p className={styles.settingsDescription} style={{ marginBottom: '24px' }}>
                            Cadastre os responsáveis que podem ser atribuídos a objetivos e tarefas.
                        </p>

                        {loadingResp ? (
                            <div className={styles.loading}>Carregando...</div>
                        ) : (
                            <>
                                <div className={styles.responsaveisList}>
                                    {responsaveis.length === 0 ? (
                                        <div className={styles.emptyState}>
                                            Nenhum responsável cadastrado
                                        </div>
                                    ) : (
                                        responsaveis.map(resp => (
                                            <div key={resp.id} className={styles.responsavelItem}>
                                                {editingIdResp === resp.id ? (
                                                    <>
                                                        <input
                                                            type="text"
                                                            className={styles.editInput}
                                                            value={editingNomeResp}
                                                            onChange={(e) => setEditingNomeResp(e.target.value)}
                                                            onKeyPress={(e) => handleKeyPress(e, handleUpdateResp)}
                                                            autoFocus
                                                        />
                                                        <div className={styles.responsavelActions}>
                                                            <button
                                                                className={styles.actionBtn}
                                                                onClick={handleUpdateResp}
                                                                disabled={savingResp}
                                                                title="Salvar"
                                                            >
                                                                <Check size={18} />
                                                            </button>
                                                            <button
                                                                className={styles.actionBtn}
                                                                onClick={cancelEditResp}
                                                                title="Cancelar"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className={styles.responsavelNome}>{resp.nome}</span>
                                                        <div className={styles.responsavelActions}>
                                                            <button
                                                                className={styles.actionBtn}
                                                                onClick={() => startEditResp(resp.id, resp.nome)}
                                                                title="Editar"
                                                            >
                                                                <Pencil size={16} />
                                                            </button>
                                                            <button
                                                                className={`${styles.actionBtn} ${styles.delete}`}
                                                                onClick={() => handleDeleteResp(resp.id)}
                                                                title="Excluir"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className={styles.addForm}>
                                    <input
                                        type="text"
                                        className={styles.addInput}
                                        placeholder="Nome do responsável"
                                        value={newNomeResp}
                                        onChange={(e) => setNewNomeResp(e.target.value)}
                                        onKeyPress={(e) => handleKeyPress(e, handleAddResp)}
                                    />
                                    <button
                                        className={styles.addBtn}
                                        onClick={handleAddResp}
                                        disabled={!newNomeResp.trim() || savingResp}
                                    >
                                        <Plus size={18} />
                                        Adicionar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Tab Content: Exportar */}
                {activeTab === 'exportar' && (
                    <div className={styles.tabContent}>
                        <p className={styles.settingsDescription} style={{ marginBottom: '24px' }}>
                            Exporte todos os dados do Fluxo Operacional para um arquivo CSV compatível com Excel.
                        </p>

                        <div className={styles.exportCard}>
                            <div className={styles.exportHeader}>
                                <FileSpreadsheet size={32} className={styles.exportIcon} />
                                <h3 className={styles.exportTitle}>Exportar Tarefas</h3>
                            </div>

                            <p className={styles.exportDescription}>
                                O arquivo exportado conterá todas as tarefas com informações completas:
                                Frente, Projeto, Objetivo, Tarefa, Responsável, Data e Status.
                            </p>

                            <div className={styles.separatorSelector}>
                                <label className={styles.separatorLabel}>
                                    Caractere separador:
                                </label>
                                <div className={styles.separatorOptions}>
                                    <label className={styles.radioLabel}>
                                        <input
                                            type="radio"
                                            name="separator"
                                            value=";"
                                            checked={separator === ';'}
                                            onChange={(e) => setSeparator(e.target.value)}
                                        />
                                        Ponto e vírgula (;)
                                    </label>
                                    <label className={styles.radioLabel}>
                                        <input
                                            type="radio"
                                            name="separator"
                                            value=","
                                            checked={separator === ','}
                                            onChange={(e) => setSeparator(e.target.value)}
                                        />
                                        Vírgula (,)
                                    </label>
                                    <label className={styles.radioLabel}>
                                        <input
                                            type="radio"
                                            name="separator"
                                            value="\t"
                                            checked={separator === '\t'}
                                            onChange={(e) => setSeparator(e.target.value)}
                                        />
                                        Tab
                                    </label>
                                </div>
                            </div>

                            <button
                                className={styles.exportBtn}
                                onClick={exportToCSV}
                                disabled={exporting}
                            >
                                <Download size={20} />
                                {exporting ? 'Exportando...' : 'Baixar CSV'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
