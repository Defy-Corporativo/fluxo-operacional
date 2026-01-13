import { supabase } from './supabaseClient';

const TABLE_NAME = 'flop_projetos';

/**
 * Busca todos os projetos
 */
export const getAll = async () => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(`
            *,
            frente:flop_frentes_estrategicas(id, codigo, descricao)
        `)
        .order('codigo', { ascending: true });

    if (error) throw error;
    return data;
};

/**
 * Busca projetos por frente
 */
export const getByFrente = async (frenteId) => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('frente_id', frenteId)
        .order('codigo', { ascending: true });

    if (error) throw error;
    return data;
};

/**
 * Busca um projeto por ID
 */
export const getById = async (id) => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(`
            *,
            frente:flop_frentes_estrategicas(id, codigo, descricao)
        `)
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
};

/**
 * Cria um novo projeto (código gerado automaticamente pelo trigger)
 */
export const create = async ({ descricao, frente_id }) => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert({ descricao, frente_id })
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Atualiza um projeto
 */
export const update = async (id, { descricao, frente_id }) => {
    const updateData = {};
    if (descricao !== undefined) updateData.descricao = descricao;
    if (frente_id !== undefined) updateData.frente_id = frente_id;

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
 * Exclui um projeto (cascata exclui objetivos e tarefas)
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
    getByFrente,
    getById,
    create,
    update,
    remove
};
