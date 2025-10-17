import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import type { Metadata } from 'next';
import QuizDetailClient from './QuizDetailClient';

export const metadata: Metadata = {
  title: 'Detalles del Quiz - ApunteQuiz',
  description: 'Ver detalles del quiz',
};

interface QuizDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function QuizDetailPage({ params }: QuizDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (quizError || !quiz) {
    notFound();
  }

  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('quiz_id', id)
    .order('order_index', { ascending: true });

  return (
    <QuizDetailClient 
      quiz={quiz}
      questions={questions || []}
      userId={user.id}
    />
  );
}
