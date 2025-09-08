import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// User operations
export const userService = {
  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUser(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('userId', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateUser(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('userId', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Ritual operations
export const ritualService = {
  async createRitual(ritualData) {
    const { data, error } = await supabase
      .from('rituals')
      .insert([ritualData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserRituals(userId) {
    const { data, error } = await supabase
      .from('rituals')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateRitual(ritualId, updates) {
    const { data, error } = await supabase
      .from('rituals')
      .update(updates)
      .eq('ritualId', ritualId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteRitual(ritualId) {
    const { error } = await supabase
      .from('rituals')
      .delete()
      .eq('ritualId', ritualId);
    
    if (error) throw error;
  }
};

// Session operations
export const sessionService = {
  async createSession(sessionData) {
    const { data, error } = await supabase
      .from('sessions')
      .insert([sessionData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserSessions(userId) {
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        rituals (
          name,
          description
        )
      `)
      .eq('userId', userId)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getSessionsByRitual(ritualId) {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('ritualId', ritualId)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};

// Badge operations
export const badgeService = {
  async getAllBadges() {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async getUserBadges(userId) {
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badges (
          name,
          description,
          imageUrl
        )
      `)
      .eq('userId', userId);
    
    if (error) throw error;
    return data;
  },

  async awardBadge(userId, badgeId) {
    const { data, error } = await supabase
      .from('user_badges')
      .insert([{ userId, badgeId, earnedAt: new Date().toISOString() }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
