import { supabase } from './supabaseClient';

const TABLE_NAME = 'flop_responsaveis';

/**
 * Busca todos os responsáveis
 */
export const getAll = async () => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('nome', { ascending: true });

    if (error) throw error;
    return data;
};

/**
 * Busca um responsável por ID
 */
export const getById = async (id) => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
};

/**
 * Cria um novo responsável
 */
export const create = async (nome) => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert({ nome })
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Atualiza um responsável
 */
export const update = async (id, nome) => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .update({ nome })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Exclui um responsável
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
    getById,
    create,
    update,
    remove
};
