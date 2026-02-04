
import { createClient } from '@supabase/supabase-js';

const supabaseUrl: string = 'https://ttamqaudwtzikspmqjvk.supabase.co';
const supabaseAnonKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0YW1xYXVkd3R6aWtzcG1xanZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjg4NDUsImV4cCI6MjA4NTcwNDg0NX0.0mZxj2QxaCkd_3yFj5WbQiqPc_uuy1x9W2Gmu-WZVww';

const isConfigured = supabaseUrl !== '' && supabaseAnonKey !== '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const BUCKET_NAME = 'product-images';
export const TABLE_NAME = 'products';
export const SUPABASE_CONFIGURED = isConfigured;
