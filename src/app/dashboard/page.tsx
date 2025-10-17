import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard - ApunteQuiz',
  description: 'Panel de control de ApunteQuiz',
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [quizzesResult, documentsResult, questionsResult, recentQuizzes] = await Promise.all([
    supabase.from('quizzes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('documents').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('questions')
      .select('quiz_id!inner(user_id)', { count: 'exact', head: true })
      .eq('quiz_id.user_id', user.id),
    supabase
      .from('quizzes')
      .select('id, title, education_level, created_at, total_questions')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
  ]);

  return (
    <DashboardClient 
      user={user}
      statsData={{
        quizzes: quizzesResult.count || 0,
        documents: documentsResult.count || 0,
        questions: questionsResult.count || 0
      }}
      recentQuizzes={recentQuizzes.data || []}
    />
  );
}
