import { supabase } from './supabaseClient';

const TABLE_NAME = 'flop_tarefas';

/**
 * Busca todas as tarefas
 */
export const getAll = async () => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(`
            *,
            objetivo:flop_objetivos(id, codigo, descricao, projeto_id)
        `)
        .order('codigo', { ascending: true });

    if (error) throw error;
    return data;
};

/**
 * Busca tarefas por objetivo
 */
export const getByObjetivo = async (objetivoId) => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('objetivo_id', objetivoId)
        .order('ordem', { ascending: true });

    if (error) throw error;
    return data;
};

/**
 * Busca uma tarefa por ID
 */
export const getById = async (id) => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(`
            *,
            objetivo:flop_objetivos(id, codigo, titulo, descricao),
            notas:flop_notas(*)
        `)
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
};

/**
 * Cria uma nova tarefa (código gerado automaticamente pelo trigger)
 */
export const create = async ({ titulo, descricao, responsavel, data_inicio, data_expectativa, objetivo_id }) => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert({
            titulo,
            descricao,
            responsavel,
            data_inicio,
            data_expectativa,
            objetivo_id
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Atualiza uma tarefa
 */
export const update = async (id, { titulo, descricao, responsavel, data_inicio, data_expectativa, concluida, ordem }) => {
    const updateData = {};
    if (titulo !== undefined) updateData.titulo = titulo;
    if (descricao !== undefined) updateData.descricao = descricao;
    if (responsavel !== undefined) updateData.responsavel = responsavel;
    if (data_inicio !== undefined) updateData.data_inicio = data_inicio;
    if (data_expectativa !== undefined) updateData.data_expectativa = data_expectativa;
    if (concluida !== undefined) updateData.concluida = concluida;
    if (ordem !== undefined) updateData.ordem = ordem;

    const { data, error } = await supabase
        .from(TABLE_NAME)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Alterna o status de conclusão de uma tarefa
 */
export const toggleConcluida = async (id) => {
    // Primeiro busca o status atual
    const { data: current, error: fetchError } = await supabase
        .from(TABLE_NAME)
        .select('concluida')
        .eq('id', id)
        .single();

    if (fetchError) throw fetchError;

    // Atualiza com o status invertido
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .update({ concluida: !current.concluida })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Exclui uma tarefa (cascata exclui notas)
 */
export const remove = async (id) => {
    const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
};

export default {
    getAll,
    getByObjetivo,
    getById,
    create,
    update,
    toggleConcluida,
    remove
};
