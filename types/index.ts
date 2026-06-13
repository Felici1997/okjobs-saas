export type PersonalDetails = {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  photoUrl?: string;
  description?: string;
  postSeeking?: string;
};

export type Experience = {
  id?: string;
  jobTitle: string;
  companyName: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type Education = {
  id?: string;
  school: string;
  degree: string;
  description: string;
  startDate: string;
  endDate: string;
};

export type Skill = {
  id?: string;
  name: string;
};

export type Language = {
  id?: string;
  language: string;
  proficiency: string;
};

export type Hobby = {
  id?: string;
  name: string;
};

export type InterviewType = 'technique' | 'comportemental' | 'motivationnel';

export type Difficulty = 'debutant' | 'intermediaire' | 'avance';

export type SessionStatus = 'in_progress' | 'completed' | 'abandoned' | 'timeout';

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  plan: string;
  created_at: string;
};

export type CVDocument = {
  id: string;
  user_id: string;
  title: string;
  is_active: boolean;
  personal_details: PersonalDetails;
  experiences: Experience[];
  educations: Education[];
  skills: Skill[];
  languages: Language[];
  hobbies: Hobby[];
  created_at: string;
  updated_at: string;
};

export type InterviewSession = {
  id: string;
  user_id: string;
  cv_id: string | null;
  job_title: string;
  sector: string;
  interview_type: InterviewType;
  difficulty: Difficulty;
  nb_questions: number;
  timer_minutes: number;
  status: SessionStatus;
  score: number | null;
  started_at: string;
  ended_at: string | null;
};

export type InterviewMessage = {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

export type InterviewFeedback = {
  id: string;
  session_id: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  score: number;
};

export type ApiKey = {
  id: string;
  user_id: string;
  key_prefix: string;
  name: string;
  last_used_at: string | null;
  created_at: string;
  revoked: boolean;
};

export type ApiUsageLog = {
  id: string;
  api_key_id: string;
  endpoint: string;
  method: string;
  status: number;
  ip: string;
  created_at: string;
};

export type InterviewConfig = {
  cvId?: string;
  jobTitle: string;
  sector: string;
  interviewType: InterviewType;
  difficulty: Difficulty;
  nbQuestions: number;
  timerMinutes: number;
};
